// Results page logic
document.addEventListener('DOMContentLoaded', () => {
  // Auth check
  const user = getUser ? getUser() : null;
  if(!user){ window.location.href = 'signin.html'; return; }

  // Elements
  const resultsList = document.getElementById('resultsList');
  const feedbackModal = document.getElementById('feedbackModal');
  const closeFeedbackBtn = document.getElementById('closeFeedback');

  // Initial render
  renderResults();
  updatePerformanceMetrics();

  // Event listeners
  closeFeedbackBtn.addEventListener('click', () => {
    feedbackModal.classList.remove('show');
  });

  feedbackModal.addEventListener('click', (e) => {
    if(e.target === feedbackModal) {
      feedbackModal.classList.remove('show');
    }
  });

  function renderResults() {
    resultsList.innerHTML = interviewResults.map(result => {
      const statusClass = `status-${result.status.toLowerCase()}`;
      return `
        <div class="result-card">
          <div class="result-header">
            <div>
              <h3 class="result-title">${escapeHtml(result.title)}</h3>
              <div class="result-type">${escapeHtml(result.type)}</div>
              <div class="result-meta">
                <span>📅 ${formatDate(result.date)}</span>
                <span>👤 ${escapeHtml(result.interviewer)}</span>
                ${result.rating ? `<span class="result-rating">★ ${result.rating}/5.0</span>` : ''}
              </div>
            </div>
            <span class="status-badge ${statusClass}">${result.status}</span>
          </div>
          <p class="result-message">${escapeHtml(result.message)}</p>
          ${result.hasFeedback ? `
            <button onclick="showFeedback('${result.id}')" class="btn-feedback">
              View Feedback
            </button>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  // Expose to window for onclick handlers
  window.showFeedback = (id) => {
    const result = interviewResults.find(r => r.id === id);
    if(!result || !result.feedback) return;

    const feedback = result.feedback;
    feedbackModal.querySelector('.feedback-details').innerHTML = `
      <div class="feedback-section">
        <h4>Overall Assessment</h4>
        <div class="feedback-item">
          <div class="label">Rating</div>
          <div class="value">${result.rating}/5.0 - ${getFeedbackLabel(result.rating)}</div>
        </div>
        <div class="feedback-item">
          <div class="label">Strengths</div>
          <div class="value">${escapeHtml(feedback.strengths)}</div>
        </div>
        <div class="feedback-item">
          <div class="label">Areas for Improvement</div>
          <div class="value">${escapeHtml(feedback.improvements)}</div>
        </div>
      </div>
      <div class="feedback-section">
        <h4>Skill Assessment</h4>
        ${Object.entries(feedback.skills).map(([skill, score]) => `
          <div class="feedback-item">
            <div class="label">${escapeHtml(skill)}</div>
            <div class="value">${score}/5</div>
          </div>
        `).join('')}
      </div>
      ${feedback.notes ? `
        <div class="feedback-section">
          <h4>Additional Notes</h4>
          <div class="feedback-item">
            <div class="value">${escapeHtml(feedback.notes)}</div>
          </div>
        </div>
      ` : ''}
    `;

    feedbackModal.classList.add('show');
  };

  function updatePerformanceMetrics() {
    // This would normally calculate from the results
    // Currently using static data from the HTML
  }

  function getFeedbackLabel(rating) {
    if(rating >= 4.5) return 'Excellent';
    if(rating >= 4.0) return 'Very Good';
    if(rating >= 3.5) return 'Good';
    if(rating >= 3.0) return 'Satisfactory';
    return 'Needs Improvement';
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function escapeHtml(str) {
    return (str+'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
});

// Sample interview results data (would come from backend)
const interviewResults = [
  {
    id: 'int_1',
    title: 'Senior Product Designer',
    type: 'Technical Round - Portfolio Review',
    date: '2025-10-23',
    interviewer: 'Sarah Johnson',
    status: 'Selected',
    rating: 4.8,
    message: 'Congratulations! You\'ve been selected for the next round.',
    hasFeedback: true,
    feedback: {
      strengths: 'Excellent portfolio showcasing user-centered design process. Strong presentation and communication skills.',
      improvements: 'Consider adding more enterprise UX examples to your portfolio.',
      skills: {
        'Visual Design': 4.8,
        'User Research': 4.7,
        'Prototyping': 4.9,
        'Communication': 4.8
      },
      notes: 'Very promising candidate with a great eye for detail and strong design principles.'
    }
  },
  {
    id: 'int_2',
    title: 'Frontend Developer (React)',
    type: 'Technical Round - Coding Challenge',
    date: '2025-10-20',
    interviewer: 'Mike Chen',
    status: 'Rejected',
    rating: 3.2,
    message: 'Thank you for your interest. Keep improving and apply again!',
    hasFeedback: true,
    feedback: {
      strengths: 'Good understanding of React basics. Clear communication of thought process.',
      improvements: 'Need stronger knowledge of state management and optimization techniques.',
      skills: {
        'React': 3.2,
        'JavaScript': 3.5,
        'Problem Solving': 3.0,
        'Code Quality': 3.1
      },
      notes: 'Shows potential but needs more experience with complex React applications.'
    }
  },
  {
    id: 'int_3',
    title: 'Marketing Manager',
    type: 'HR Round - Initial Screening',
    date: '2025-10-18',
    interviewer: 'Lisa Wang',
    status: 'Pending',
    message: 'Results will be available soon. We\'ll notify you!',
    hasFeedback: false
  },
  {
    id: 'int_4',
    title: 'Data Analyst',
    type: 'Final Round - Case Study Presentation',
    date: '2025-10-15',
    interviewer: 'David Park',
    status: 'OnHold',
    rating: 4.2,
    message: 'Position on hold due to budget review. We\'ll update you soon.',
    hasFeedback: true,
    feedback: {
      strengths: 'Excellent data analysis skills and presentation clarity.',
      improvements: 'Could improve on statistical modeling depth.',
      skills: {
        'Data Analysis': 4.3,
        'Presentation': 4.4,
        'Technical Skills': 4.0,
        'Problem Solving': 4.1
      },
      notes: 'Strong candidate with good potential for growth.'
    }
  }
];