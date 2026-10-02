export type SearchPlanPartyFocus = 'friends' | 'couple' | 'family' | 'solo' | 'other';

export function classifySearchPlanParty(peopleType: string): SearchPlanPartyFocus {
  const text = peopleType.trim();
  if (/亲子|带娃|儿童|小孩/.test(text)) return 'family';
  if (/情侣|夫妻|两口/.test(text)) return 'couple';
  if (/单人|独自|一个人|一人行/.test(text)) return 'solo';
  if (/好友|朋友|结伴|闺蜜/.test(text)) return 'friends';
  return 'other';
}
