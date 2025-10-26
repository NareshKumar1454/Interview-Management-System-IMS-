// Signin page behaviors
document.addEventListener('DOMContentLoaded', ()=>{
  // Check if already logged in — show session notice rather than instantly redirecting
  const currentUser = JSON.parse(localStorage.getItem('ims_user') || 'null');
  const sessionNotice = document.getElementById('sessionNotice');
  if (currentUser && sessionNotice) {
    sessionNotice.style.display = 'block';
    const msg = document.getElementById('sessionMessage');
    if (msg) msg.textContent = `You're currently signed in as ${currentUser.role} (${currentUser.email}).`;
    const cont = document.getElementById('continueBtn');
    const sw = document.getElementById('switchBtn');
    if (cont) cont.addEventListener('click', (e)=>{ e.preventDefault(); redirectBasedOnRole(currentUser.role); });
    if (sw) sw.addEventListener('click', (e)=>{ e.preventDefault(); localStorage.removeItem('ims_user'); sessionNotice.style.display = 'none'; });
    // do not return — allow user to switch account via "Switch account" button
  }

  const signBtn = document.getElementById('signinBtn');
  signBtn && signBtn.addEventListener('click', ()=>{
    const roleSelect = document.getElementById('roleSelect');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }
    
    const role = roleSelect ? roleSelect.value : 'Candidate';
    
    // set user object with role
    const user = { 
      role, 
      email,
      name: email.split('@')[0], // temporary name from email
      loggedAt: Date.now() 
    };
    
    try { 
      localStorage.setItem('ims_user', JSON.stringify(user)); 
      redirectBasedOnRole(role);
    } catch(e) {
      console.error(e);
      alert('Error signing in. Please try again.');
    }
  });
});

function redirectBasedOnRole(role) {
  switch(role) {
    case 'Candidate':
      window.location.href = 'dashboard.html';
      break;
    case 'Interviewer':
      window.location.href = 'interviewer/interviewer-dashboard.html';
      break;
    case 'Admin':
      window.location.href = 'admin/admin-dashboard.html';
      break;
    default:
      alert('Invalid role selected');
      localStorage.removeItem('ims_user');
  }
}
