// Popup script
document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (status) => {
    const dot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const toggleBtn = document.getElementById('toggleBtn');

    if (status.isAuthenticated) {
      document.getElementById('authenticated').style.display = 'block';
      document.getElementById('loginSection').style.display = 'none';

      dot.className = `dot ${status.isTracking ? 'active' : 'inactive'}`;
      statusText.textContent = status.isTracking ? 'Tracking Active' : 'Paused';
      document.getElementById('currentDomain').textContent = status.currentDomain || '-';
      document.getElementById('visitCount').textContent = status.visitCount;

      toggleBtn.textContent = status.isTracking ? 'Pause Tracking' : 'Resume Tracking';
      toggleBtn.className = `toggle-btn ${status.isTracking ? 'pause' : 'resume'}`;
    } else {
      document.getElementById('authenticated').style.display = 'none';
      document.getElementById('loginSection').style.display = 'block';
      dot.className = 'dot inactive';
    }
  });
});

function toggleTracking() {
  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (status) => {
    chrome.runtime.sendMessage(
      { type: 'SET_TRACKING', enabled: !status.isTracking },
      () => location.reload()
    );
  });
}

function authenticate() {
  const empId = document.getElementById('empId').value;
  const token = document.getElementById('token').value;
  if (empId && token) {
    chrome.runtime.sendMessage(
      { type: 'SET_AUTH', employeeId: empId, token },
      () => location.reload()
    );
  }
}
