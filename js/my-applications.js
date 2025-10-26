// My Applications page logic
const APPS_KEY = 'ims_applications';

document.addEventListener('DOMContentLoaded', ()=>{
  // require user to be signed in
  const user = getUser ? getUser() : null;
  if(!user){ window.location.href = 'signin.html'; return; }

  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const appsTableBody = document.querySelector('#appsTable tbody');
  const recommendedGrid = document.querySelector('.recommended-grid');
  const modal = document.getElementById('modal');

  // seed data if not present
  let apps = loadApps();
  if(!apps || !apps.length){
    apps = seedApplications();
    saveApps(apps);
  }

  renderTable(apps);
  renderRecommended();

  searchInput.addEventListener('input', ()=>{
    renderTable(apps, searchInput.value.trim(), statusFilter.value);
  });
  statusFilter.addEventListener('change', ()=>{
    renderTable(apps, searchInput.value.trim(), statusFilter.value);
  });

  // event delegation for actions
  appsTableBody.addEventListener('click', (e)=>{
    const row = e.target.closest('tr');
    if(!row) return;
    const id = row.dataset.id;
    if(e.target.matches('.view')){
      viewDetails(id);
    } else if(e.target.matches('.withdraw')){
      withdrawApplication(id);
    }
  });

  function loadApps(){
    try{ return JSON.parse(localStorage.getItem(APPS_KEY) || '[]'); }catch(e){return []}
  }
  function saveApps(list){
    try{ localStorage.setItem(APPS_KEY, JSON.stringify(list)); }catch(e){console.error(e)}
  }

  function renderTable(list, filterText = '', status = 'all'){
    const rows = list.filter(a=>{
      const matchesText = a.title.toLowerCase().includes(filterText.toLowerCase());
      const matchesStatus = status === 'all' ? true : a.status === status;
      return matchesText && matchesStatus;
    });

    appsTableBody.innerHTML = rows.map(a=>{
      const dt = formatDate(a.appliedDate);
      const statusClass = cssStatusClass(a.status);
      return `
        <tr data-id="${a.id}">
          <td><a class="title-link view">${escapeHtml(a.title)}</a></td>
          <td>${escapeHtml(a.department)}</td>
          <td>${dt}</td>
          <td><span class="status-badge ${statusClass}">${escapeHtml(a.status)}</span></td>
          <td class="actions"><a class="view">View Details</a><button class="withdraw">Withdraw</button></td>
        </tr>
      `;
    }).join('');
  }

  function cssStatusClass(status){
    // return safe classname
    return 'status-'+status.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  }

  function viewDetails(id){
    const app = apps.find(x=>x.id === id);
    if(!app) return;
    modal.innerHTML = `
      <div class="box">
        <h3>${escapeHtml(app.title)}</h3>
        <div class="meta">Department: ${escapeHtml(app.department)} &nbsp; • &nbsp; Applied: ${formatDate(app.appliedDate)}</div>
        <p style="margin-top:12px;color:#475569">${escapeHtml(app.description || 'No additional details available.')}</p>
        <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
          <button id="closeModal" class="btn">Close</button>
        </div>
      </div>
    `;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
    document.getElementById('closeModal').addEventListener('click', ()=>{ hideModal(); });
    modal.addEventListener('click', (ev)=>{ if(ev.target === modal) hideModal(); });
  }
  function hideModal(){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); modal.innerHTML = ''; }

  function withdrawApplication(id){
    if(!confirm('Withdraw application?')) return;
    const idx = apps.findIndex(x=>x.id === id);
    if(idx === -1) return;
    apps[idx].status = 'Withdrawn';
    saveApps(apps);
    renderTable(apps, searchInput.value.trim(), statusFilter.value);
  }

  function formatDate(d){
    try{ const dt = new Date(d); return dt.toLocaleDateString(); }catch(e){ return d }
  }

  function escapeHtml(s){ return (s+'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function seedApplications(){
    const sample = [
      { id: genId(), title:'Senior Product Designer', department:'Design & UX', appliedDate:'2025-10-15', status:'Offer Received', description:'Design leadership role focusing on product and UX improvements.' },
      { id: genId(), title:'Frontend Developer (React)', department:'Engineering', appliedDate:'2025-10-12', status:'Interview Scheduled', description:'React developer role building interactive UIs.' },
      { id: genId(), title:'Marketing Manager', department:'Marketing', appliedDate:'2025-10-10', status:'Shortlisted', description:'Lead marketing campaigns and growth initiatives.' },
      { id: genId(), title:'Data Scientist', department:'Data & Analytics', appliedDate:'2025-10-05', status:'Applied', description:'Work on models and data products.' },
      { id: genId(), title:'HR Business Partner', department:'Human Resources', appliedDate:'2025-09-28', status:'Rejected', description:'Partner with teams on HR initiatives.' }
    ];
    return sample;
  }

  function genId(){ return 'app_'+Math.random().toString(36).slice(2,9); }

  function renderRecommended(){
    const jobs = [
      { title:'Lead UX Researcher', dept:'Design & UX', tag:'Remote' },
      { title:'Senior Backend Engineer', dept:'Engineering', tag:'Hybrid' },
      { title:'Product Marketing Lead', dept:'Marketing', tag:'On-site' }
    ];
    recommendedGrid.innerHTML = jobs.map((j, i)=>{
      return `
        <div class="rec-card">
          <h4>${escapeHtml(j.title)}</h4>
          <p>Lead user research initiatives to drive product strategy.</p>
          <div class="rec-meta"><span>📁 ${escapeHtml(j.dept)}</span><span class="pill">${escapeHtml(j.tag)}</span></div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary" data-index="${i}">View & Apply</button>
          </div>
        </div>
      `;
    }).join('');

    // attach handlers
    recommendedGrid.querySelectorAll('.btn-primary').forEach(b=>{
      b.addEventListener('click', ()=>{
        const idx = Number(b.dataset.index);
        const job = jobs[idx];
        const newApp = { id: genId(), title: job.title, department: job.dept, appliedDate: (new Date()).toISOString(), status: 'Applied', description: 'Auto-applied via Recommended Jobs.' };
        apps.unshift(newApp);
        saveApps(apps);
        renderTable(apps, searchInput.value.trim(), statusFilter.value);
        alert('Application submitted for: '+job.title);
      });
    });
  }

});
