// Simple client-side auth helpers
const AUTH_KEY = 'ims_user';

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is authenticated and in the correct section
  const user = getUser();
  if (!user) {
    redirectToSignin();
    return;
  }

  // Check if user is in the correct section based on their role
  const currentPath = window.location.pathname;
  const isInInterviewerSection = currentPath.includes('/interviewer/');
  const isInCandidateSection = !isInInterviewerSection && !currentPath.includes('/admin/');

  if (user.role === 'Candidate' && isInInterviewerSection) {
    window.location.href = '../dashboard.html';
    return;
  }
  if (user.role === 'Interviewer' && isInCandidateSection) {
    window.location.href = 'interviewer/interviewer-dashboard.html';
    return;
  }

  // Setup logout button
  let logoutBtn = document.getElementById('logoutBtn');
  const sidebarFooter = document.querySelector('.sidebar-footer');
  
  if (user) {
    if (!logoutBtn && sidebarFooter) {
      logoutBtn = sidebarFooter.querySelector('#logoutBtn');
    }
    if (logoutBtn) logoutBtn.style.display = 'block';
  } else {
    if (logoutBtn) logoutBtn.style.display = 'none';
  }

  if(logoutBtn){
    logoutBtn.addEventListener('click', ()=>{
      logout();
    });
  }
});

function setUser(user){
  try{ localStorage.setItem(AUTH_KEY, JSON.stringify(user)); }catch(e){console.error('auth set',e)}
}
function getUser(){
  try{ return JSON.parse(localStorage.getItem(AUTH_KEY)||'null'); }catch(e){return null}
}
function logout(){
  try{ localStorage.removeItem(AUTH_KEY); }catch(e){console.error(e)}
  // optionally clear profile if you want: localStorage.removeItem('ims_profile_v1');
  redirectToSignin();
}

function redirectToSignin() {
  const currentPath = window.location.pathname;
  const isInSubfolder = currentPath.includes('/interviewer/') || currentPath.includes('/admin/');
  window.location.href = isInSubfolder ? '../signin.html' : 'signin.html';
}
