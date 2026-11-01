"use strict";
const $ = (selector) => document.querySelector(selector);
const fmt = (value) => {
  if (!value) return "Date not supplied";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "Date not supplied" : new Intl.DateTimeFormat("en-PH",{timeZone:"Asia/Manila",day:"numeric",month:"short",year:"numeric"}).format(d);
};
const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};
const safeUrl = (value) => {
  try { const u = new URL(value); return u.protocol === "https:" || u.protocol === "http:" ? u.href : null; }
  catch { return null; }
};
function setupGlobal() {
  const year = $("#year"); if(year) year.textContent = String(new Date().getFullYear());
  const toggle = $(".menu-toggle"), nav = $("#site-nav");
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open"); toggle.setAttribute("aria-expanded",String(open));
  });
  nav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { nav.classList.remove("open"); toggle?.setAttribute("aria-expanded","false"); }));
}
async function jsonFile(path) {
  const response = await fetch(path, {cache:"no-store"});
  if(!response.ok) throw new Error("Unable to load " + path);
  return response.json();
}
function renderNews(items) {
  const list = $("#news-list"); if(!list) return;
  list.replaceChildren();
  if(!items.length) {
    const box=el("div","empty-state"), h=el("h3",null,"No matching updates"), p=el("p",null,"Try a different search or category. If this site has just been installed, run the news updater from GitHub Actions.");
    box.append(h,p); list.append(box); return;
  }
  items.forEach(item => {
    const url=safeUrl(item.url); if(!url) return;
    const card=el("article","news-card"), top=el("div","card-top"), cat=el("span","category",item.category||"Education"), date=el("span",null,fmt(item.published)), title=el("h3"), a=el("a",null,item.title||"Untitled update"), byline=el("div","byline",(item.source||"Publication")+" · Discovered via "+(item.via||"RSS"));
    a.href=url; a.target="_blank"; a.rel="noopener noreferrer"; a.setAttribute("aria-label",(item.title||"View update")+" (opens original source in a new tab)");
    top.append(cat,date); title.append(a); card.append(top,title,byline); list.append(card);
  });
}
async function setupNews() {
  if(!$("#news-list")) return;
  let items=[];
  try {
    const data=await jsonFile("data/news.json");
    items=(Array.isArray(data.items)?data.items:[]).filter(item=>safeUrl(item.url));
    const label=$("#refresh-label");
    if(label) label.textContent=data.updated_at ? "Feed checked " + fmt(data.updated_at) : "Awaiting first automatic update";
    if(!items.length){ renderNews([]); return; }
  } catch(error) { renderNews([]); const label=$("#refresh-label"); if(label) label.textContent="Feed currently unavailable"; return; }
  let category="All", query="";
  const update=()=>renderNews(items.filter(item=>(category==="All"||item.category===category)&&((item.title||"")+" "+(item.source||"")).toLowerCase().includes(query)));
  $("#filters")?.querySelectorAll("button").forEach(button => button.addEventListener("click",()=>{
    category=button.dataset.category;
    $("#filters").querySelectorAll("button").forEach(b=>{const selected=b===button;b.classList.toggle("active",selected);b.setAttribute("aria-pressed",String(selected));});
    update();
  }));
  $("#news-search")?.addEventListener("input",event=>{query=event.target.value.trim().toLowerCase();update();});
  update();
}
async function setupArticles() {
  const grid=$("#article-list"), articleBody=$("#article-body");
  if(!grid&&!articleBody) return;
  try {
    const articles=await jsonFile("data/articles.json");
    if(!Array.isArray(articles)) throw new Error("Invalid article list");
    if(grid){
      grid.replaceChildren();
      articles.forEach(article=>{
        const card=el("article","article-card"), tag=el("span","article-category",article.category||"Analysis"), title=el("h3",null,article.title), summary=el("p",null,article.summary), read=el("a",null,"Read article →");
        read.href="article.html?slug="+encodeURIComponent(article.slug);card.append(tag);
        if(article.status==="sample-draft")card.append(el("span","draft-chip","Sample draft · editorial preview"));
        card.append(title,summary,read);grid.append(card);
      });
    }
    if(articleBody){
      const slug=new URLSearchParams(location.search).get("slug"), article=articles.find(item=>item.slug===slug);
      if(!article){ articleBody.replaceChildren(el("h2",null,"Article not found"),el("p",null,"Return to the homepage to browse current articles."));return; }
      document.title=article.title+" | SAGERPRO";
      $("#article-tag").textContent="SAGERPRO / "+(article.category||"Analysis");
      $("#article-title").textContent=article.title;
      $("#article-summary").textContent=article.summary;
      $("#article-meta").textContent=article.status==="sample-draft"?"Editorial preview · Not a formally published article":"Published "+fmt(article.date);
      articleBody.replaceChildren();
      if(article.status==="sample-draft") articleBody.append(el("div","article-notice","DEMONSTRATION DRAFT — This article is sample content for the new SAGERPRO website. It should be reviewed, revised, and approved before being treated as a published editorial article."));
      (article.blocks||[]).forEach(block => {if(block.type==="h2")articleBody.append(el("h2",null,block.text));else if(block.type==="p")articleBody.append(el("p",null,block.text));});
    }
  } catch(error) {
    if(grid)grid.replaceChildren(el("p",null,"Articles are temporarily unavailable."));
    if(articleBody)articleBody.replaceChildren(el("p",null,"Unable to load this article right now."));
  }
}
setupGlobal(); setupNews(); setupArticles();
