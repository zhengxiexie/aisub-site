// 生成 1200x630 的 Open Graph 卡片。用官网自身的设计令牌渲染, 保证视觉一致。
// 用法: node tools/make-og.js
// 依赖: puppeteer（全局或本地安装均可, 会自动回退到 require.resolve）
const fs = require('fs');
const path = require('path');

function loadPuppeteer() {
  try { return require('puppeteer'); } catch (e) { /* 继续回退 */ }
  const g = require('child_process').execSync('npm root -g', { encoding: 'utf8' }).trim();
  return require(path.join(g, 'puppeteer'));
}
const puppeteer = loadPuppeteer();

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'og-image.png');

(async () => {
  const tpl = fs.readFileSync(path.join(__dirname, 'og-template.html'), 'utf8');
  const logo = 'file://' + path.join(ROOT, 'assets', 'logo.png');
  const html = tpl.replace('__LOGO__', logo);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--force-color-profile=srgb', '--font-render-hinting=none'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  // 等字体真正就绪, 否则截图会回退到系统默认字体
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 400));

  // 断言: 任何元素溢出画布都会让平台裁切, 属于静默故障
  const overflow = await page.evaluate(() => {
    const bad = [];
    document.querySelectorAll('body *').forEach(n => {
      const r = n.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      if (n.closest('.aurora') || n.closest('.grid') || n.classList.contains('bg-2')) return;
      if (r.right > 1201 || r.bottom > 631 || r.left < -1 || r.top < -1) {
        bad.push(n.tagName + '.' + n.className + ' R' + Math.round(r.right) + ' B' + Math.round(r.bottom));
      }
    });
    return bad;
  });
  if (overflow.length) {
    console.error('OVERFLOW detected:\n  ' + overflow.join('\n  '));
    await browser.close();
    process.exit(1);
  }

  await page.screenshot({ path: OUT, type: 'png' });
  await browser.close();

  const buf = fs.readFileSync(OUT);
  const dims = buf.readUInt32BE(16);
  console.log('wrote ' + path.relative(ROOT, OUT));
  console.log('size  ' + dims + 'x' + buf.readUInt32BE(20));
  console.log('bytes ' + (buf.length / 1024).toFixed(1) + ' KB');
})();