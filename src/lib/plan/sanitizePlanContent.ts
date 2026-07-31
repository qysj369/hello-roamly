/** 从 AI 方案正文中移除经纬度等技术坐标，避免暴露给用户 */
export function sanitizePlanContentForDisplay(content: string): string {
  let text = content;

  // （经度117.12, 纬度36.65） / (经度 … , 纬度 …)
  text = text.replace(
    /[（(]\s*经度\s*[\d.]+\s*[,，、]\s*纬度\s*[\d.]+\s*[）)]/gi,
    '',
  );

  // 经度117.12, 纬度36.65（无括号）
  text = text.replace(/经度\s*[\d.]+\s*[,，、]\s*纬度\s*[\d.]+/gi, '');

  // 坐标（108.94, 34.34） / 坐标(108.94, 34.34)
  text = text.replace(/坐标\s*[（(]\s*[\d.]+\s*[,，]\s*[\d.]+\s*[）)]/gi, '');

  // 裸数字对 36.6512, 117.1201（常见于 AI 附注）
  text = text.replace(
    /(?<![\d.])(-?\d{1,3}\.\d{3,})\s*[,，]\s*(-?\d{1,3}\.\d{3,})(?![\d.])/g,
    '',
  );

  // GCJ-02 / WGS84 坐标说明句
  text = text.replace(/[（(]?\s*(?:GCJ-02|WGS84|WGS-84)\s*[）)]?[^。！？\n]*/gi, '');

  // 精确坐标（GCJ-02）：… 整句
  text = text.replace(/精确坐标[^。！？\n]*/gi, '');

  // 坐标锁定… 后的括号坐标块（保留地点名部分）
  text = text.replace(/坐标锁定/g, '路线围绕');

  // 清理多余空格与标点
  text = text.replace(/\s+([，。！？；])/g, '$1');
  text = text.replace(/([，。！？；])\s*\1+/g, '$1');
  text = text.replace(/\s{2,}/g, ' ');

  return text.trim();
}
