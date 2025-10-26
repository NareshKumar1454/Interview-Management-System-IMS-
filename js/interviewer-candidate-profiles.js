// interviewer-candidate-profiles.js

document.addEventListener('DOMContentLoaded', function() {
  // Auth check
  const user = getUser ? getUser() : null;
  if(!user) {
    window.location.href = '../signin.html';
    return;
  }

  // Elements
  const logoutBtn = document.getElementById('logoutBtn');
  const viewProfileBtns = document.querySelectorAll('.btn.primary');
  const backButton = document.querySelector('.back-button');
  const downloadResumeBtn = document.querySelector('.download-resume');
  
  // Event Listeners
  if(logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.removeItem('user');
      window.location.href = '../signin.html';
    });
  }

  viewProfileBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const candidateInfo = this.closest('.candidate-item').querySelector('.candidate-info');
      const candidateName = candidateInfo.querySelector('h3').textContent.trim();
      showCandidateProfile(candidateName);
    });
  });

  if(backButton) {
    backButton.addEventListener('click', function(e) {
      e.preventDefault();
      history.back();
    });
  }

  if(downloadResumeBtn) {
    downloadResumeBtn.addEventListener('click', function() {
      // Placeholder for resume download functionality
      alert('Resume download started... (Demo)');
    });
  }
});

// Sample candidate data
const candidateData = {
  'Sarah Johnson': {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/sarahjohnson',
    position: 'Senior Product Designer',
    department: 'Design Team',
    status: 'In Progress',
    education: [
      {
        degree: 'Master of Design',
        school: 'Stanford University',
        period: '2017 - 2019',
        gpa: '3.8/4.0'
      },
      {
        degree: 'Bachelor of Arts in Graphic Design',
        school: 'UC Berkeley',
        period: '2013 - 2017',
        gpa: '3.6/4.0'
      }
    ],
    experience: [
      {
        title: 'Product Designer',
        company: 'TechCorp Inc.',
        period: '2021 - Present',
        details: [
          'Led design for mobile app used by 2M+ users',
          'Collaborated with cross-functional teams to deliver 15+ features',
          'Improved user engagement by 40% through UX optimization'
        ]
      },
      {
        title: 'UX Designer',
        company: 'StartupXYZ',
        period: '2019 - 2021',
        details: [
          'Designed user interfaces for web and mobile applications',
          'Conducted user research and usability testing',
          'Created design systems and style guides'
        ]
      }
    ],
    skills: {
      design: ['Figma', 'Sketch', 'Adobe Creative Suite', 'Principle'],
      technical: ['HTML/CSS', 'JavaScript', 'React', 'Design Systems'],
      soft: ['User Research', 'Team Leadership', 'Problem Solving', 'Communication']
    },
    feedback: [
      {
        round: 'HR Round',
        date: 'Oct 18, 2024',
        text: 'Excellent communication skills and cultural fit. Shows strong motivation and leadership potential.',
        rating: 5
      },
      {
        round: 'Portfolio Review',
        date: 'Oct 15, 2024',
        text: 'Strong portfolio showcasing diverse projects. Good understanding of design principles and user-centered approach.',
        rating: 4
      }
    ]
  },
  'David Chen': {
    name: 'David Chen',
    email: 'david.chen@email.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/davidchen',
    position: 'Frontend Developer',
    department: 'Engineering',
    status: 'In Progress',
    education: [
      {
        degree: 'Master of Computer Science',
        school: 'University of California, Berkeley',
        period: '2018 - 2020',
        gpa: '3.9/4.0'
      },
      {
        degree: 'Bachelor of Science in Computer Science',
        school: 'University of Washington',
        period: '2014 - 2018',
        gpa: '3.7/4.0'
      }
    ],
    experience: [
      {
        title: 'Senior Frontend Developer',
        company: 'Tech Solutions Inc.',
        period: '2020 - Present',
        details: [
          'Led development of high-traffic e-commerce platform serving 1M+ users',
          'Implemented performance optimizations reducing load time by 40%',
          'Mentored junior developers and established frontend best practices'
        ]
      },
      {
        title: 'Frontend Developer',
        company: 'Innovation Labs',
        period: '2018 - 2020',
        details: [
          'Developed responsive web applications using React and TypeScript',
          'Implemented CI/CD pipelines and automated testing workflows',
          'Collaborated with UX team to improve user experience'
        ]
      }
    ],
    skills: {
      design: ['UI Design', 'Responsive Design', 'Design Systems'],
      technical: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
      soft: ['Problem Solving', 'Team Collaboration', 'Technical Leadership']
    },
    feedback: [
      {
        round: 'Technical Round',
        date: 'Oct 20, 2024',
        text: 'Strong technical skills and problem-solving ability. Excellent understanding of modern frontend technologies.',
        rating: 5
      },
      {
        round: 'System Design',
        date: 'Oct 17, 2024',
        text: 'Demonstrated good architectural knowledge and scalability considerations.',
        rating: 4
      }
    ]
  },
  'Emily Rodriguez': {
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1 (555) 345-6789',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/emilyrodriguez',
    position: 'Marketing Manager',
    department: 'Marketing',
    status: 'In Progress',
    education: [
      {
        degree: 'Master of Business Administration',
        school: 'Stanford Graduate School of Business',
        period: '2016 - 2018',
        gpa: '3.85/4.0'
      },
      {
        degree: 'Bachelor of Arts in Marketing',
        school: 'UCLA',
        period: '2012 - 2016',
        gpa: '3.8/4.0'
      }
    ],
    experience: [
      {
        title: 'Senior Marketing Manager',
        company: 'Global Brands Corp',
        period: '2018 - Present',
        details: [
          'Led digital marketing campaigns resulting in 200% ROI',
          'Managed a team of 5 marketing specialists',
          'Developed and executed comprehensive marketing strategies'
        ]
      },
      {
        title: 'Marketing Specialist',
        company: 'Tech Marketing Agency',
        period: '2016 - 2018',
        details: [
          'Managed social media campaigns for Fortune 500 clients',
          'Increased client engagement by 150% through targeted campaigns',
          'Developed content marketing strategies and analytics reports'
        ]
      }
    ],
    skills: {
      design: ['Adobe Creative Suite', 'Canva', 'Brand Design'],
      technical: ['Google Analytics', 'SEO', 'Marketing Automation', 'CRM'],
      soft: ['Leadership', 'Strategic Planning', 'Client Relations', 'Team Management']
    },
    feedback: [
      {
        round: 'HR Round',
        date: 'Oct 19, 2024',
        text: 'Excellent leadership qualities and strategic thinking. Strong cultural fit.',
        rating: 5
      },
      {
        round: 'Marketing Strategy',
        date: 'Oct 16, 2024',
        text: 'Impressive understanding of digital marketing landscape and growth strategies.',
        rating: 4
      }
    ]
  }
};

