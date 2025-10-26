// Check for admin authentication
document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    if (!user || user.role !== 'Admin') {
        window.location.href = '../signin.html';
        return;
    }
    loadJobs();
    setupEventListeners();
    updateMetrics();
});

// Initialize jobs if not exists
if (!localStorage.getItem('jobs')) {
    localStorage.setItem('jobs', JSON.stringify([]));
}

function setupEventListeners() {
    // Add job button
    document.getElementById('addJobBtn').addEventListener('click', () => showModal());

    // Search and filters
    document.getElementById('jobSearch').addEventListener('input', filterJobs);
    document.getElementById('deptFilter').addEventListener('change', filterJobs);
    document.getElementById('typeFilter').addEventListener('change', filterJobs);
    document.getElementById('statusFilter').addEventListener('change', filterJobs);

    // Modal events
    document.getElementById('cancelJob').addEventListener('click', hideModal);
    document.getElementById('jobForm').addEventListener('submit', handleJobSubmit);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Close modal when clicking outside
    document.getElementById('jobModal').addEventListener('click', (e) => {
        if (e.target.id === 'jobModal') hideModal();
    });
}

function loadJobs() {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const tbody = document.querySelector('#jobsTable tbody');
    tbody.innerHTML = '';

    jobs.forEach(job => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${job.id}</td>
            <td>${job.title}</td>
            <td>${job.department}</td>
            <td>${job.openings}</td>
            <td>${job.applications || 0}</td>
            <td><span class="status ${job.status.toLowerCase()}">${job.status}</span></td>
            <td>
                <button class="action-btn" onclick="viewJob('${job.id}')">👁️</button>
                <button class="action-btn" onclick="editJob('${job.id}')">✏️</button>
                <button class="action-btn" onclick="deleteJob('${job.id}')">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateMetrics() {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    
    const activeJobs = jobs.filter(job => job.status === 'Open').length;
    const closedJobs = jobs.filter(job => job.status === 'Closed').length;
    const totalApplications = jobs.reduce((sum, job) => sum + (job.applications || 0), 0);

    document.getElementById('totalActiveJobs').textContent = activeJobs;
    document.getElementById('totalClosedJobs').textContent = closedJobs;
    document.getElementById('totalApplications').textContent = totalApplications.toLocaleString();
}

function filterJobs() {
    const searchTerm = document.getElementById('jobSearch').value.toLowerCase();
    const deptFilter = document.getElementById('deptFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm) || 
                            job.id.toLowerCase().includes(searchTerm);
        const matchesDept = deptFilter === 'all' || job.department === deptFilter;
        const matchesType = typeFilter === 'all' || job.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

        return matchesSearch && matchesDept && matchesType && matchesStatus;
    });

    const tbody = document.querySelector('#jobsTable tbody');
    tbody.innerHTML = '';

    filteredJobs.forEach(job => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${job.id}</td>
            <td>${job.title}</td>
            <td>${job.department}</td>
            <td>${job.openings}</td>
            <td>${job.applications || 0}</td>
            <td><span class="status ${job.status.toLowerCase()}">${job.status}</span></td>
            <td>
                <button class="action-btn" onclick="viewJob('${job.id}')">👁️</button>
                <button class="action-btn" onclick="editJob('${job.id}')">✏️</button>
                <button class="action-btn" onclick="deleteJob('${job.id}')">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showModal(job = null) {
    const modal = document.getElementById('jobModal');
    const form = document.getElementById('jobForm');
    const modalTitle = document.getElementById('modalTitle');

    modalTitle.textContent = job ? 'Edit Job' : 'Add New Job';
    
    if (job) {
        document.getElementById('jobTitle').value = job.title;
        document.getElementById('jobDept').value = job.department;
        document.getElementById('jobType').value = job.type;
        document.getElementById('jobOpenings').value = job.openings;
        document.getElementById('jobStatus').value = job.status;
        document.getElementById('jobDesc').value = job.description;
        document.getElementById('jobReq').value = job.requirements;
        form.dataset.jobId = job.id;
    } else {
        form.reset();
        delete form.dataset.jobId;
    }

    modal.classList.add('active');
}

function hideModal() {
    const modal = document.getElementById('jobModal');
    modal.classList.remove('active');
}

function handleJobSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    
    const jobData = {
        id: form.dataset.jobId || `J${String(jobs.length + 1).padStart(4, '0')}`,
        title: document.getElementById('jobTitle').value,
        department: document.getElementById('jobDept').value,
        type: document.getElementById('jobType').value,
        openings: parseInt(document.getElementById('jobOpenings').value),
        status: document.getElementById('jobStatus').value,
        description: document.getElementById('jobDesc').value,
        requirements: document.getElementById('jobReq').value,
        applications: 0,
        datePosted: new Date().toISOString()
    };

    if (form.dataset.jobId) {
        // Edit existing job
        const index = jobs.findIndex(j => j.id === form.dataset.jobId);
        if (index !== -1) {
            jobData.applications = jobs[index].applications; // Preserve application count
            jobs[index] = jobData;
        }
    } else {
        // Add new job
        jobs.push(jobData);
    }

    localStorage.setItem('jobs', JSON.stringify(jobs));
    hideModal();
    loadJobs();
    updateMetrics();
}

function viewJob(jobId) {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const job = jobs.find(j => j.id === jobId);
    if (job) {
        showModal(job);
        // Disable form fields for view mode
        const form = document.getElementById('jobForm');
        Array.from(form.elements).forEach(element => {
            element.disabled = true;
        });
        // Hide submit button, show close button only
        form.querySelector('[type="submit"]').style.display = 'none';
    }
}

function editJob(jobId) {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const job = jobs.find(j => j.id === jobId);
    if (job) {
        showModal(job);
        // Enable form fields for edit mode
        const form = document.getElementById('jobForm');
        Array.from(form.elements).forEach(element => {
            element.disabled = false;
        });
        form.querySelector('[type="submit"]').style.display = 'block';
    }
}

function deleteJob(jobId) {
    if (confirm('Are you sure you want to delete this job posting?')) {
        const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
        const updatedJobs = jobs.filter(j => j.id !== jobId);
        localStorage.setItem('jobs', JSON.stringify(updatedJobs));
        loadJobs();
        updateMetrics();
    }
}

function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = '../signin.html';
}

// Authentication is handled by auth.js