// Profile page behaviour with localStorage persistence
const STORAGE_KEY = 'ims_profile_v1';

document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('profileForm');
  const saveBtn = document.getElementById('saveBtn');
  const editBtn = document.getElementById('editBtn');
  const avatarInput = document.getElementById('avatarInput');
  const changeAvatar = document.getElementById('changeAvatar');
  const avatarImg = document.getElementById('avatarImg');
  const resumeInput = document.getElementById('resumeInput');
  const resumeDrop = document.getElementById('resumeDrop');

  // load saved profile
  loadProfile();

  // autosave on input changes (debounced)
  const debouncedSave = debounce(()=>{
    // only save if form present
    try{ saveProfile(); }catch(e){console.error(e)}
  }, 800);
  // watch common inputs
  form && form.querySelectorAll('input[type=text], input[type=email], input[type=date], textarea').forEach(i=>i.addEventListener('input', debouncedSave));

  changeAvatar && changeAvatar.addEventListener('click', ()=>avatarInput.click());
  avatarInput && avatarInput.addEventListener('change', handleAvatar);

  resumeDrop && resumeDrop.addEventListener('click', ()=>resumeInput.click());
  resumeInput && resumeInput.addEventListener('change', handleResume);

  document.getElementById('addEdu').addEventListener('click', addEducation);
  document.getElementById('addExp').addEventListener('click', addExperience);
  document.getElementById('addSkill').addEventListener('click', addSkill);
  const skillInput = document.getElementById('skillInput');
  if(skillInput) skillInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); addSkill(); } });

  saveBtn && saveBtn.addEventListener('click', saveProfile);
  editBtn && editBtn.addEventListener('click', ()=>{
    toggleEdit(true);
  });

  // helper functions
  function loadProfile(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return;
    try{
      const data = JSON.parse(raw);
      document.getElementById('fullName').value = data.fullName || '';
      document.getElementById('email').value = data.email || '';
      document.getElementById('phone').value = data.phone || '';
      document.getElementById('dob').value = data.dob || '';
      document.getElementById('address').value = data.address || '';
      document.getElementById('profileName').textContent = data.fullName || 'Your Name';
      document.getElementById('profileRole').textContent = data.role || 'Frontend Developer';

      if(data.avatar){ avatarImg.src = data.avatar; }

      // education
      const eduList = document.getElementById('educationList'); eduList.innerHTML='';
      (data.education||[]).forEach(e=>renderEducation(e));

      const expList = document.getElementById('experienceList'); expList.innerHTML='';
      (data.experience||[]).forEach(e=>renderExperience(e));

      // skills
      const chips = document.getElementById('skillsChips'); chips.innerHTML='';
      (data.skills||[]).forEach(s=>renderSkillChip(s));

      // resume
      const resumeList = document.getElementById('resumeList'); resumeList.innerHTML='';
      if(data.resume){
        const div = document.createElement('div'); div.className='resume-item';
        div.innerHTML = `<span>${data.resume.name}</span><a href="${data.resume.data}" download="${data.resume.name}">Download</a>`;
        resumeList.appendChild(div);
      }

      toggleEdit(false);
    }catch(e){console.error('profile load', e)}
  }

  function saveProfile(){
    const data = {
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      dob: document.getElementById('dob').value,
      address: document.getElementById('address').value.trim(),
      role: document.getElementById('profileRole').textContent,
      education: collectEducation(),
      experience: collectExperience(),
      skills: collectSkills(),
    };
    // include avatar and resume if present (keep existing if not changed)
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
    data.avatar = stored.avatar || null;
    data.resume = stored.resume || null;

    // persist full profile
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }catch(e){
      console.error('Failed to save profile to localStorage', e);
      showSaveMessage('Save failed (storage full?)');
      return;
    }
    document.getElementById('profileName').textContent = data.fullName || 'Your Name';
    showSaveMessage('Profile saved locally');
    toggleEdit(false);
  }

  // debounce utility
  function debounce(fn, wait){
    let t;
    return function(...args){ clearTimeout(t); t = setTimeout(()=>fn.apply(this,args), wait); };
  }

  function showSaveMessage(msg){
    const el = document.getElementById('saveMessage');
    if(!el) return; el.textContent = msg; setTimeout(()=>{ el.textContent=''; },2000);
  }

  function toggleEdit(enabled){
    document.querySelectorAll('#profileForm input, #profileForm textarea, #profileForm select, #profileForm button.small').forEach(el=>{
      if(el.classList && el.classList.contains('small')) return; // allow small add buttons
      if(el.tagName==='BUTTON') return;
      el.disabled = !enabled;
    });
    document.getElementById('addEdu').disabled = !enabled;
    document.getElementById('addExp').disabled = !enabled;
    document.getElementById('addSkill').disabled = !enabled;
    document.getElementById('skillInput').disabled = !enabled;
  }

  function handleAvatar(e){
    const f = e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      const dataUrl = reader.result;
      avatarImg.src = dataUrl;
      // merge with existing profile and persist
      try{
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
        stored.avatar = dataUrl;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        showSaveMessage('Avatar updated');
      }catch(e){ console.error(e); showSaveMessage('Could not save avatar'); }
    };
    reader.readAsDataURL(f);
  }

  function handleResume(e){
    const f = e.target.files[0];
    if(!f) return;
    if(f.type !== 'application/pdf') { alert('Resume must be a PDF'); return; }
    if(f.size > 5*1024*1024){ alert('File too large'); return; }
    const reader = new FileReader();
    reader.onload = ()=>{
      const dataUrl = reader.result;
      try{
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
        stored.resume = {name: f.name, data: dataUrl};
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        loadProfile();
        showSaveMessage('Resume uploaded');
      }catch(e){ console.error(e); showSaveMessage('Could not save resume'); }
    };
    reader.readAsDataURL(f);
  }

  function addEducation(){ renderEducation({degree:'', institution:'', year:'', grade:''}); toggleEdit(true); }
  function renderEducation(e){
    const id = 'edu_'+Date.now();
    const div = document.createElement('div'); div.className='edu-item';
    div.innerHTML = `
      <div class="grid"><input class="edu-degree" placeholder="Degree" value="${escapeHtml(e.degree||'')}"><input class="edu-institution" placeholder="Institution" value="${escapeHtml(e.institution||'')}"></div>
      <div class="grid"><input class="edu-year" placeholder="Year of graduation" value="${escapeHtml(e.year||'')}"><input class="edu-grade" placeholder="Grade/CGPA" value="${escapeHtml(e.grade||'')}"></div>
      <div style="text-align:right;margin-top:8px"><button class="small remove-edu">Remove</button></div>
    `;
    document.getElementById('educationList').appendChild(div);
    // attach remove handler and input listeners to autosave
    const removeBtn = div.querySelector('.remove-edu');
    removeBtn.addEventListener('click', ()=>{ div.remove(); debouncedSave(); });
    div.querySelectorAll('input').forEach(inp=>inp.addEventListener('input', debouncedSave));
  }

  function addExperience(){ renderExperience({title:'', company:'', start:'', end:'', desc:''}); toggleEdit(true); }
  function renderExperience(e){
    const div = document.createElement('div'); div.className='exp-item';
    div.innerHTML = `
      <div class="grid"><input class="exp-title" placeholder="Job Title" value="${escapeHtml(e.title||'')}"><input class="exp-company" placeholder="Company" value="${escapeHtml(e.company||'')}"></div>
      <div class="grid"><input class="exp-start" placeholder="Start Date" value="${escapeHtml(e.start||'')}"><input class="exp-end" placeholder="End Date" value="${escapeHtml(e.end||'')}"></div>
      <textarea class="exp-desc" placeholder="Description">${escapeHtml(e.desc||'')}</textarea>
      <div style="text-align:right;margin-top:8px"><button class="small remove-exp">Remove</button></div>
    `;
    document.getElementById('experienceList').appendChild(div);
    const removeBtn = div.querySelector('.remove-exp');
    removeBtn.addEventListener('click', ()=>{ div.remove(); debouncedSave(); });
    div.querySelectorAll('input, textarea').forEach(inp=>inp.addEventListener('input', debouncedSave));
  }

  function collectEducation(){
    const out=[];
    document.querySelectorAll('#educationList .edu-item').forEach(el=>{
      out.push({
        degree: el.querySelector('.edu-degree').value,
        institution: el.querySelector('.edu-institution').value,
        year: el.querySelector('.edu-year').value,
        grade: el.querySelector('.edu-grade').value,
      });
    });
    return out;
  }
  function collectExperience(){
    const out=[];
    document.querySelectorAll('#experienceList .exp-item').forEach(el=>{
      out.push({
        title: el.querySelector('.exp-title').value,
        company: el.querySelector('.exp-company').value,
        start: el.querySelector('.exp-start').value,
        end: el.querySelector('.exp-end').value,
        desc: el.querySelector('.exp-desc').value,
      });
    });
    return out;
  }

  function collectSkills(){
    const s=[];
    document.querySelectorAll('#skillsChips .chip').forEach(c=>{
      // chip text contains 'x' remove trailing remove button text
      const text = c.cloneNode(true);
      // remove button if present
      const btn = text.querySelector('button'); if(btn) btn.remove();
      s.push(text.textContent.trim());
    });
    return s;
  }

  function addSkill(){
    const val = document.getElementById('skillInput').value.trim();
    if(!val) return;
    renderSkillChip(val);
    document.getElementById('skillInput').value='';
    debouncedSave();
  }
  function renderSkillChip(val){
    const c = document.createElement('div'); c.className='chip'; c.textContent = val;
    const x = document.createElement('button'); x.className='small'; x.textContent='x'; x.addEventListener('click', ()=>c.remove());
    c.appendChild(x);
    document.getElementById('skillsChips').appendChild(c);
    // ensure removal triggers save
    x.addEventListener('click', ()=>{ debouncedSave(); });
  }

  function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

});
