// Admin Manage Interviewers JS
document.addEventListener('DOMContentLoaded', ()=>{
  const user = JSON.parse(localStorage.getItem('ims_user') || 'null');
  if (!user || user.role !== 'Admin') { window.location.href='../signin.html'; return; }

  const LS_KEY = 'ims_interviewers';
  const pageSize = 10;
  let interviewers = loadInterviewers();
  let filtered = [...interviewers];
  let currentPage = 1;

  // elements
  const searchInput = document.getElementById('searchInput');
  const deptFilter = document.getElementById('deptFilter');
  const statusFilter = document.getElementById('statusFilter');
  const tableBody = document.querySelector('#interviewersTable tbody');
  const pageInfo = document.getElementById('pageInfo');
  const prevPage = document.getElementById('prevPage');
  const nextPage = document.getElementById('nextPage');
  const pageNumbers = document.getElementById('pageNumbers');
  const resultCount = document.getElementById('resultCount');

  const addBtn = document.getElementById('addInterviewerBtn');
  const modal = document.getElementById('interviewerModal');
  const cancelModal = document.getElementById('cancelModal');
  const interviewerForm = document.getElementById('interviewerForm');
  const modalTitle = document.getElementById('modalTitle');
  const iName = document.getElementById('iName');
  const iDept = document.getElementById('iDept');
  const iRole = document.getElementById('iRole');
  const iEmail = document.getElementById('iEmail');
  const iTotal = document.getElementById('iTotal');
  const iStatus = document.getElementById('iStatus');

  document.getElementById('logoutBtn').addEventListener('click', ()=>{ localStorage.removeItem('ims_user'); window.location.href = '../signin.html'; });

  searchInput.addEventListener('input', applyFilters);
  deptFilter.addEventListener('change', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  prevPage.addEventListener('click', ()=>{ if (currentPage>1){ currentPage--; render(); } });
  nextPage.addEventListener('click', ()=>{ if (currentPage < Math.ceil(filtered.length/pageSize)){ currentPage++; render(); } });
  addBtn.addEventListener('click', ()=>{ openModal(); });
  cancelModal.addEventListener('click', closeModal);
  interviewerForm.addEventListener('submit', onSave);

  renderMetrics();
  render();

  function loadInterviewers(){
    const raw = localStorage.getItem(LS_KEY);
    if (!raw){
      const seed = [
        {id:id(), name:'Sarah Johnson', dept:'Engineering', role:'Senior Software Engineer', email:'sarah.johnson@company.com', total:47, status:'Active', avatar:'../images/profile-avatar.png'},
        {id:id(), name:'Michael Chen', dept:'Product', role:'Product Manager', email:'michael.chen@company.com', total:32, status:'Active', avatar:'../images/profile-avatar.png'},
        {id:id(), name:'Emily Davis', dept:'Design', role:'UX Design Lead', email:'emily.davis@company.com', total:28, status:'Inactive', avatar:'../images/profile-avatar.png'},
        {id:id(), name:'David Rodriguez', dept:'Engineering', role:'Tech Lead', email:'david.rodriguez@company.com', total:54, status:'Active', avatar:'../images/profile-avatar.png'},
        {id:id(), name:'Lisa Thompson', dept:'Marketing', role:'Marketing Director', email:'lisa.thompson@company.com', total:19, status:'Active', avatar:'../images/profile-avatar.png'}
      ];
      localStorage.setItem(LS_KEY, JSON.stringify(seed));
      return seed;
    }
    try { return JSON.parse(raw); } catch(e) { return []; }
  }

  function save(){ localStorage.setItem(LS_KEY, JSON.stringify(interviewers)); renderMetrics(); }

  function applyFilters(){
    const q = (searchInput.value||'').trim().toLowerCase();
    const dept = deptFilter.value;
    const status = statusFilter.value;
    filtered = interviewers.filter(i=>{
      const matchesQ = !q || i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q);
      const matchesDept = dept==='all' || i.dept === dept;
      const matchesStatus = status==='all' || i.status === status;
      return matchesQ && matchesDept && matchesStatus;
    });
    currentPage = 1;
    render();
  }

  function renderMetrics(){
    const total = interviewers.length;
    const active = interviewers.filter(i=>i.status==='Active').length;
    // simple heuristic for interviews today; sum of those with total>0 mod 3
    const today = interviewers.reduce((acc,i)=>acc + (i.total>0 && (i.total%5===0)?1:0),0);
    document.getElementById('totalInterviewers').textContent = total;
    document.getElementById('activeInterviewers').textContent = active;
    document.getElementById('interviewsToday').textContent = today;
  }

  function render(){
    tableBody.innerHTML = '';
    const total = filtered.length;
    const start = (currentPage-1)*pageSize;
    const items = filtered.slice(start, start+pageSize);
    items.forEach(i=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="interviewer-cell"><img class="avatar" src="${i.avatar||'../images/profile-avatar.png'}" alt=""> <div><div><strong>${escape(i.name)}</strong></div><div style="font-size:13px;color:var(--muted)">ID: ${i.id}</div></div></td>
        <td><div style="font-weight:600">${escape(i.dept)}</div><div style="font-size:13px;color:var(--muted)">${escape(i.role)}</div></td>
        <td>${escape(i.email)}</td>
        <td>${i.total}</td>
        <td><span class="status-badge status-${i.status}">${i.status}</span></td>
        <td class="action-links"><a href="#" data-id="${i.id}" class="view">View</a><a href="#" data-id="${i.id}" class="edit">Edit</a><a href="#" data-id="${i.id}" class="del">Delete</a></td>
      `;
      tableBody.appendChild(tr);
    });

    pageInfo.textContent = `Showing ${Math.min(total, start+1)} to ${Math.min(total, start+items.length)} of ${total} interviewers`;
    resultCount.textContent = `Showing ${total} results`;

    // pages
    pageNumbers.innerHTML = '';
    const pageCount = Math.max(1, Math.ceil(total/pageSize));
    for (let p=1;p<=pageCount;p++){
      const btn = document.createElement('button'); btn.className='pag-btn'; btn.textContent=p; if(p===currentPage) btn.style.backgroundColor='var(--accent)'; btn.addEventListener('click', ()=>{ currentPage=p; render(); }); pageNumbers.appendChild(btn);
    }

    // actions
    document.querySelectorAll('.view').forEach(a=>a.addEventListener('click', (e)=>{ e.preventDefault(); openModal(a.dataset.id, true); }));
    document.querySelectorAll('.edit').forEach(a=>a.addEventListener('click', (e)=>{ e.preventDefault(); openModal(a.dataset.id, false); }));
    document.querySelectorAll('.del').forEach(a=>a.addEventListener('click', onDelete));
  }

  let editId = null;
  function openModal(id=null, readonly=false){
    editId = null;
    modal.setAttribute('aria-hidden','false');
    modalTitle.textContent = id ? (readonly ? 'View Interviewer' : 'Edit Interviewer') : 'Add Interviewer';
    if (id){
      const it = interviewers.find(x=>x.id===id);
      if (it){ iName.value=it.name; iDept.value=it.dept; iRole.value=it.role; iEmail.value=it.email; iTotal.value=it.total; iStatus.value=it.status; editId=id; }
    } else { interviewerForm.reset(); iTotal.value=0; iStatus.value='Active'; }
    // disable inputs when readonly
    const inputs = interviewerForm.querySelectorAll('input,select,button[type=submit]');
    inputs.forEach(inp=>{ if (readonly) inp.setAttribute('disabled','disabled'); else inp.removeAttribute('disabled'); });
  }

  function closeModal(){ modal.setAttribute('aria-hidden','true'); editId=null; interviewerForm.reset(); }

  function onSave(e){
    e.preventDefault();
    const name = iName.value.trim(); const dept = iDept.value; const role = iRole.value.trim(); const email = iEmail.value.trim(); const total = parseInt(iTotal.value||0,10); const status = iStatus.value;
    if (!name || !email) return alert('Name and email required');
    if (editId){ const idx = interviewers.findIndex(x=>x.id===editId); if (idx>-1){ interviewers[idx] = {...interviewers[idx], name, dept, role, email, total, status}; } }
    else { interviewers.unshift({id:id(), name, dept, role, email, total, status, avatar:'../images/profile-avatar.png'}); }
    save(); applyFilters(); closeModal();
  }

  function onDelete(e){ e.preventDefault(); const id = e.currentTarget.dataset.id; if (!confirm('Delete this interviewer?')) return; interviewers = interviewers.filter(x=>x.id!==id); save(); applyFilters(); }

  function id(){ return 'i_'+Math.random().toString(36).slice(2,9); }
  function escape(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
});
