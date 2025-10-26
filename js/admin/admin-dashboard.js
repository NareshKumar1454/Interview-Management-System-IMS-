// Admin Dashboard behaviors
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  const currentUser = JSON.parse(localStorage.getItem('ims_user') || 'null');
  if (!currentUser || currentUser.role !== 'Admin') {
    window.location.href = '../signin.html';
    return;
  }

  // Setup logout
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn && logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('ims_user');
    window.location.href = '../signin.html';
  });

  // Setup Add Job button
  const addJobBtn = document.getElementById('addJobBtn');
  addJobBtn && addJobBtn.addEventListener('click', () => {
    window.location.href = 'admin-manage-jobs.html?action=new';
  });

  // Setup charts
  setupCandidateGrowthChart();
  setupInterviewStatusChart();
});

function setupCandidateGrowthChart() {
  const ctx = document.getElementById('candidateGrowthChart');
  if (!ctx) return;

  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
  gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
      datasets: [{
        label: 'New Candidates',
        data: [120, 150, 180, 210, 250, 230, 260, 290],
        borderColor: '#2563eb',
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#2563eb',
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return context.parsed.y + ' Candidates';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: '#f1f5f9',
            drawBorder: false
          },
          ticks: {
            font: {
              size: 12
            },
            color: '#64748b'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 12
            },
            color: '#64748b'
          }
        }
      }
    }
  });
}

function setupInterviewStatusChart() {
  const ctx = document.getElementById('interviewStatusChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'Scheduled', 'Pending'],
      datasets: [{
        data: [45, 35, 20],
        backgroundColor: ['#059669', '#2563eb', '#b45309'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            font: {
              size: 13
            },
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((context.parsed / total) * 100);
              return `${context.parsed} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Update date display
function updateDateTime() {
  const dateDisplay = document.querySelector('.date-display');
  if (dateDisplay) {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    dateDisplay.textContent = now.toLocaleDateString('en-US', options);
  }
}

updateDateTime();
setInterval(updateDateTime, 60000); // Update every minute