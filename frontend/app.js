const API="/api";
let token=localStorage.getItem("token");
let currentUser=JSON.parse(localStorage.getItem("user")||"null");

const $=s=>document.querySelector(s);
function toast(msg){const t=$("#toast");t.textContent=msg;t.style.display="block";setTimeout(()=>t.style.display="none",2800)}
function toggleNav(){$("#nav").classList.toggle("open")}
function authHeaders(){return token?{Authorization:"Bearer "+token,"Content-Type":"application/json"}:{"Content-Type":"application/json"}}

async function api(path,options={}){
  const r=await fetch(API+path,{...options,headers:{...authHeaders(),...(options.headers||{})}});
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.message||"Something went wrong");
  return data;
}

function openAuth(mode="login"){
  $("#authModal").classList.remove("hidden");
  $("#authContent").innerHTML=mode==="login"?loginHTML():registerHTML();
}
function closeModal(){$("#authModal").classList.add("hidden")}
function loginHTML(){return `<h2>Welcome back</h2><p>Login to participate in your community.</p><form id="loginForm" class="form"><input name="email" type="email" placeholder="Email" required><input name="password" type="password" placeholder="Password" required><button class="btn">Login</button><small>New here? <a href="#" onclick="openAuth('register')">Create account</a></small></form>`}
function registerHTML(){return `<h2>Create your account</h2><form id="registerForm" class="form"><input name="name" placeholder="Full name" required><input name="email" type="email" placeholder="Email" required><input name="phone" placeholder="Phone (optional)"><input name="password" type="password" placeholder="Password (6+ characters)" required><button class="btn">Register</button><small>Already registered? <a href="#" onclick="openAuth('login')">Login</a></small></form>`}

document.addEventListener("submit",async e=>{
  if(e.target.id==="loginForm"){
    e.preventDefault(); const f=new FormData(e.target);
    try{const d=await api("/auth/login",{method:"POST",body:JSON.stringify(Object.fromEntries(f))}); saveSession(d); closeModal(); toast("Login successful"); renderDashboard();}catch(err){toast(err.message)}
  }
  if(e.target.id==="registerForm"){
    e.preventDefault(); const f=new FormData(e.target);
    try{const d=await api("/auth/register",{method:"POST",body:JSON.stringify(Object.fromEntries(f))}); saveSession(d); closeModal(); toast("Account created"); renderDashboard();}catch(err){toast(err.message)}
  }
  if(e.target.id==="problemForm"){
    e.preventDefault();
    if(!token){toast("Please login before reporting a problem.");openAuth("login");return}
    const f=new FormData(e.target);
    try{await api("/problems",{method:"POST",body:JSON.stringify(Object.fromEntries(f))});e.target.reset();$("#problemMsg").textContent="Problem submitted successfully.";toast("Problem reported");loadProblems();}catch(err){$("#problemMsg").textContent=err.message}
  }
  if(e.target.id==="resourceForm"){
    e.preventDefault();
    if(!token){toast("Please login before adding a resource.");openAuth("login");return}
    const f=new FormData(e.target);
    try{await api("/resources",{method:"POST",body:JSON.stringify(Object.fromEntries(f))});e.target.reset();closeResourceForm();toast("Resource added");loadResources();}catch(err){$("#resourceMsg").textContent=err.message}
  }
  if(e.target.id==="commentForm"){
    e.preventDefault(); const f=new FormData(e.target);
    try{await api("/comments",{method:"POST",body:JSON.stringify(Object.fromEntries(f))}); toast("Comment added"); loadComments(f.get("problem"));}catch(err){toast(err.message)}
  }
});

function saveSession(d){token=d.token;currentUser=d.user;localStorage.setItem("token",token);localStorage.setItem("user",JSON.stringify(currentUser));}
function logout(){token=null;currentUser=null;localStorage.clear();renderDashboard();toast("Logged out")}

