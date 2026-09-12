// Run with the local Vite server on port 5173 and Playwright available via NODE_PATH or PLAYWRIGHT_MODULE.
require('node:fs').mkdirSync('scratch', { recursive: true });
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
const page=await browser.newPage({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/api/**',route=>route.fulfill({json:route.request().url().endsWith('/posts')?[
{id:1,title:'Building a dashboard with React and PostgreSQL',slug:'dashboard',tag:'development',excerpt:'What I learned connecting a React interface to a PostgreSQL database.',created_at:'2026-09-12',body:'<h2>Start with the data</h2><p>A useful dashboard answers a specific question. I started with the sales data and worked backwards from the decisions people needed to make.</p>'.repeat(10)},
{id:2,title:'SQL patterns I use every week',slug:'sql',tag:'data',excerpt:'Window functions, CTEs, and queries worth keeping.',created_at:'2026-09-10',body:'<p>SQL article</p>'}
]:route.request().url().endsWith('/categories')?[{slug:'development'},{slug:'data'}]:[]}));
await page.goto('http://127.0.0.1:5173/');
await page.locator('.game-canvas').waitFor();
await page.getByRole('button',{name:'Read blog',exact:true}).click();
await page.getByRole('main').waitFor();
assert.equal(await page.locator('.game-canvas').count(),0);
assert.equal(await page.getByRole('dialog').count(),0);
await page.getByRole('textbox',{name:'Search articles'}).fill('patterns');
assert.equal(await page.locator('.scroll-item').count(),1);
await page.getByRole('textbox',{name:'Search articles'}).fill('');
await page.getByRole('button',{name:'data',exact:true}).click();
assert.equal(await page.locator('.scroll-item').count(),1);
await page.getByRole('button',{name:'all',exact:true}).click();
await page.waitForTimeout(400);
await page.screenshot({path:'scratch/reader-list-mobile.png',fullPage:true});
await page.getByRole('link').filter({hasText:'Building a dashboard'}).click();
await page.getByRole('heading',{name:'Building a dashboard with React and PostgreSQL'}).waitFor();
await page.reload();
await page.getByRole('heading',{name:'Building a dashboard with React and PostgreSQL'}).waitFor();
assert.equal(await page.locator('.game-canvas').count(),0);
await page.screenshot({path:'scratch/reader-article-mobile.png'});
await page.goBack();
await page.getByRole('textbox',{name:'Search articles'}).waitFor();
for(const [width,height] of [[320,568],[430,932],[844,390],[1280,800]]){
await page.setViewportSize({width,height});await page.waitForTimeout(150);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width}`);
}
await page.screenshot({path:'scratch/reader-list-desktop.png',fullPage:true});
await page.getByRole('button',{name:'Explore village',exact:true}).click();
await page.locator('.game-canvas').waitFor();
await page.reload();await page.locator('.game-canvas').waitFor();
assert.equal(await page.getByRole('main').count(),0);
assert.deepEqual(errors,[]);
console.log('PASS reader: canvas unmounted, semantic main, search, filters, article links, saved mode, reload, Back, 320–1280px, return to village');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
