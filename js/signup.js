document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('signupForm');

  // simple client-side validation
  form && form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;
    const agree = document.getElementById('agree').checked;

    if(!fullName || !email || !password || !confirm){
      alert('Please fill all required fields.');
      return;
    }
    if(password !== confirm){
      alert('Passwords do not match.');
      return;
    }
    if(!agree){
      alert('Please accept the terms and conditions.');
      return;
    }

    // resume upload removed — no file validation needed

    // Demo: save a simple user object and redirect based on role
    const roleEl = document.getElementById('roleSelect');
    const role = roleEl ? roleEl.value : 'Candidate';
    const user = { name: fullName, email, role, createdAt: Date.now() };
    // Save registration info under a separate key so we don't auto-login the user.
    try{
      const existing = JSON.parse(localStorage.getItem('ims_registered') || '[]');
      existing.push(user);
      localStorage.setItem('ims_registered', JSON.stringify(existing));
    }catch(e){console.error('signup save', e)}

    // Redirect user to sign in so they explicitly authenticate.
    window.location.href = 'signin.html';
  });
});