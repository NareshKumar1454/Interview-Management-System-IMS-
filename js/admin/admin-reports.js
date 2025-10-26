document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const user = getUser();
    if (!user || user.role !== 'Admin') {
        window.location.href = '../signin.html';
        return;
    }

    // Initialize
    initializeCharts();
    loadPerformanceData();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('timeRange').addEventListener('change', handleTimeRangeChange);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

function initializeCharts() {
    // Department Chart
    const departmentCtx = document.getElementById('departmentChart').getContext('2d');
    const departmentChart = new Chart(departmentCtx, {
        type: 'bar',
        data: {
            labels: ['Engineering', 'Marketing', 'Sales', 'HR', 'Operations'],
            datasets: [{
                label: 'Interviews',
                data: [82, 45, 65, 28, 34],
                backgroundColor: '#3b82f6',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // Outcomes Chart
    const outcomesCtx = document.getElementById('outcomesChart').getContext('2d');
    const outcomesChart = new Chart(outcomesCtx, {
        type: 'doughnut',
        data: {
            labels: ['Selected', 'Rejected', 'On Hold'],
            datasets: [{
                data: [25, 60, 15],
                backgroundColor: [
                    '#10b981',
                    '#ef4444',
                    '#f59e0b'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });

    // Trends Chart
    const trendsCtx = document.getElementById('trendsChart').getContext('2d');
    const trendsChart = new Chart(trendsCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
            datasets: [{
                label: 'Scheduled',
                data: [45, 52, 48, 60, 58, 65, 70, 68, 75, 82],
                borderColor: '#3b82f6',
                tension: 0.4,
                fill: false
            }, {
                label: 'Completed',
                data: [42, 48, 45, 55, 52, 58, 62, 65, 70, 75],
                borderColor: '#10b981',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // expose charts so we can update them later
    window.reportsCharts = {
        department: departmentChart,
        outcomes: outcomesChart,
        trends: trendsChart
    };
}

function loadPerformanceData() {
    const performanceData = [
        {
            jobTitle: 'Senior Frontend Developer',
            interviewsConducted: 42,
            candidatesHired: 8,
            avgScore: 8.2,
            rating: 4.5,
            successRate: 19
        },
        {
            jobTitle: 'Product Marketing Manager',
            interviewsConducted: 28,
            candidatesHired: 5,
            avgScore: 7.8,
            rating: 4.2,
            successRate: 18
        },
        {
            jobTitle: 'DevOps Engineer',
            interviewsConducted: 35,
            candidatesHired: 7,
            avgScore: 8.5,
            rating: 4.7,
            successRate: 20
        },
        {
            jobTitle: 'Sales Development Rep',
            interviewsConducted: 52,
            candidatesHired: 12,
            avgScore: 7.4,
            rating: 4.1,
            successRate: 23
        }
    ];

    const tbody = document.querySelector('#performanceTable tbody');
    tbody.innerHTML = '';

    performanceData.forEach(job => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${job.jobTitle}</td>
            <td>${job.interviewsConducted}</td>
            <td>${job.candidatesHired}</td>
            <td><span class="score ${getScoreClass(job.avgScore)}">${job.avgScore}/10</span></td>
            <td><span class="rating">★</span> ${job.rating}</td>
            <td><span class="success-rate ${getSuccessRateClass(job.successRate)}">${job.successRate}%</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function getScoreClass(score) {
    if (score >= 8) return 'high';
    if (score >= 7) return 'medium';
    return 'low';
}

function getSuccessRateClass(rate) {
    if (rate >= 20) return 'high';
    if (rate >= 15) return 'medium';
    return 'low';
}

function handleTimeRangeChange(e) {
    const days = parseInt(e.target.value);
    // Update charts and metrics based on selected time range
    updateMetrics(days);
    updateCharts(days);
}

function updateMetrics(days) {
    // Simulate metrics update based on time range
    const metrics = calculateMetrics(days);
    document.getElementById('totalInterviews').textContent = metrics.interviews;
    document.getElementById('candidatesHired').textContent = metrics.hired;
    document.getElementById('jobsOpen').textContent = metrics.jobs;
    document.getElementById('activeInterviewers').textContent = metrics.interviewers;
}

function calculateMetrics(days) {
    // In a real application, this would fetch data from a backend
    // For now, we'll use mock data
    return {
        interviews: 234,
        hired: 48,
        jobs: 15,
        interviewers: 28
    };
}

function updateCharts(days) {
    // This would update the charts with new data based on the selected time range
    // For now, we'll keep the same data
}

// Export functions
function exportToPDF() {
    // Implement PDF export functionality
    alert('Generating PDF report...');
}

function exportToExcel() {
    // Implement Excel export functionality
    alert('Generating Excel report...');
}

function printReport() {
    window.print();
}

function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = '../signin.html';
}