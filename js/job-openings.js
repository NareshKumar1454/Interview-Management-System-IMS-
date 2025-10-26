// Job Openings page script: render jobs, filters, search, pagination, modal
const JOBS = [
  {id:1,title:'Senior Frontend Developer',dept:'Engineering',location:'San Francisco, CA',level:'Mid-Senior',type:'Full-Time',tags:['React','TypeScript'],posted:'2 days ago',desc:'Work on our core web app using React and TypeScript.'},
  {id:2,title:'Product Manager',dept:'Product',location:'Remote',level:'Senior',type:'Full-Time',tags:['Strategy','Analytics'],posted:'1 week ago',desc:'Lead product initiatives and roadmap.'},
  {id:3,title:'UI/UX Designer',dept:'Design',location:'New York, NY',level:'Mid',type:'Contract',tags:['Figma','Prototyping'],posted:'3 days ago',desc:'Design delightful user interfaces.'},
  {id:4,title:'DevOps Engineer',dept:'Engineering',location:'Austin, TX',level:'Mid',type:'Full-Time',tags:['AWS','CI/CD'],posted:'1 week ago',desc:'Maintain cloud infrastructure and pipelines.'},
  {id:5,title:'Marketing Intern',dept:'Marketing',location:'Austin, TX',level:'Entry',type:'Internship',tags:['Social Media'],posted:'5 days ago',desc:'Support marketing campaigns.'},
  {id:6,title:'Data Scientist',dept:'Data',location:'San Francisco, CA',level:'Mid',type:'Full-Time',tags:['Python','ML'],posted:'2 days ago',desc:'Build models to power recommendations.'}
];

const PAGE_SIZE = 4;
let state = {query:'',dept:'',level:'',location:'',type:'',page:1,filtered:[]};

document.addEventListener('DOMContentLoaded', ()=>{
  populateFilters();
  document.getElementById('searchInput').addEventListener('input', onFilterChange);
  ['deptFilter','levelFilter','locationFilter','typeFilter'].forEach(id=>document.getElementById(id).addEventListener('change', onFilterChange));
  render();

  // modal
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('applyBtn').addEventListener('click', ()=>{
    closeModal(); alert('Apply clicked (demo) - please sign in/signup to apply.');
    window.location.href='signin.html';
  });
});

function populateFilters(){
  const depts = Array.from(new Set(JOBS.map(j=>j.dept)));
  const levels = Array.from(new Set(JOBS.map(j=>j.level)));
  const locs = Array.from(new Set(JOBS.map(j=>j.location)));
  const types = Array.from(new Set(JOBS.map(j=>j.type)));
  const map = {deptFilter:depts, levelFilter:levels, locationFilter:locs, typeFilter:types};
  Object.entries(map).forEach(([id,arr])=>{
    const sel = document.getElementById(id);
    arr.forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; sel.appendChild(o); });
  });
}

function onFilterChange(){
  state.query = document.getElementById('searchInput').value.trim().toLowerCase();
  state.dept = document.getElementById('deptFilter').value;
  state.level = document.getElementById('levelFilter').value;
  state.location = document.getElementById('locationFilter').value;
  state.type = document.getElementById('typeFilter').value;
  state.page = 1;
  render();
}

function render(){
  const area = document.getElementById('jobsArea'); area.innerHTML='';
  state.filtered = JOBS.filter(j=>{
    if(state.query){ const q=state.query; if(!(j.title.toLowerCase().includes(q) || j.tags.join(' ').toLowerCase().includes(q) || j.dept.toLowerCase().includes(q))) return false; }
    if(state.dept && j.dept!==state.dept) return false;
    if(state.level && j.level!==state.level) return false;
    if(state.location && j.location!==state.location) return false;
    if(state.type && j.type!==state.type) return false;
    return true;
  });
  const total = state.filtered.length;
  const pages = Math.max(1, Math.ceil(total/PAGE_SIZE));
  const start = (state.page-1)*PAGE_SIZE;
  const pageItems = state.filtered.slice(start,start+PAGE_SIZE);
  pageItems.forEach(j=>area.appendChild(renderJobCard(j)));
  renderPagination(pages);
}

function renderJobCard(j){
  const card = document.createElement('div'); card.className='job-card';
  const top = document.createElement('div'); top.className='top';
  const h = document.createElement('h3'); h.textContent=j.title; const lbl = document.createElement('div'); lbl.className='job-type'; lbl.textContent=j.type;
  top.appendChild(h); top.appendChild(lbl);
  const meta = document.createElement('div'); meta.className='job-meta'; meta.innerHTML = `<strong>${j.dept}</strong> • ${j.location} • ${j.level} • Posted ${j.posted}`;
  const tags = document.createElement('div'); tags.className='job-tags'; j.tags.forEach(t=>{ const s=document.createElement('span'); s.className='tag'; s.textContent=t; tags.appendChild(s); });
  const actions = document.createElement('div'); actions.className='actions'; const btn = document.createElement('button'); btn.className='btn primary'; btn.textContent='View Details'; btn.addEventListener('click', ()=>openModal(j)); actions.appendChild(btn);
  card.appendChild(top); card.appendChild(meta); card.appendChild(tags); card.appendChild(actions);
  return card;
}

function renderPagination(pages){
  const p = document.getElementById('pagination'); p.innerHTML='';
  for(let i=1;i<=pages;i++){
    const btn = document.createElement('button'); btn.textContent=i; if(i===state.page) btn.className='active'; btn.addEventListener('click', ()=>{ state.page=i; render(); }); p.appendChild(btn);
  }
}

function openModal(job){
  document.getElementById('jobModal').setAttribute('aria-hidden','false');
  document.getElementById('modalTitle').textContent = job.title;
  document.getElementById('modalMeta').textContent = `${job.dept} • ${job.location} • ${job.level} • ${job.type}`;
  document.getElementById('modalDesc').textContent = job.desc;
}
function closeModal(){ document.getElementById('jobModal').setAttribute('aria-hidden','true'); }
