document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const user = getUser();
    if (!user || user.role !== 'Admin') {
        window.location.href = '../signin.html';
        return;
    }

    // Initialize data if not exists
    initializeData();
    
    // Load data and setup
    loadInterviews();
    setupEventListeners();
    updateMetrics();
    populateFilters();
});

// Initialize localStorage data if not exists
function initializeData() {
    if (!localStorage.getItem('interviews')) {
        localStorage.setItem('interviews', JSON.stringify([]));
    }
    if (!localStorage.getItem('candidates')) {
        localStorage.setItem('candidates', JSON.stringify([]));
    }
    if (!localStorage.getItem('jobs')) {
        localStorage.setItem('jobs', JSON.stringify([]));
    }
    if (!localStorage.getItem('interviewers')) {
        localStorage.setItem('interviewers', JSON.stringify([]));
    }
}

function setupEventListeners() {
    // Button events
    document.getElementById('scheduleInterviewBtn').addEventListener('click', () => showModal());
    document.getElementById('calendarViewBtn').addEventListener('click', switchToCalendarView);
    document.getElementById('cancelInterview').addEventListener('click', hideModal);

    // Filter events
    document.getElementById('deptFilter').addEventListener('change', filterInterviews);
    document.getElementById('jobTitleFilter').addEventListener('change', filterInterviews);
    document.getElementById('interviewerFilter').addEventListener('change', filterInterviews);
    document.getElementById('dateFilter').addEventListener('change', filterInterviews);

    // Form events
    document.getElementById('interviewForm').addEventListener('submit', handleInterviewSubmit);
    document.getElementById('interviewMode').addEventListener('change', updateLocationField);
    
    // Modal close on outside click
    document.getElementById('interviewModal').addEventListener('click', (e) => {
        if (e.target.id === 'interviewModal') hideModal();
    });
}

