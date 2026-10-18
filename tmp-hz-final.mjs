import fs from 'node:fs';

const body = {
  lng: 120.1551,
  lat: 30.2741,
  query: '杭州三天亲子游 人均2500 西溪良渚',
  searchQuery: '杭州三天亲子游 人均2500 西溪良渚',
  locationName: '杭州',
  originName: '济南市历下区中林路绿城百合花园',
};

const res = await fetch('http://127.0.0.1:4173/api/ai/generate-plan-stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
  body: JSON.stringify(body),
});
const text = await res.text();
const done = [...text.matchAll(/event: done\ndata: (\{[\s\S]*?\})\n/g)].map((m) => m[1]);
let content = '';
if (done.length) {
  try {
    content = JSON.parse(done.at(-1)).content || '';
  } catch {
    /* ignore */
  }
}
fs.writeFileSync('/tmp/hz-final.md', content);
const itinerary = content.split('【行程流水账】')[1]?.split('【蜗牛提示】')[0] || '';
const d2 = itinerary.split(/第\s*[2二]\s*天/)[1]?.split(/第\s*[3三]\s*天/)[0] || '';
const morns = [...content.matchAll(/从昨晚住宿片区[「"]([^」"]+)[」"]出发/g)].map((m) => m[1]);
const unique = [...new Set(morns)];
const hasB = /B\.\s*大交通/.test(d2);
const hasStationHop = /东站.{0,20}城站|城站.{0,20}东站/.test(d2);
const sticky = /#\s*###\s*第/.test(content);
const pass = unique.length <= 1 && !hasB && !hasStationHop && !sticky && content.length > 1800;
console.log(
  JSON.stringify(
    {
      chars: content.length,
      morns: unique,
      hasB,
      hasStationHop,
      sticky,
      pass,
      day2Head: d2.slice(0, 180).replace(/\n/g, ' '),
      introLodge: (content.match(/住宿[^\n]{0,70}/) || [])[0] || '',
    },
    null,
    2,
  ),
);
