const base = 'http://localhost:5173';
const userId = 'user-roamly-demo';
const headers = {
  'Content-Type': 'application/json',
  'x-user-id': userId,
};

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
  const payload = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, payload };
}

const sessionId = `e2e-${Date.now()}`;
const fullHistory = [
  { role: 'assistant', content: '## 成都方案\n第一版内容' },
  { role: 'user', content: '预算500以内' },
  { role: 'assistant', content: '## 调整版\n更省钱的方案' },
];

const results = [];

function assert(name, condition, detail = '') {
  results.push({ name, pass: Boolean(condition), detail });
  console.log(`${condition ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
}

// 1. Create session (map generate)
const create = await request('/api/user/ai-sessions', {
  method: 'POST',
  body: JSON.stringify({
    id: sessionId,
    trigger: 'map_click',
    initialQuery: '成都周末',
    location: { name: '成都', lng: 104.06, lat: 30.67 },
    fullHistory: [fullHistory[0]],
  }),
});
assert('create session', create.ok && create.payload?.item?.isSaved === false);

// 2. Save as 测试方案
const save = await request(`/api/user/ai-sessions/${sessionId}`, {
  method: 'PATCH',
  body: JSON.stringify({
    title: '测试方案',
    isPublic: false,
    isSaved: true,
    fullHistory,
    initialQuery: '成都周末',
    location: { name: '成都', lng: 104.06, lat: 30.67 },
  }),
});
assert('save plan', save.ok && save.payload?.item?.title === '测试方案');

// 3. History sidebar data
const history = await request('/api/user/ai-sessions');
const historyItem = history.payload?.items?.find((item) => item.id === sessionId);
assert('history has entry', Boolean(historyItem));

// 4. My plans page data
const plans = await request('/api/user/plans');
const planItem = plans.payload?.items?.find((item) => item.id === sessionId);
assert('plans has card', planItem?.title === '测试方案');

// 5. Restore conversation from history entry
assert(
  'history restores full conversation',
  historyItem?.fullHistory?.length === 3 &&
    historyItem.fullHistory[2]?.content.includes('更省钱'),
  `turns=${historyItem?.fullHistory?.length}`,
);

// 6. Toggle public
const pub = await request(`/api/user/plans/${sessionId}`, {
  method: 'PATCH',
  body: JSON.stringify({ isPublic: true }),
});
assert('toggle public', pub.ok && pub.payload?.item?.isPublic === true);

// 7. Delete from my plans (should unsave, keep history)
const del = await request(`/api/user/plans/${sessionId}`, { method: 'DELETE' });
assert('delete ok', del.ok && del.payload?.ok === true);

const dbRaw = await fetch(`${base}/api/user/ai-sessions/${sessionId}`, { headers }).then((r) =>
  r.json(),
);
assert('session detail after delete', Boolean(dbRaw?.item?.id === sessionId));
assert('session unsaved after delete', dbRaw?.item?.isSaved === false);
assert(
  'session history preserved after delete',
  dbRaw?.item?.fullHistory?.length === 3,
  `turns=${dbRaw?.item?.fullHistory?.length}`,
);

const historyAfter = await request('/api/user/ai-sessions');
const historyItemAfter = historyAfter.payload?.items?.find((item) => item.id === sessionId);
assert('history kept after delete', Boolean(historyItemAfter), `found=${Boolean(historyItemAfter)}`);
assert(
  'history is unsaved after delete',
  historyItemAfter?.isSaved === false,
  `isSaved=${historyItemAfter?.isSaved}`,
);
assert(
  'history conversation preserved',
  historyItemAfter?.fullHistory?.length === 3,
  `turns=${historyItemAfter?.fullHistory?.length}`,
);

const plansAfter = await request('/api/user/plans');
const planAfter = plansAfter.payload?.items?.find((item) => item.id === sessionId);
assert('removed from my plans', !planAfter);

const failed = results.filter((item) => !item.pass);
process.exit(failed.length === 0 ? 0 : 1);
