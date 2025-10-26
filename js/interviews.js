// Interview Schedule page logic
document.addEventListener('DOMContentLoaded', () => {
  // Auth check
  const user = getUser ? getUser() : null;
  if(!user){ window.location.href = 'signin.html'; return; }

  // Elements
  const calendar = document.querySelector('.calendar');
  const interviewsList = document.getElementById('scheduledInterviews');
  const remindersList = document.getElementById('remindersList');
  const prevWeekBtn = document.getElementById('prevWeek');
  const nextWeekBtn = document.getElementById('nextWeek');
  
  // Camera test modal
  const cameraModal = document.getElementById('cameraModal');
  const testCameraBtn = document.getElementById('testCameraBtn');
  const closeCameraTest = document.getElementById('closeCameraTest');
  const videoPreview = document.getElementById('videoPreview');
  const audioLevel = document.getElementById('audioLevel');
  
  // Tips modal
  const tipsModal = document.getElementById('tipsModal');
  const interviewTipsBtn = document.getElementById('interviewTipsBtn');
  const closeTips = document.getElementById('closeTips');

  // Calendar download
  const downloadCalBtn = document.getElementById('downloadCalBtn');

  let currentDate = new Date();
  let currentWeek = getWeekDates(currentDate);
  let stream = null; // for camera/mic

  // Initial render
  renderCalendar(currentWeek);
  renderInterviews();
  renderReminders();

  // Calendar navigation
  prevWeekBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 7);
    currentWeek = getWeekDates(currentDate);
    renderCalendar(currentWeek);
  });

  nextWeekBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 7);
    currentWeek = getWeekDates(currentDate);
    renderCalendar(currentWeek);
  });

  // Quick actions
  testCameraBtn.addEventListener('click', startCameraTest);
  closeCameraTest.addEventListener('click', stopCameraTest);
  downloadCalBtn.addEventListener('click', downloadCalendar);
  interviewTipsBtn.addEventListener('click', () => {
    tipsModal.classList.add('show');
  });
  closeTips.addEventListener('click', () => {
    tipsModal.classList.remove('show');
  });

  // Close modals on background click
  [cameraModal, tipsModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if(e.target === modal) {
        modal.classList.remove('show');
        if(modal === cameraModal) stopCameraTest();
      }
    });
  });

  function renderCalendar(weekDates) {
    // Clear previous dates
    const existingDates = calendar.querySelectorAll('.date');
    existingDates.forEach(d => d.remove());

    // Add new dates
    weekDates.forEach(date => {
      const dateDiv = document.createElement('div');
      dateDiv.className = 'date';
      if(isSameDate(date, new Date())) dateDiv.classList.add('today');
      
      const hasInterview = interviews.some(i => isSameDate(new Date(i.date), date));
      if(hasInterview) dateDiv.classList.add('has-interview');
      
      dateDiv.textContent = date.getDate();
      calendar.appendChild(dateDiv);
    });
  }

  function renderInterviews() {
    const sortedInterviews = [...interviews].sort((a,b) => new Date(a.date) - new Date(b.date));
    
    interviewsList.innerHTML = sortedInterviews.map(interview => {
      const date = new Date(interview.date);
      return `
        <div class="interview-card">
          <div class="interview-header">
            <div>
              <h3 class="interview-title">${escapeHtml(interview.title)}</h3>
              <div class="interview-type">${escapeHtml(interview.type)}</div>
              <div class="interview-meta">
                <span>📅 ${formatDate(date)}</span>
                <span>🕒 ${formatTime(date)}</span>
                <span>👤 ${escapeHtml(interview.interviewer)}</span>
                <span>💻 ${interview.isOnline ? 'Online Interview' : 'In-Person'}</span>
              </div>
            </div>
            <span class="status-badge status-${interview.status.toLowerCase()}">${interview.status}</span>
          </div>
          <div class="interview-actions">
            ${interview.status === 'Scheduled' ? `
              <button class="btn-join" onclick="window.location.href='${interview.joinUrl}'">Join Interview</button>
              <button class="btn-reschedule" onclick="requestReschedule('${interview.id}')">Request Reschedule</button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderReminders() {
    const today = new Date();
    const reminders = interviews
      .filter(i => i.status === 'Scheduled')
      .sort((a,b) => new Date(a.date) - new Date(b.date))
      .slice(0, 2)
      .map(interview => {
        const date = new Date(interview.date);
        const isUrgent = date.getDate() - today.getDate() <= 1;
        return {
          title: interview.title,
          date,
          isUrgent
        };
      });

    remindersList.innerHTML = reminders.map(r => `
      <div class="reminder-item ${r.isUrgent ? 'urgent' : ''}">
        <h4>${r.isUrgent ? 'Next Interview' : 'In 3 Days'}</h4>
        <p>${escapeHtml(r.title)}<br>${formatDate(r.date)}, ${formatTime(r.date)}</p>
      </div>
    `).join('');
  }

  async function startCameraTest() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoPreview.srcObject = stream;
      cameraModal.classList.add('show');
      
      // Audio meter
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      
      function updateAudioLevel() {
        if(!stream) return;
        const data = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(data);
        const average = data.reduce((a,b) => a+b) / data.length;
        const level = Math.min(100, Math.round((average / 128) * 100));
        audioLevel.style.width = level + '%';
        if(stream) requestAnimationFrame(updateAudioLevel);
      }
      updateAudioLevel();
    } catch(err) {
      alert('Could not access camera/microphone. Please check permissions.');
      console.error(err);
    }
  }

  function stopCameraTest() {
    if(stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    cameraModal.classList.remove('show');
  }

  function downloadCalendar() {
    // Generate .ics format calendar
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Interview MS//Interview Schedule//EN'
    ];

    interviews.forEach(interview => {
      const start = new Date(interview.date);
      const end = new Date(start.getTime() + (60 * 60 * 1000)); // 1 hour duration
      
      icsContent = icsContent.concat([
        'BEGIN:VEVENT',
        'UID:' + interview.id,
        'DTSTAMP:' + formatICSDate(new Date()),
        'DTSTART:' + formatICSDate(start),
        'DTEND:' + formatICSDate(end),
        'SUMMARY:Interview: ' + interview.title,
        'DESCRIPTION:' + interview.type + '\\nInterviewer: ' + interview.interviewer,
        'END:VEVENT'
      ]);
    });

    icsContent.push('END:VCALENDAR');
    
    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'interview-schedule.ics';
    link.click();
    URL.revokeObjectURL(url);
  }

  // Helper functions
  function getWeekDates(date) {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    return Array(7).fill().map((_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  }

  function isSameDate(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  function formatTime(date) {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }

  function formatICSDate(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  function escapeHtml(str) {
    return (str+'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function requestReschedule(id) {
    const interview = interviews.find(i => i.id === id);
    if(!interview) return;
    alert(`Reschedule requested for: ${interview.title}\nA confirmation email will be sent with available time slots.`);
  }
});

// Sample interview data (would come from backend)
const interviews = [
  {
    id: 'int_1',
    title: 'Senior Product Designer',
    type: 'Technical Round - Portfolio Review',
    date: '2025-10-23T14:00:00',
    interviewer: 'Sarah Johnson',
    isOnline: true,
    status: 'Scheduled',
    joinUrl: '#'
  },
  {
    id: 'int_2',
    title: 'Frontend Developer (React)',
    type: 'Final Round - Team Interview',
    date: '2025-10-25T10:30:00',
    interviewer: 'Mike Chen',
    isOnline: false,
    status: 'Scheduled',
    joinUrl: '#'
  },
  {
    id: 'int_3',
    title: 'Marketing Manager',
    type: 'HR Round - Initial Screening',
    date: '2025-10-18T15:00:00',
    interviewer: 'Lisa Wang',
    isOnline: true,
    status: 'Completed',
    joinUrl: '#'
  }
];