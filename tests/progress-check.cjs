// Start Vite on port 5173; provide Playwright through NODE_PATH or PLAYWRIGHT_MODULE.
require('node:fs').mkdirSync('scratch', { recursive: true });
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
for(const reading of [true,false]){
const page=await browser.newPage({viewport:{width:375,height:812},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(value=>{localStorage.setItem('blog_reading_mode',String(value));localStorage.setItem('blog_theme','light');},reading);
await page.route('**/api/**',route=>route.fulfill({json:route.request().url().endsWith('/posts')?[{id:1,title:'Long article',slug:'long',tag:'data',body:[0,1,2,3].map(i=>`<h${i===1?3:2} id="duplicate">Section ${i+1}</h${i===1?3:2}>`+'<p>Readable content for checking scroll position and progress on a small screen.</p>'.repeat(12)).join('')+'<img src="x" onerror="window.xss=true">'}]:[]}));
await page.goto('http://127.0.0.1:5173/blog/long');
await page.getByRole('progressbar',{name:'Reading progress'}).waitFor();
await page.waitForTimeout(150);
assert.equal(await page.getByRole('progressbar').getAttribute('value'),'0');
await page.getByText('Contents · 4 sections',{exact:true}).click();
const links=page.getByRole('navigation',{name:'Table of contents'}).getByRole('link');
assert.equal(await links.count(),4);
assert.equal(new Set(await links.evaluateAll(els=>els.map(el=>el.hash))).size,4);
await links.filter({hasText:'Section 3'}).click();
await page.waitForTimeout(150);
const value=Number(await page.getByRole('progressbar').getAttribute('value'));
assert.ok(value>0&&value<100,`mid-progress ${reading}: ${value}`);
const bounds=await page.evaluate(()=>({heading:[...document.querySelectorAll('.post-body h2')].find(el=>el.textContent==='Section 3').getBoundingClientRect().top,toolbar:document.querySelector('.article-progress-header').getBoundingClientRect().bottom}));
assert.ok(bounds.heading>=bounds.toolbar-1,JSON.stringify(bounds));
assert.equal(await page.locator('.article-tools').evaluate(el=>getComputedStyle(el).position),'static');
assert.equal(await page.locator('.article-progress-header').evaluate(el=>!!el.closest('.game-modal-header, .view-mode-switch')),true);
assert.equal(await page.locator('.article-toc a[aria-current=location]').textContent(),'Section 3');
await page.screenshot({path:`scratch/progress-${reading?'reader':'village'}.png`});
await page.evaluate(value=>{if(value)window.scrollTo(0,document.documentElement.scrollHeight);else{const el=document.querySelector('.game-modal-body');el.scrollTop=el.scrollHeight;}},reading);
await page.waitForTimeout(150);
assert.equal(await page.getByRole('progressbar').getAttribute('value'),'100');
assert.equal(await page.evaluate(()=>!!window.xss),false);
assert.deepEqual(errors,[]);
console.log(`PASS ${reading?'reader':'village'}: 0→middle→100%, heading jump, current section, duplicate heading IDs, XSS`);
await page.close();
}
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