async function loadProblems(){
  const q=encodeURIComponent($("#problemSearch")?.value||"");
  try{
    const data=await api("/problems?q="+q); $("#problemGrid").innerHTML=data.length?data.map(problemCard).join(""):`<div class="empty">No problems found.</div>`;
    $("#statProblems").textContent=data.length;
    $("#statResolved").textContent=data.filter(x=>x.status==="Resolved").length;
  }catch(err){$("#problemGrid").innerHTML=`<div class="empty">${err.message}</div>`}
}
function problemCard(p){
  const safeTitle=escapeHTML(p.title), safeDesc=escapeHTML(p.description);
  return `<article class="card"><span class="tag">${escapeHTML(p.category)}</span><span class="status ${p.status.replace(" ","-")}">${p.status}</span><h3>${safeTitle}</h3><p>${safeDesc}</p><p>📍 ${escapeHTML(p.location)}<br>👤 ${escapeHTML(p.reportedBy?.name||"Community member")}</p>${p.image?`<img src="${escapeAttr(p.image)}" alt="Problem image" style="width:100%;max-height:180px;object-fit:cover;border-radius:12px">`:""}<div class="card-actions"><button class="ghost" onclick="likeProblem('${p._id}')">❤️ ${p.likes}</button><button class="ghost" onclick="showComments('${p._id}')">💬 Comments</button>${currentUser?.role==="admin"?`<button class="ghost" onclick="changeStatus('${p._id}')">⚙ Status</button>`:""}</div><div id="comments-${p._id}"></div></article>`
}
async function likeProblem(id){try{await api("/problems/"+id+"/like",{method:"PUT"});loadProblems()}catch(e){toast(e.message)}}
async function changeStatus(id){const s=prompt("Enter: Reported, In Progress, or Resolved");if(!s)return;try{await api("/problems/"+id+"/status",{method:"PUT",body:JSON.stringify({status:s})});loadProblems()}catch(e){toast(e.message)}}
async function showComments(id){const box=$("#comments-"+id);box.innerHTML=`<div class="comments"><div id="list-${id}">Loading...</div>${token?`<form id="commentForm" class="form"><input type="hidden" name="problem" value="${id}"><input name="text" placeholder="Write a supportive comment..." required><button class="btn small">Comment</button></form>`:`<small>Login to comment.</small>`}</div>`;loadComments(id)}
async function loadComments(id){try{const cs=await api("/comments/"+id);$("#list-"+id).innerHTML=cs.length?cs.map(c=>`<p><b>${escapeHTML(c.user?.name||"User")}:</b> ${escapeHTML(c.text)}</p>`).join(""):"<p>No comments yet.</p>"}catch(e){toast(e.message)}}

async function loadResources(){
  const q=encodeURIComponent($("#resourceSearch")?.value||"");
  try{const data=await api("/resources?q="+q);$("#resourceGrid").innerHTML=data.length?data.map(resourceCard).join(""):`<div class="empty">No resources found.</div>`;$("#statResources").textContent=data.length}catch(e){$("#resourceGrid").innerHTML=`<div class="empty">${e.message}</div>`}
}
function resourceCard(r){return `<article class="card"><span class="tag">${escapeHTML(r.category)}</span><h3>${escapeHTML(r.title)}</h3><p>${escapeHTML(r.description)}</p><p>📍 ${escapeHTML(r.location)}${r.contact?`<br>☎ ${escapeHTML(r.contact)}`:""}</p>${r.website?`<a href="${escapeAttr(r.website)}" target="_blank" rel="noopener">Visit website →</a>`:""}</article>`}
function openResourceForm(){$("#resourceModal").classList.remove("hidden")}
function closeResourceForm(){$("#resourceModal").classList.add("hidden")}

function renderDashboard(){
  const box=$("#dashboardBox");
  if(!currentUser){box.innerHTML=`<div class="profile"><h3>Join the community</h3><p>Login or create an account to report problems, comment and add resources.</p><button class="btn" onclick="openAuth('register')">Create Account</button></div>`;return}
  box.innerHTML=`<div class="profile"><h3>👋 Welcome, ${escapeHTML(currentUser.name)}</h3><p><b>Email:</b> ${escapeHTML(currentUser.email)}<br><b>Role:</b> ${currentUser.role}</p><button class="btn outline" onclick="logout()">Logout</button>${currentUser.role==="admin"?`<p><b>Admin:</b> You can update problem statuses from the Problems section.</p>`:""}</div>`;
}
function debouncedProblems(){clearTimeout(window.pt);window.pt=setTimeout(loadProblems,350)}
function debouncedResources(){clearTimeout(window.rt);window.rt=setTimeout(loadResources,350)}
function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function escapeAttr(s){return escapeHTML(s).replace(/`/g,"&#096;")}

window.addEventListener("DOMContentLoaded",()=>{loadProblems();loadResources();renderDashboard()});
