function isPlaceholderMapCredential(value) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  const placeholderHints = [
    "your_",
    "your-",
    "pk.your",
    "sk-your",
    "sk-your_",
    "example",
    "changeme",
    "change-me",
    "placeholder",
    "xxx",
    "你的",
    "安全密钥",
    "token_here"
  ];
  return placeholderHints.some((hint) => normalized.includes(hint));
}
function normalizeMapCredential(value) {
  if (!value || isPlaceholderMapCredential(value)) {
    return void 0;
  }
  return value;
}
export {
  normalizeMapCredential as n
};
