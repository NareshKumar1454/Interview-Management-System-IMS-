document.addEventListener('DOMContentLoaded', ()=>{
  // Sidebar nav highlight
  document.querySelectorAll('.sidebar nav li').forEach(li=>{
    li.addEventListener('click', ()=>{
      document.querySelectorAll('.sidebar nav li').forEach(x=>x.classList.remove('active'));
      li.classList.add('active');
    });
  });

  // Dismiss notifications
  document.querySelectorAll('.dismiss').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const li = e.target.closest('li');
      if(li) li.remove();
    });
  });

  // Simple responsive check
  window.addEventListener('resize', ()=>{
    // no-op but kept for future dynamic updates
  });
});