function loadInterviews() {
    const interviews = JSON.parse(localStorage.getItem('interviews')) || [];
    const tbody = document.querySelector('#interviewsTable tbody');
    tbody.innerHTML = '';

    interviews.forEach(interview => {
        const tr = document.createElement('tr');
        const interviewDate = new Date(interview.datetime);
        const formattedDate = interviewDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric'
        });
        const formattedTime = interviewDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit'
        });

        tr.innerHTML = `
            <td>${interview.id}</td>
            <td class="user-cell">
                <img src="${interview.candidateAvatar || '../images/default-avatar.png'}" alt="" class="avatar">
                <div class="user-info">
                    <span class="user-name">${interview.candidateName}</span>
                </div>
            </td>
            <td>${interview.jobTitle}</td>
            <td class="user-cell">
                <img src="${interview.interviewerAvatar || '../images/default-avatar.png'}" alt="" class="avatar">
                <div class="user-info">
                    <span class="user-name">${interview.interviewerName}</span>
                </div>
            </td>
            <td>${formattedDate}<br>${formattedTime}</td>
            <td><span class="mode ${interview.mode}">${interview.mode === 'online' ? '🌐 Online' : '🏢 In-person'}</span></td>
            <td><span class="status ${interview.status.toLowerCase()}">${interview.status}</span></td>
            <td>
                <button class="action-btn" onclick="viewInterview('${interview.id}')">👁️</button>
                <button class="action-btn" onclick="editInterview('${interview.id}')">✏️</button>
                <button class="action-btn" onclick="deleteInterview('${interview.id}')">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateMetrics() {
    const interviews = JSON.parse(localStorage.getItem('interviews')) || [];
    const today = new Date().setHours(0, 0, 0, 0);

    const metrics = {
        scheduled: interviews.filter(i => i.status === 'Scheduled').length,
        completed: interviews.filter(i => i.status === 'Completed').length,
        cancelled: interviews.filter(i => i.status === 'Cancelled').length,
        today: interviews.filter(i => {
            const interviewDate = new Date(i.datetime).setHours(0, 0, 0, 0);
            return interviewDate === today;
        }).length
    };

    document.getElementById('scheduledCount').textContent = metrics.scheduled;
    document.getElementById('completedCount').textContent = metrics.completed;
    document.getElementById('cancelledCount').textContent = metrics.cancelled;
    document.getElementById('todayCount').textContent = metrics.today;
}

function populateFilters() {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const interviewers = JSON.parse(localStorage.getItem('interviewers')) || [];

    // Populate job titles
    const jobSelect = document.getElementById('jobTitleFilter');
    const uniqueJobs = [...new Set(jobs.map(job => job.title))];
    uniqueJobs.forEach(title => {
        const option = document.createElement('option');
        option.value = title;
        option.textContent = title;
        jobSelect.appendChild(option);
    });

    // Populate interviewers
    const interviewerSelect = document.getElementById('interviewerFilter');
    interviewers.forEach(interviewer => {
        const option = document.createElement('option');
        option.value = interviewer.id;
        option.textContent = interviewer.name;
        interviewerSelect.appendChild(option);
    });
}

function filterInterviews() {
    const dept = document.getElementById('deptFilter').value;
    const jobTitle = document.getElementById('jobTitleFilter').value;
    const interviewer = document.getElementById('interviewerFilter').value;
    const date = document.getElementById('dateFilter').value;

    const interviews = JSON.parse(localStorage.getItem('interviews')) || [];
    const filteredInterviews = interviews.filter(interview => {
        const matchesDept = dept === 'all' || interview.department === dept;
        const matchesJob = jobTitle === 'all' || interview.jobTitle === jobTitle;
        const matchesInterviewer = interviewer === 'all' || interview.interviewerId === interviewer;
        const matchesDate = !date || new Date(interview.datetime).toLocaleDateString() === new Date(date).toLocaleDateString();

        return matchesDept && matchesJob && matchesInterviewer && matchesDate;
    });

    displayFilteredInterviews(filteredInterviews);
}

function displayFilteredInterviews(interviews) {
    const tbody = document.querySelector('#interviewsTable tbody');
    tbody.innerHTML = '';

    interviews.forEach(interview => {
        // ... (same as loadInterviews display logic)
    });
}

function showModal(interview = null) {
    const modal = document.getElementById('interviewModal');
    const form = document.getElementById('interviewForm');
    const modalTitle = document.getElementById('modalTitle');

    modalTitle.textContent = interview ? 'Edit Interview' : 'Schedule New Interview';
    
    if (interview) {
        // Populate form with interview data
        document.getElementById('candidateSelect').value = interview.candidateId;
        document.getElementById('jobSelect').value = interview.jobId;
        document.getElementById('interviewerSelect').value = interview.interviewerId;
        document.getElementById('interviewDate').value = new Date(interview.datetime).toISOString().split('T')[0];
        document.getElementById('interviewTime').value = new Date(interview.datetime).toTimeString().slice(0, 5);
        document.getElementById('interviewDuration').value = interview.duration;
        document.getElementById('interviewMode').value = interview.mode;
        document.getElementById('interviewLocation').value = interview.location || '';
        document.getElementById('interviewNotes').value = interview.notes || '';
        form.dataset.interviewId = interview.id;
    } else {
        form.reset();
        delete form.dataset.interviewId;
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('interviewDate').value = tomorrow.toISOString().split('T')[0];
    }

    modal.classList.add('active');
    updateLocationField();
}

function hideModal() {
    const modal = document.getElementById('interviewModal');
    modal.classList.remove('active');
}

function handleInterviewSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const interviews = JSON.parse(localStorage.getItem('interviews')) || [];
    
    const dateTime = new Date(
        document.getElementById('interviewDate').value + 'T' + 
        document.getElementById('interviewTime').value
    );

    const interviewData = {
        id: form.dataset.interviewId || `INT${String(interviews.length + 1).padStart(3, '0')}`,
        candidateId: document.getElementById('candidateSelect').value,
        candidateName: document.getElementById('candidateSelect').options[document.getElementById('candidateSelect').selectedIndex].text,
        jobId: document.getElementById('jobSelect').value,
        jobTitle: document.getElementById('jobSelect').options[document.getElementById('jobSelect').selectedIndex].text,
        interviewerId: document.getElementById('interviewerSelect').value,
        interviewerName: document.getElementById('interviewerSelect').options[document.getElementById('interviewerSelect').selectedIndex].text,
        datetime: dateTime.toISOString(),
        duration: parseInt(document.getElementById('interviewDuration').value),
        mode: document.getElementById('interviewMode').value,
        location: document.getElementById('interviewLocation').value,
        notes: document.getElementById('interviewNotes').value,
        status: 'Scheduled'
    };

    if (form.dataset.interviewId) {
        // Edit existing interview
        const index = interviews.findIndex(i => i.id === form.dataset.interviewId);
        if (index !== -1) {
            interviews[index] = { ...interviews[index], ...interviewData };
        }
    } else {
        // Add new interview
        interviews.push(interviewData);
    }

    localStorage.setItem('interviews', JSON.stringify(interviews));
    hideModal();
    loadInterviews();
    updateMetrics();
}

function updateLocationField() {
    const mode = document.getElementById('interviewMode').value;
    const locationInput = document.getElementById('interviewLocation');
    locationInput.placeholder = mode === 'online' ? 'Enter meeting link' : 'Enter location';
}

function viewInterview(id) {
    const interviews = JSON.parse(localStorage.getItem('interviews')) || [];
    const interview = interviews.find(i => i.id === id);
    if (interview) {
        showModal(interview);
        // Disable form fields for view mode
        const form = document.getElementById('interviewForm');
        Array.from(form.elements).forEach(element => {
            element.disabled = true;
        });
        form.querySelector('[type="submit"]').style.display = 'none';
    }
}

function editInterview(id) {
    const interviews = JSON.parse(localStorage.getItem('interviews')) || [];
    const interview = interviews.find(i => i.id === id);
    if (interview) {
        showModal(interview);
    }
}

function deleteInterview(id) {
    if (confirm('Are you sure you want to delete this interview?')) {
        const interviews = JSON.parse(localStorage.getItem('interviews')) || [];
        const updatedInterviews = interviews.filter(i => i.id !== id);
        localStorage.setItem('interviews', JSON.stringify(updatedInterviews));
        loadInterviews();
        updateMetrics();
    }
}

function switchToCalendarView() {
    // Implement calendar view switch
    alert('Calendar view will be implemented in the next phase');
}

// Populate select fields when showing modal
function populateSelectFields() {
    const candidates = JSON.parse(localStorage.getItem('candidates')) || [];
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const interviewers = JSON.parse(localStorage.getItem('interviewers')) || [];

    const candidateSelect = document.getElementById('candidateSelect');
    const jobSelect = document.getElementById('jobSelect');
    const interviewerSelect = document.getElementById('interviewerSelect');

    // Clear existing options
    candidateSelect.innerHTML = '<option value="">Select Candidate</option>';
    jobSelect.innerHTML = '<option value="">Select Job Position</option>';
    interviewerSelect.innerHTML = '<option value="">Select Interviewer</option>';

    // Populate candidates
    candidates.forEach(candidate => {
        const option = document.createElement('option');
        option.value = candidate.id;
        option.textContent = candidate.name;
        candidateSelect.appendChild(option);
    });

    // Populate jobs
    jobs.forEach(job => {
        const option = document.createElement('option');
        option.value = job.id;
        option.textContent = job.title;
        jobSelect.appendChild(option);
    });

    // Populate interviewers
    interviewers.forEach(interviewer => {
        const option = document.createElement('option');
        option.value = interviewer.id;
        option.textContent = interviewer.name;
        interviewerSelect.appendChild(option);
    });
}