// interviewer-feedbacks.js
// Handles navigation and feedback form interactivity for interviewer feedbacks page

document.addEventListener('DOMContentLoaded', function() {
  // Sidebar navigation
  document.querySelectorAll('.sidebar nav a.side-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = this.getAttribute('href');
    });
  });

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      // Clear auth (if any) and redirect
      localStorage.removeItem('user');
      window.location.href = '../signin.html';
    });
  }

  // Feedback modal logic
  const feedbackModal = document.getElementById('feedbackModal');
  const feedbackForm = document.getElementById('feedbackForm');
  const closeModalBtn = document.getElementById('closeFeedbackModal');
  const giveFeedbackBtns = document.querySelectorAll('.btn.primary');

  giveFeedbackBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      if (feedbackModal) feedbackModal.classList.add('show');
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', function() {
      feedbackModal.classList.remove('show');
    });
  }

  if (feedbackModal) {
    feedbackModal.addEventListener('click', function(e) {
      if (e.target === feedbackModal) feedbackModal.classList.remove('show');
    });
  }

  // Star rating logic
  document.querySelectorAll('.star-rating').forEach(rating => {
    rating.addEventListener('click', function(e) {
      if (e.target.classList.contains('star')) {
        const value = parseInt(e.target.dataset.value);
        rating.dataset.selected = value;
        rating.querySelectorAll('.star').forEach((star, idx) => {
          star.classList.toggle('selected', idx < value);
        });
      }
    });
  });

  // Form submit (placeholder)
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Feedback submitted! (Demo only)');
      feedbackModal.classList.remove('show');
    });
  }

  // Save as Draft (placeholder)
  const saveDraftBtn = document.getElementById('saveDraftBtn');
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', function() {
      alert('Draft saved! (Demo only)');
      feedbackModal.classList.remove('show');
    });
  }
});
