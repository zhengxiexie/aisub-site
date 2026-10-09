// 校验各语言字典的 key 是否与 en 完全一致
// 用法: node check-locales.js
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'assets/js/locales');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();

// 在 node 里模拟 window.I18N.define 收集字典
function load(file) {
  let captured = null;
  const sandbox = {
    window: { I18N: { define: (code, table) => { captured = { code, table }; } } }
  };
  const src = fs.readFileSync(path.join(dir, file), 'utf8');
  const vm = require('vm');
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return captured;
}

const base = load('en.js');
const baseKeys = Object.keys(base.table).sort();
console.log('基准 en.js: ' + baseKeys.length + ' 个 key\n');

let bad = 0;
for (const f of files) {
  if (f === 'en.js') continue;
  const r = load(f);
  const keys = Object.keys(r.table).sort();
  const missing = baseKeys.filter(k => !keys.includes(k));
  const extra   = keys.filter(k => !baseKeys.includes(k));

  if (missing.length === 0 && extra.length === 0) {
    console.log('  OK   ' + f.padEnd(12) + keys.length + ' keys');
  } else {
    bad++;
    console.log('  FAIL ' + f);
    if (missing.length) console.log('       缺少: ' + missing.join(', '));
    if (extra.length)   console.log('       多出: ' + extra.join(', '));
  }
}

// 占位符一致性
console.log('\n占位符检查:');
const ph = s => (String(s).match(/%\w+%/g) || []).sort().join(',');
for (const f of files) {
  const r = load(f);
  let issues = [];
  for (const k of baseKeys) {
    if (!r.table[k]) continue;
    const a = ph(base.table[k]);
    const b = ph(r.table[k]);
    // hero.version 含 %v%，由 JS 注入，其余应完全一致
    if (k === 'hero.version') continue;
    if (a !== b) issues.push(k + ' [' + a + ' vs ' + b + ']');
  }
  if (issues.length) { bad++; console.log('  FAIL ' + f + ': ' + issues.join('; ')); }
  else console.log('  OK   ' + f);
}

console.log(bad === 0 ? '\n全部通过' : '\n有问题: ' + bad);
process.exit(bad === 0 ? 0 : 1);