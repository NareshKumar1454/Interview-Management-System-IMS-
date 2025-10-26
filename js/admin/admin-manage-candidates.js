// Admin Manage Candidates JS
document.addEventListener('DOMContentLoaded', ()=>{
  // Auth check
  const user = JSON.parse(localStorage.getItem('ims_user') || 'null');
  if (!user || user.role !== 'Admin') {
    window.location.href = '../signin.html';
    return;
  }

  const LS_KEY = 'ims_candidates';
  const pageSize = 5;
  let candidates = loadCandidates();
  let filtered = [...candidates];
  let currentPage = 1;

  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const tableBody = document.querySelector('#candidatesTable tbody');
  const tableInfo = document.getElementById('tableInfo');
  const prevPage = document.getElementById('prevPage');
  const nextPage = document.getElementById('nextPage');
  const pageNumbers = document.getElementById('pageNumbers');

  const addBtn = document.getElementById('addCandidateBtn');
  const modal = document.getElementById('candidateModal');
  const modalTitle = document.getElementById('modalTitle');
  const candidateForm = document.getElementById('candidateForm');
  const cancelModal = document.getElementById('cancelModal');
  const cName = document.getElementById('cName');
  const cEmail = document.getElementById('cEmail');
  const cApplied = document.getElementById('cApplied');
  const cStatus = document.getElementById('cStatus');

  let editId = null;

  // events
  searchInput.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  prevPage.addEventListener('click', ()=>{ if(currentPage>1){currentPage--; render()} });
  nextPage.addEventListener('click', ()=>{ if(currentPage<Math.ceil(filtered.length/pageSize)){currentPage++; render()} });
  addBtn.addEventListener('click', ()=>{ openModal(); });
  cancelModal.addEventListener('click', closeModal);
  candidateForm.addEventListener('submit', onSaveCandidate);

  document.getElementById('logoutBtn').addEventListener('click', ()=>{ localStorage.removeItem('ims_user'); window.location.href = '../signin.html'; });

  // initial render
  render();

  // functions
  function loadCandidates(){
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      const seed = [
        {id: id(), name:'Sarah Johnson', email:'sarah.j@example.com', applied:3, reg:'2025-10-25', status:'Active', avatar:'../images/profile-avatar.png'},
        {id: id(), name:'Michael Brown', email:'michael.b@example.com', applied:1, reg:'2025-10-24', status:'Pending', avatar:'../images/profile-avatar.png'},
        {id: id(), name:'Emily Davis', email:'emily.d@example.com', applied:5, reg:'2025-10-22', status:'Active', avatar:'../images/profile-avatar.png'},
        {id: id(), name:'David Wilson', email:'david.w@example.com', applied:0, reg:'2025-10-21', status:'Blocked', avatar:'../images/profile-avatar.png'},
        {id: id(), name:'Chris Lee', email:'chris.l@example.com', applied:2, reg:'2025-10-20', status:'Active', avatar:'../images/profile-avatar.png'}
      ];
      localStorage.setItem(LS_KEY, JSON.stringify(seed));
      return seed;
    }
    try{ return JSON.parse(raw) } catch(e){ return [] }
  }

  function saveCandidates(){ localStorage.setItem(LS_KEY, JSON.stringify(candidates)); }

  function applyFilters(){
    const q = searchInput.value.trim().toLowerCase();
    const s = statusFilter.value;
    filtered = candidates.filter(c=>{
      const matchesQ = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
      const matchesS = s === 'all' || c.status === s;
      return matchesQ && matchesS;
    });
    currentPage = 1;
    render();
  }

  function render(){
    tableBody.innerHTML = '';
    const total = filtered.length;
    const start = (currentPage-1)*pageSize;
    const pageItems = filtered.slice(start, start+pageSize);
    for (const c of pageItems){
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="checkbox" data-id="${c.id}"></td>
        <td class="candidate-cell"><img class="avatar" src="${c.avatar||'../images/profile-avatar.png'}" alt=""> <div><div><strong>${escapeHtml(c.name)}</strong></div><div style="color:var(--muted);font-size:13px">${escapeHtml(c.email)}</div></div></td>
        <td>${c.applied}</td>
        <td>${c.reg}</td>
        <td><span class="status-badge status-${c.status}">${c.status}</span></td>
        <td class="action-buttons">
          <button class="view-btn" data-id="${c.id}" title="View">👁️</button>
          <button class="edit-btn" data-id="${c.id}" title="Edit">✏️</button>
          <button class="delete-btn" data-id="${c.id}" title="Delete">🗑️</button>
        </td>
      `;
      tableBody.appendChild(tr);
    }

    tableInfo.textContent = `Showing ${Math.min(total,start+1)}-${Math.min(total,start+pageItems.length)} of ${total}`;

    // pagination numbers
    pageNumbers.innerHTML = '';
    const pageCount = Math.max(1, Math.ceil(total/pageSize));
    for(let i=1;i<=pageCount;i++){
      const btn = document.createElement('button');
      btn.className = 'pag-btn';
      btn.textContent = i;
      if (i===currentPage) btn.style.backgroundColor = 'var(--accent)';
      btn.addEventListener('click', ()=>{ currentPage=i; render(); });
      pageNumbers.appendChild(btn);
    }

    // wire action buttons
    document.querySelectorAll('.view-btn').forEach(b=>b.addEventListener('click', ()=>{ openModal(b.dataset.id, true); }));
    document.querySelectorAll('.edit-btn').forEach(b=>b.addEventListener('click', ()=>{ openModal(b.dataset.id, false); }));
    document.querySelectorAll('.delete-btn').forEach(b=>b.addEventListener('click', onDelete));
  }

  function openModal(id=null, readonly=false){
    editId = null;
    modal.setAttribute('aria-hidden','false');
    modalTitle.textContent = id ? (readonly ? 'View Candidate' : 'Edit Candidate') : 'Add Candidate';
    if (id){
      const c = candidates.find(x=>x.id===id);
      if (c){
        cName.value = c.name; cEmail.value = c.email; cApplied.value = c.applied; cStatus.value = c.status; editId = id;
      }
    } else {
      candidateForm.reset(); cApplied.value = 0; cStatus.value='Active';
    }
    // readonly handling
    const inputs = candidateForm.querySelectorAll('input,select,button[type=submit]');
    inputs.forEach(inp=>{ if (readonly){ inp.setAttribute('disabled','disabled') } else { inp.removeAttribute('disabled') } });
  }

  function closeModal(){ modal.setAttribute('aria-hidden','true'); editId = null; candidateForm.reset(); }

  function onSaveCandidate(e){
    e.preventDefault();
    const name = cName.value.trim();
    const email = cEmail.value.trim();
    const applied = parseInt(cApplied.value||0,10);
    const status = cStatus.value;
    if (!name || !email) return alert('Please provide name and email');

    if (editId){
      // update
      const idx = candidates.findIndex(x=>x.id===editId);
      if (idx>-1){ candidates[idx].name = name; candidates[idx].email = email; candidates[idx].applied = applied; candidates[idx].status = status; }
    } else {
      candidates.unshift({ id: id(), name, email, applied, reg: new Date().toISOString().slice(0,10), status, avatar:'../images/profile-avatar.png' });
    }
    saveCandidates();
    filtered = [...candidates];
    applyFilters();
    closeModal();
  }

  function onDelete(e){
    const id = e.currentTarget.dataset.id;
    if (!confirm('Delete this candidate?')) return;
    candidates = candidates.filter(x=>x.id!==id);
    saveCandidates();
    applyFilters();
  }

  function id(){ return 'c_' + Math.random().toString(36).slice(2,9); }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }

});