function showCandidateProfile(candidateName) {
  const candidate = candidateData[candidateName];
  if (!candidate) return;

  // Update main content with candidate profile
  const mainContent = document.querySelector('.main');
  mainContent.innerHTML = generateProfileHTML(candidate);

  // Reinitialize event listeners for the new content
  initializeProfileEventListeners();
}

function generateProfileHTML(candidate) {
  return `
    <header class="main-header">
      <div class="profile-header">
        <a href="#" class="back-button">← Candidate Profile</a>
      </div>
    </header>

    <div class="candidate-profile">
      <div class="profile-card">
        <div class="profile-banner">
          <div class="candidate-info">
            <img src="../images/profile-placeholder.jpg" alt="${candidate.name}" class="candidate-avatar">
            <div class="candidate-details">
              <h1>${candidate.name}</h1>
              <div class="candidate-email">📧 ${candidate.email}</div>
              <div class="candidate-location">📍 ${candidate.location}</div>
              <div class="candidate-links">
                <a href="tel:${candidate.phone}">📞 ${candidate.phone}</a>
                <a href="https://${candidate.linkedin}" target="_blank">🔗 LinkedIn</a>
              </div>
            </div>
          </div>
          <span class="interview-status">${candidate.status}</span>
        </div>
        
        <div class="profile-meta">
          <div class="meta-item">
            <span class="meta-label">Applied for:</span>
            <span class="meta-value">${candidate.position}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Department:</span>
            <span class="meta-value">${candidate.department}</span>
          </div>
        </div>
      </div>

      <div class="profile-content">
        <div class="profile-main">
          <div class="section-card">
            <h2 class="section-title">
              <span class="section-icon">🎓</span>
              Education
            </h2>
            ${candidate.education.map(edu => `
              <div class="education-item">
                <h3>${edu.degree}</h3>
                <div class="education-meta">
                  ${edu.school} • ${edu.period} • GPA: ${edu.gpa}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="section-card">
            <h2 class="section-title">
              <span class="section-icon">💼</span>
              Work Experience
            </h2>
            ${candidate.experience.map(exp => `
              <div class="experience-item">
                <h3>${exp.title}</h3>
                <div class="experience-meta">
                  ${exp.company} • ${exp.period}
                </div>
                <ul class="experience-details">
                  ${exp.details.map(detail => `<li>${detail}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>

          <div class="section-card">
            <h2 class="section-title">
              <span class="section-icon">⭐</span>
              Skills & Expertise
            </h2>
            <div class="skills-section">
              <div class="skill-group">
                <h4>Design Tools</h4>
                <div class="skill-tags">
                  ${candidate.skills.design.map(skill => 
                    `<span class="skill-tag design">${skill}</span>`
                  ).join('')}
                </div>
              </div>
              <div class="skill-group">
                <h4>Technical Skills</h4>
                <div class="skill-tags">
                  ${candidate.skills.technical.map(skill => 
                    `<span class="skill-tag technical">${skill}</span>`
                  ).join('')}
                </div>
              </div>
              <div class="skill-group">
                <h4>Soft Skills</h4>
                <div class="skill-tags">
                  ${candidate.skills.soft.map(skill => 
                    `<span class="skill-tag soft">${skill}</span>`
                  ).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-sidebar">
          <div class="section-card resume-section">
            <div class="resume-preview">
              <span>📄 Sarah_Johnson_Resume.pdf</span>
            </div>
            <button class="download-resume">Download Resume</button>
          </div>

          <div class="section-card feedback-history">
            <h4>Previous Feedback</h4>
            ${candidate.feedback.map(fb => `
              <div class="feedback-item">
                <div class="feedback-round">${fb.round}</div>
                <div class="feedback-date">${fb.date}</div>
                <div class="feedback-text">${fb.text}</div>
                <div class="feedback-rating">
                  ${'★'.repeat(fb.rating)}${'☆'.repeat(5-fb.rating)} ${fb.rating}/5
                </div>
              </div>
            `).join('')}
          </div>

          <div class="action-buttons">
            <a href="../interviewer/feedbacks.html" class="action-button primary-button">Submit Feedback</a>
            <a href="#" class="action-button secondary-button">Schedule Next Round</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function initializeProfileEventListeners() {
  const backButton = document.querySelector('.back-button');
  const downloadResumeBtn = document.querySelector('.download-resume');

  if(backButton) {
    backButton.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.reload();
    });
  }

  if(downloadResumeBtn) {
    downloadResumeBtn.addEventListener('click', function() {
      alert('Resume download started... (Demo)');
    });
  }
}