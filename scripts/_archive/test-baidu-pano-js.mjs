import { chromium } from 'playwright';
import http from 'node:http';

const AK = 'E4805d16520de693a3fe707cdc962045';
const html = `<!DOCTYPE html><html><body style="margin:0">
<div id="p" style="width:900px;height:600px"></div>
<script>
window.initBaiduPano = function() {
  var el = document.getElementById('p');
  var pano = new BMap.Panorama(el);
  new BMap.PanoramaService().getPanoramaByLocation(new BMap.Point(104.0665, 30.5728), function(data) {
    if (data) pano.setId(data.id);
  });
};
</script>
<script src="https://api.map.baidu.com/api?v=3.0&ak=${AK}&callback=initBaiduPano"></script>
</body></html>`;

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
const urls = [];
page.on('response', (r) => {
  const u = r.url();
  if (/panorama|pdata|pano|street/i.test(u)) urls.push(r.status() + ' ' + u.slice(0, 150));
});
await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForTimeout(12000);
console.log('urls', urls.slice(0, 20));
await page.screenshot({ path: 'scripts/baidu-pano-shot.png' });
console.log('screenshot saved');
server.close();
await browser.close();
