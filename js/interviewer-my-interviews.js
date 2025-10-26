// interviewer-my-interviews.js
// Client-side rendering and filter/pagination logic for My Interviews
;(function(){
  const sampleData = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      jobTitle: 'Senior Product Designer',
      dept: 'design',
      datetime: new Date().toISOString(),
      displayTime: 'Today, 2:00 PM',
      duration: '60 minutes',
      mode: 'online',
      status: 'upcoming',
      round: 'Technical Round',
      avatar: '../images/candidate1.jpg'
    },
    {
      id: 2,
      name: 'David Chen',
      email: 'david.chen@email.com',
      jobTitle: 'Frontend Developer',
      dept: 'engineering',
      datetime: new Date().toISOString(),
      displayTime: 'Today, 4:30 PM',
      duration: '45 minutes',
      mode: 'in-person',
      status: 'ongoing',
      round: 'Final Round',
      avatar: '../images/candidate2.jpg'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      jobTitle: 'Marketing Manager',
      dept: 'marketing',
      datetime: new Date(Date.now()+24*3600*1000).toISOString(),
      displayTime: 'Tomorrow, 10:00 AM',
      duration: '30 minutes',
      mode: 'online',
      status: 'upcoming',
      round: 'HR Round',
      avatar: '../images/candidate3.jpg'
    },
    {
      id: 4,
      name: 'Alex Thompson',
      email: 'alex.thompson@email.com',
      jobTitle: 'Data Analyst',
      dept: 'data',
      datetime: new Date(Date.now()-2*24*3600*1000).toISOString(),
      displayTime: 'Oct 22, 3:00 PM',
      duration: '45 minutes',
      mode: 'online',
      status: 'completed',
      round: 'Technical Round',
      avatar: '../images/candidate4.jpg'
    },
    {
      id: 5,
      name: 'James Wilson',
      email: 'james.wilson@email.com',
      jobTitle: 'Backend Developer',
      dept: 'engineering',
      datetime: new Date(Date.now()+2*24*3600*1000).toISOString(),
      displayTime: 'Oct 23, 11:00 AM',
      duration: '60 minutes',
      mode: 'in-person',
      status: 'completed',
      round: 'Technical Round',
      avatar: '../images/candidate5.jpg'
    },
    {
      id: 6,
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      jobTitle: 'UX Designer',
      dept: 'design',
      datetime: new Date(Date.now()+5*24*3600*1000).toISOString(),
      displayTime: 'Oct 25, 2:30 PM',
      duration: '90 minutes',
      mode: 'online',
      status: 'upcoming',
      round: 'Portfolio Review',
      avatar: '../images/candidate6.jpg'
    }
  ];

  // state
  let state = {
    data: sampleData.slice(),
    filters: { status: 'all', date: '', dept: 'all' },
    page: 1,
    pageSize: 7
  };

  // helpers
  function el(tag, cls, html){
    const d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html !== undefined) d.innerHTML = html;
    return d;
  }

  function formatBadge(status){
    const span = el('span', 'status');
    span.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    if(status === 'upcoming') span.classList.add('upcoming');
    if(status === 'ongoing') span.classList.add('ongoing');
    if(status === 'completed') span.classList.add('completed');
    return span;
  }

  function renderRow(item){
    // container row
    const row = el('div', 'interview-row');
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '2fr 2fr 1fr 1fr 220px';
    row.style.alignItems = 'center';
    row.style.padding = '16px';
    row.style.borderBottom = '1px solid #eef2f7';

    // candidate
    const candidate = el('div', 'candidate-col');
    candidate.style.display = 'flex';
    candidate.style.gap = '12px';
    const img = el('img', 'candidate-avatar');
    img.src = item.avatar;
    img.alt = item.name;
    img.style.width = '48px';
    img.style.height = '48px';
    img.style.borderRadius = '50%';
    const cinfo = el('div','');
    const cname = el('div','name', item.name);
    const cemail = el('div','', `<small style="color:#94a3b8">${item.email}</small>`);
    cinfo.appendChild(cname);
    cinfo.appendChild(cemail);
    candidate.appendChild(img);
    candidate.appendChild(cinfo);

    // job title
    const job = el('div','job-col');
    const jtitle = el('div','', `<strong>${item.jobTitle}</strong>`);
    const jmeta = el('div','', `<small style="color:#94a3b8">${item.dept.charAt(0).toUpperCase()+item.dept.slice(1)} • ${item.round}</small>`);
    job.appendChild(jtitle);
    job.appendChild(jmeta);

    // date & time
    const dt = el('div','dt-col');
    dt.innerHTML = `<div style="font-weight:600">${item.displayTime}</div><div style="color:#94a3b8;font-size:13px">${item.duration}</div>`;

    // mode
    const mode = el('div','mode-col');
    mode.innerHTML = `<div style="display:flex;align-items:center;gap:8px"><span style="width:10px;height:10px;border-radius:2px;background:${item.mode==='online'? '#2563eb':'#d97706'};display:inline-block"></span><small style="color:#94a3b8">${item.mode==='online'?'Online':'In-person'}</small></div>`;

    // status & actions
    const actions = el('div','actions-col');
    actions.style.display = 'flex';
    actions.style.justifyContent = 'flex-end';
    actions.style.gap = '8px';

    const statusBadge = formatBadge(item.status);
    statusBadge.style.marginRight = '8px';

    const viewBtn = el('button','btn outline','View Details');
    viewBtn.dataset.id = item.id;
    viewBtn.addEventListener('click', ()=> onViewDetails(item.id));

    const primary = el('button','btn','');
    primary.dataset.id = item.id;
    if(item.status === 'upcoming'){
      primary.className = 'btn outline';
      primary.textContent = 'Start Interview';
    } else if(item.status === 'ongoing'){
      primary.className = 'btn primary';
      primary.textContent = 'Mark Complete';
    } else if(item.status === 'completed'){
      primary.className = 'btn primary';
      primary.textContent = 'Submit Feedback';
    }
    primary.addEventListener('click', ()=> onPrimaryAction(item.id));

    actions.appendChild(statusBadge);
    actions.appendChild(viewBtn);
    actions.appendChild(primary);

    row.appendChild(candidate);
    row.appendChild(job);
    row.appendChild(dt);
    row.appendChild(mode);
    row.appendChild(actions);

    return row;
  }

  function renderList(){
    const container = document.getElementById('interviewListContainer');
    container.innerHTML = '';

    const filtered = getFilteredData();

    const start = (state.page-1)*state.pageSize;
    const pageItems = filtered.slice(start, start + state.pageSize);

    // header row
    const header = document.createElement('div');
    header.style.display='grid';
    header.style.gridTemplateColumns='2fr 2fr 1fr 1fr 220px';
    header.style.padding='12px 16px';
    header.style.color='#64748b';
    header.style.fontSize='13px';
    header.style.borderBottom='1px solid #eef2f7';
    header.innerHTML = '<div>CANDIDATE</div><div>JOB TITLE</div><div>DATE & TIME</div><div>MODE</div><div style="text-align:right">STATUS & ACTIONS</div>';
    container.appendChild(header);

    pageItems.forEach(it => container.appendChild(renderRow(it)));

    renderPagination(filtered.length);
  }

  function renderPagination(total){
    const pages = Math.max(1, Math.ceil(total / state.pageSize));
    const pwrap = document.getElementById('pagination');
    pwrap.innerHTML = '';

    const info = el('div','', `Showing ${Math.min((state.page-1)*state.pageSize+1, total)} to ${Math.min(state.page*state.pageSize, total)} of ${total} interviews`);
    info.style.alignSelf = 'center';
    info.style.color = '#64748b';
    info.style.marginRight = '12px';
    pwrap.appendChild(info);

    const pager = el('div','pager');
    if(pages <= 1) return;
    const prev = el('button','btn outline','<');
    prev.disabled = state.page === 1;
    prev.addEventListener('click', ()=> { state.page = Math.max(1, state.page-1); renderList(); });
    pager.appendChild(prev);

    for(let i=1;i<=pages;i++){
      const b = el('button', i===state.page?'btn primary':'btn outline', i);
      b.style.minWidth = '36px';
      b.addEventListener('click', ()=> { state.page = i; renderList(); });
      pager.appendChild(b);
    }

    const next = el('button','btn outline','>');
    next.disabled = state.page === pages;
    next.addEventListener('click', ()=> { state.page = Math.min(pages, state.page+1); renderList(); });
    pager.appendChild(next);

    pager.style.display='flex';
    pager.style.gap='8px';
    pwrap.appendChild(pager);
  }

  function getFilteredData(){
    return state.data.filter(it => {
      if(state.filters.status !== 'all' && it.status !== state.filters.status) return false;
      if(state.filters.dept !== 'all' && it.dept !== state.filters.dept) return false;
      if(state.filters.date){
        const d = new Date(it.datetime);
        const iso = state.filters.date;
        // compare yyyy-mm-dd
        const cmp = d.toISOString().slice(0,10);
        if(cmp !== iso) return false;
      }
      return true;
    });
  }

  // event handlers
  function onViewDetails(id){
    const item = state.data.find(d=>d.id===id);
    if(!item) return;
    alert(`${item.name}\n${item.jobTitle}\n${item.displayTime}\nStatus: ${item.status}`);
  }

  function onPrimaryAction(id){
    const idx = state.data.findIndex(d=>d.id===id);
    if(idx === -1) return;
    const item = state.data[idx];
    if(item.status === 'upcoming'){
      // mark ongoing
      item.status = 'ongoing';
      alert('Interview started for ' + item.name);
    } else if(item.status === 'ongoing'){
      item.status = 'completed';
      alert('Interview marked complete for ' + item.name);
    } else if(item.status === 'completed'){
      alert('Open feedback form for ' + item.name);
    }
    renderList();
  }

  function wireFilters(){
    const status = document.getElementById('filterStatus');
    const date = document.getElementById('filterDate');
    const dept = document.getElementById('filterDept');
    const tableView = document.getElementById('tableView');
    const calendarView = document.getElementById('calendarView');

    status.addEventListener('change', (e)=>{ state.filters.status = e.target.value; state.page = 1; renderList(); });
    date.addEventListener('change', (e)=>{ state.filters.date = e.target.value; state.page = 1; renderList(); });
    dept.addEventListener('change', (e)=>{ state.filters.dept = e.target.value; state.page = 1; renderList(); });
    tableView.addEventListener('click', ()=>{ alert('Already in table view'); });
    calendarView.addEventListener('click', ()=>{ alert('Calendar view not implemented in demo'); });
  }

  function init(){
    // ensure container exists
    if(!document.getElementById('interviewListContainer')) return;
    wireFilters();
    renderList();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
