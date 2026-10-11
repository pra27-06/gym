// Client-side Application State
const state = {
  user: JSON.parse(localStorage.getItem('gym_user') || 'null'),
  token: localStorage.getItem('gym_token') || null,
  currentPage: 'login-register',
  pollingInterval: null
};

// API Helper
async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  const response = await fetch(path, { ...options, headers });
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = { error: 'Invalid response from server' };
  }

  if (!response.ok) {
    const errorMsg = data.error || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

// Navigation & Protected Route Guard
function navigate(page) {
  // Clear any existing polling
  if (state.pollingInterval) {
    clearInterval(state.pollingInterval);
    state.pollingInterval = null;
  }

  // Protection Guard
  if (!state.token && page !== 'login-register') {
    state.currentPage = 'login-register';
  } else if (page === 'admin' && (!state.user || state.user.role !== 'admin')) {
    // Member cannot open admin page
    alert('Access Forbidden: Admin access only.');
    state.currentPage = 'sessions';
  } else if (state.token && page === 'login-register') {
    state.currentPage = state.user.role === 'admin' ? 'admin' : 'sessions';
  } else {
    state.currentPage = page;
  }

  renderNav();
  renderPage();
}

function renderNav() {
  const nav = document.getElementById('nav-links');
  if (!state.token) {
    nav.innerHTML = `
      <button class="nav-btn ${state.currentPage === 'login-register' ? 'active' : ''}" onclick="navigate('login-register')">Login / Register</button>
    `;
    return;
  }

  let links = `
    <button class="nav-btn ${state.currentPage === 'sessions' ? 'active' : ''}" onclick="navigate('sessions')">Sessions</button>
    <button class="nav-btn ${state.currentPage === 'my-bookings' ? 'active' : ''}" onclick="navigate('my-bookings')">My Bookings</button>
  `;

  if (state.user && state.user.role === 'admin') {
    links += `<button class="nav-btn ${state.currentPage === 'admin' ? 'active' : ''}" onclick="navigate('admin')">Admin</button>`;
  }

  links += `<button class="nav-btn" onclick="logout()">Logout (${escapeHtml(state.user.name)})</button>`;
  nav.innerHTML = links;
}

function logout() {
  localStorage.removeItem('gym_user');
  localStorage.removeItem('gym_token');
  state.user = null;
  state.token = null;
  navigate('login-register');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Page Render Router
function renderPage() {
  const container = document.getElementById('app-content');
  switch (state.currentPage) {
    case 'login-register':
      renderLoginRegister(container);
      break;
    case 'sessions':
      renderSessions(container);
      break;
    case 'my-bookings':
      renderMyBookings(container);
      break;
    case 'admin':
      renderAdmin(container);
      break;
    default:
      renderLoginRegister(container);
  }
}

// ==========================================
// PAGE 1: Login & Register
// ==========================================
function renderLoginRegister(container) {
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
      <!-- Login Card -->
      <section class="card" aria-labelledby="login-heading">
        <h2 id="login-heading">Log In</h2>
        <div id="login-message" role="alert"></div>
        <form id="login-form" onsubmit="handleLogin(event)">
          <div class="form-group">
            <label for="login-email">Email Address</label>
            <input type="email" id="login-email" required autocomplete="email">
            <div id="login-email-err" class="state-message state-error" style="display:none"></div>
          </div>
          <div class="form-group">
            <label for="login-password">Password</label>
            <input type="password" id="login-password" required autocomplete="current-password">
            <div id="login-password-err" class="state-message state-error" style="display:none"></div>
          </div>
          <button type="submit" id="login-btn" class="btn">Log In</button>
        </form>
      </section>

      <!-- Register Card -->
      <section class="card" aria-labelledby="register-heading">
        <h2 id="register-heading">Register as Member</h2>
        <div id="register-message" role="alert"></div>
        <form id="register-form" onsubmit="handleRegister(event)">
          <div class="form-group">
            <label for="reg-name">Full Name</label>
            <input type="text" id="reg-name" required autocomplete="name">
            <div id="reg-name-err" class="state-message state-error" style="display:none"></div>
          </div>
          <div class="form-group">
            <label for="reg-email">Email Address</label>
            <input type="email" id="reg-email" required autocomplete="email">
            <div id="reg-email-err" class="state-message state-error" style="display:none"></div>
          </div>
          <div class="form-group">
            <label for="reg-password">Password (min 6 characters)</label>
            <input type="password" id="reg-password" required minlength="6" autocomplete="new-password">
            <div id="reg-password-err" class="state-message state-error" style="display:none"></div>
          </div>
          <button type="submit" id="reg-btn" class="btn">Register Member</button>
        </form>
      </section>
    </div>
  `;
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const msg = document.getElementById('login-message');
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');

  msg.innerHTML = '';
  btn.disabled = true;

  try {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: emailInput.value, password: passInput.value })
    });
    localStorage.setItem('gym_token', res.token);
    localStorage.setItem('gym_user', JSON.stringify(res.user));
    state.token = res.token;
    state.user = res.user;

    navigate(res.user.role === 'admin' ? 'admin' : 'sessions');
  } catch (err) {
    msg.innerHTML = `<div class="state-message state-error">${escapeHtml(err.message)}</div>`;
  } finally {
    btn.disabled = false;
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('reg-btn');
  const msg = document.getElementById('register-message');
  const nameInput = document.getElementById('reg-name');
  const emailInput = document.getElementById('reg-email');
  const passInput = document.getElementById('reg-password');

  msg.innerHTML = '';
  btn.disabled = true;

  try {
    const res = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: nameInput.value,
        email: emailInput.value,
        password: passInput.value
      })
    });
    localStorage.setItem('gym_token', res.token);
    localStorage.setItem('gym_user', JSON.stringify(res.user));
    state.token = res.token;
    state.user = res.user;

    navigate('sessions');
  } catch (err) {
    msg.innerHTML = `<div class="state-message state-error">${escapeHtml(err.message)}</div>`;
  } finally {
    btn.disabled = false;
  }
}

// ==========================================
// PAGE 2: Sessions List
// ==========================================
let currentSessions = [];

function renderSessions(container) {
  container.innerHTML = `
    <section class="card" aria-labelledby="sessions-heading">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
        <h2 id="sessions-heading">Upcoming Gym Sessions</h2>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <label for="date-filter" style="margin-bottom:0">Filter by Date:</label>
          <input type="date" id="date-filter" onchange="loadSessions(this.value)" style="width: auto;">
          <button class="btn" style="padding: 0.4rem 0.8rem;" onclick="clearDateFilter()">Clear</button>
        </div>
      </div>
      <div id="sessions-feedback" role="alert"></div>
      <div id="sessions-container" class="grid-list">
        <div class="state-message state-loading">Loading sessions...</div>
      </div>
    </section>
  `;

  loadSessions();

  // Background update: Seats remaining update while page is open without refresh (polling every 5 seconds)
  state.pollingInterval = setInterval(() => {
    const dateVal = document.getElementById('date-filter')?.value || '';
    pollSessions(dateVal);
  }, 5000);
}

function clearDateFilter() {
  const input = document.getElementById('date-filter');
  if (input) input.value = '';
  loadSessions();
}

async function loadSessions(dateFilter = '') {
  const container = document.getElementById('sessions-container');
  if (!container) return;
  container.innerHTML = `<div class="state-message state-loading">Loading sessions...</div>`;

  try {
    const url = dateFilter ? `/api/sessions?date=${encodeURIComponent(dateFilter)}` : '/api/sessions';
    const data = await api(url);
    currentSessions = data.sessions;
    renderSessionsList(currentSessions);
  } catch (err) {
    container.innerHTML = `<div class="state-message state-error">${escapeHtml(err.message)}</div>`;
  }
}

async function pollSessions(dateFilter = '') {
  const container = document.getElementById('sessions-container');
  if (!container) return;

  try {
    const url = dateFilter ? `/api/sessions?date=${encodeURIComponent(dateFilter)}` : '/api/sessions';
    const data = await api(url);
    currentSessions = data.sessions;
    renderSessionsList(currentSessions);
  } catch (err) {
    // Polling fails silently without interrupting user
  }
}

function renderSessionsList(sessions) {
  const container = document.getElementById('sessions-container');
  if (!container) return;

  if (sessions.length === 0) {
    container.innerHTML = `<div class="state-message state-empty">No sessions found for this date.</div>`;
    return;
  }

  container.innerHTML = sessions.map(s => {
    const isOpen = s.seats_remaining > 0;
    const badgeClass = isOpen ? 'badge-open' : 'badge-full';
    const badgeText = isOpen ? `${s.seats_remaining} seats remaining` : 'FULL (20/20)';

    let actionButton = '';
    if (s.is_booked_by_user) {
      actionButton = `<span class="badge badge-open">✓ You are Booked</span>`;
    } else if (s.is_waitlisted_by_user) {
      actionButton = `
        <span class="badge" style="background:#fef08a;color:#854d0e;">On Waitlist</span>
        <button class="btn btn-danger" style="margin-top:0.5rem;padding:0.3rem 0.6rem;font-size:0.85rem;" onclick="handleLeaveWaitlist(${s.id})">Leave Waitlist</button>
      `;
    } else if (isOpen) {
      actionButton = `<button class="btn" id="book-btn-${s.id}" onclick="handleBookSession(${s.id})">Book Seat</button>`;
    } else {
      actionButton = `<button class="btn" style="background-color:#64748b" id="waitlist-btn-${s.id}" onclick="handleJoinWaitlist(${s.id})">Join Waitlist</button>`;
    }

    return `
      <article class="session-item" id="session-card-${s.id}">
        <h3>${escapeHtml(s.session_date)}</h3>
        <p><strong>Time:</strong> ${String(s.start_hour).padStart(2, '0')}:00 - ${String(s.start_hour + 1).padStart(2, '0')}:00</p>
        <p><span class="badge ${badgeClass}" id="seat-badge-${s.id}">${badgeText}</span></p>
        <div style="margin-top: 1rem;">${actionButton}</div>
      </article>
    `;
  }).join('');
}

// Rule: Booking feels instant: the seat count updates straight away and rolls back if the server refuses.
async function handleBookSession(sessionId) {
  const feedback = document.getElementById('sessions-feedback');
  const btn = document.getElementById(`book-btn-${sessionId}`);
  const badge = document.getElementById(`seat-badge-${sessionId}`);

  const targetSession = currentSessions.find(s => s.id === sessionId);
  if (!targetSession) return;

  const previousSeats = targetSession.seats_remaining;

  // Optimistic UI update
  targetSession.seats_remaining = Math.max(0, previousSeats - 1);
  if (badge) {
    badge.textContent = targetSession.seats_remaining > 0 ? `${targetSession.seats_remaining} seats remaining` : 'FULL (20/20)';
  }
  if (btn) btn.disabled = true;

  try {
    await api('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId })
    });
    feedback.innerHTML = `<div class="state-message state-success">Booking confirmed successfully! Visit "My Bookings" to view your check-in code.</div>`;
    // Reload freshly confirmed status
    loadSessions(document.getElementById('date-filter')?.value || '');
  } catch (err) {
    // Rollback on failure
    targetSession.seats_remaining = previousSeats;
    if (badge) {
      badge.textContent = previousSeats > 0 ? `${previousSeats} seats remaining` : 'FULL (20/20)';
    }
    if (btn) btn.disabled = false;
    feedback.innerHTML = `<div class="state-message state-error">Booking failed: ${escapeHtml(err.message)}</div>`;
  }
}

async function handleJoinWaitlist(sessionId) {
  const feedback = document.getElementById('sessions-feedback');
  const btn = document.getElementById(`waitlist-btn-${sessionId}`);
  if (btn) btn.disabled = true;

  try {
    await api('/api/bookings/waitlist', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId })
    });
    feedback.innerHTML = `<div class="state-message state-success">Joined waitlist. You will be automatically booked if a slot opens up.</div>`;
    loadSessions(document.getElementById('date-filter')?.value || '');
  } catch (err) {
    feedback.innerHTML = `<div class="state-message state-error">Could not join waitlist: ${escapeHtml(err.message)}</div>`;
    if (btn) btn.disabled = false;
  }
}

async function handleLeaveWaitlist(sessionId) {
  const feedback = document.getElementById('sessions-feedback');
  try {
    await api(`/api/bookings/waitlist/${sessionId}`, { method: 'DELETE' });
    feedback.innerHTML = `<div class="state-message state-success">Removed from waitlist.</div>`;
    loadSessions(document.getElementById('date-filter')?.value || '');
  } catch (err) {
    feedback.innerHTML = `<div class="state-message state-error">Error: ${escapeHtml(err.message)}</div>`;
  }
}

// ==========================================
// PAGE 3: My Bookings
// ==========================================
async function renderMyBookings(container) {
  container.innerHTML = `
    <section class="card" aria-labelledby="bookings-heading">
      <h2 id="bookings-heading">My Bookings</h2>
      <div id="my-bookings-feedback" role="alert"></div>
      <div id="my-bookings-container">
        <div class="state-message state-loading">Loading your bookings...</div>
      </div>
    </section>
  `;

  loadMyBookings();
}

async function loadMyBookings() {
  const container = document.getElementById('my-bookings-container');
  if (!container) return;

  try {
    const data = await api('/api/bookings/my');
    const bookings = data.bookings;

    if (bookings.length === 0) {
      container.innerHTML = `<div class="state-message state-empty">You have no bookings yet.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="grid-list">
        ${bookings.map(b => {
          const isCancelled = b.status === 'cancelled';
          const isCheckedIn = b.is_checked_in === 1;

          let statusBadge = '';
          if (isCancelled) {
            statusBadge = `<span class="badge badge-full">Cancelled</span>`;
          } else if (isCheckedIn) {
            statusBadge = `<span class="badge badge-open">Checked In</span>`;
          } else {
            statusBadge = `<span class="badge badge-open">Confirmed</span>`;
          }

          return `
            <article class="booking-item">
              <h3>${escapeHtml(b.session_date)}</h3>
              <p><strong>Time:</strong> ${String(b.start_hour).padStart(2, '0')}:00 - ${String(b.start_hour + 1).padStart(2, '0')}:00</p>
              <p><strong>Status:</strong> ${statusBadge}</p>
              <p style="margin: 0.5rem 0;">
                <strong>Check-in Code:</strong> <span class="code-display">${escapeHtml(b.check_in_code)}</span>
              </p>
              ${!isCancelled && !isCheckedIn ? `
                <button class="btn btn-danger" id="cancel-btn-${b.id}" onclick="handleCancelBooking(${b.id})" style="margin-top:0.5rem">Cancel Booking</button>
              ` : ''}
            </article>
          `;
        }).join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="state-message state-error">${escapeHtml(err.message)}</div>`;
  }
}

async function handleCancelBooking(bookingId) {
  const btn = document.getElementById(`cancel-btn-${bookingId}`);
  const feedback = document.getElementById('my-bookings-feedback');

  if (!confirm('Are you sure you want to cancel this booking?')) return;

  if (btn) btn.disabled = true;

  try {
    await api(`/api/bookings/${bookingId}/cancel`, { method: 'POST' });
    feedback.innerHTML = `<div class="state-message state-success">Booking cancelled successfully.</div>`;
    loadMyBookings();
  } catch (err) {
    feedback.innerHTML = `<div class="state-message state-error">Cancellation failed: ${escapeHtml(err.message)}</div>`;
    if (btn) btn.disabled = false;
  }
}

// ==========================================
// PAGE 4: Admin Page
// Rule: Does three things: create a session, see a session's bookings, and mark who turned up.
// ==========================================
function renderAdmin(container) {
  container.innerHTML = `
    <!-- 1. Create Session Section -->
    <section class="card" aria-labelledby="create-session-heading">
      <h2 id="create-session-heading">1. Create a Session</h2>
      <div id="admin-create-feedback" role="alert"></div>
      <form id="create-session-form" onsubmit="handleCreateSession(event)">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div class="form-group">
            <label for="sess-date">Session Date</label>
            <input type="date" id="sess-date" required>
          </div>
          <div class="form-group">
            <label for="sess-hour">Start Hour (0 to 23)</label>
            <input type="number" id="sess-hour" min="0" max="23" placeholder="e.g. 10 for 10:00" required>
          </div>
        </div>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.75rem;">Capacity is fixed at 20 people and duration lasts strictly 1 hour.</p>
        <button type="submit" id="create-sess-btn" class="btn">Create Session</button>
      </form>
    </section>

    <!-- 2. Check-in Section -->
    <section class="card" aria-labelledby="checkin-heading">
      <h2 id="checkin-heading">2. Member Check-in</h2>
      <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.75rem;">Type the 6-character short code to mark the member present during their session's hour.</p>
      <div id="admin-checkin-feedback" role="alert"></div>
      <form id="checkin-form" onsubmit="handleAdminCheckin(event)">
        <div class="form-group" style="max-width: 320px;">
          <label for="checkin-code">Check-in Code</label>
          <input type="text" id="checkin-code" placeholder="e.g. 7XKP2Q" required maxlength="10" style="text-transform:uppercase;">
        </div>
        <button type="submit" id="checkin-btn" class="btn">Check In Member</button>
      </form>
    </section>

    <!-- 3. View Session Bookings Section -->
    <section class="card" aria-labelledby="view-bookings-heading">
      <h2 id="view-bookings-heading">3. See Session Bookings</h2>
      <div class="form-group" style="max-width: 350px;">
        <label for="select-session">Select Session to Inspect</label>
        <select id="select-session" onchange="loadSessionBookings(this.value)">
          <option value="">-- Choose a session --</option>
        </select>
      </div>
      <div id="session-attendees-container">
        <div class="state-message state-empty">Select a session above to inspect its attendees.</div>
      </div>
    </section>
  `;

  populateSessionDropdown();
}

async function populateSessionDropdown() {
  const select = document.getElementById('select-session');
  if (!select) return;

  try {
    const data = await api('/api/sessions');
    select.innerHTML = `<option value="">-- Choose a session --</option>` +
      data.sessions.map(s => `
        <option value="${s.id}">${s.session_date} at ${String(s.start_hour).padStart(2, '0')}:00 (${s.seats_remaining} seats left)</option>
      `).join('');
  } catch (err) {
    select.innerHTML = `<option value="">Error loading sessions</option>`;
  }
}

async function handleCreateSession(e) {
  e.preventDefault();
  const feedback = document.getElementById('admin-create-feedback');
  const btn = document.getElementById('create-sess-btn');
  const dateInput = document.getElementById('sess-date');
  const hourInput = document.getElementById('sess-hour');

  feedback.innerHTML = '';
  btn.disabled = true;

  try {
    const res = await api('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        session_date: dateInput.value,
        start_hour: parseInt(hourInput.value, 10)
      })
    });
    feedback.innerHTML = `<div class="state-message state-success">Session created successfully for ${res.session.session_date} at ${res.session.start_hour}:00!</div>`;
    dateInput.value = '';
    hourInput.value = '';
    populateSessionDropdown();
  } catch (err) {
    feedback.innerHTML = `<div class="state-message state-error">${escapeHtml(err.message)}</div>`;
  } finally {
    btn.disabled = false;
  }
}

async function handleAdminCheckin(e) {
  e.preventDefault();
  const feedback = document.getElementById('admin-checkin-feedback');
  const btn = document.getElementById('checkin-btn');
  const codeInput = document.getElementById('checkin-code');

  feedback.innerHTML = '';
  btn.disabled = true;

  try {
    const res = await api('/api/admin/check-in', {
      method: 'POST',
      body: JSON.stringify({ code: codeInput.value.trim() })
    });
    feedback.innerHTML = `
      <div class="state-message state-success">
        ✓ <strong>Checked in:</strong> ${escapeHtml(res.member.name)} (${escapeHtml(res.member.email)})<br>
        Session: ${escapeHtml(res.session.session_date)} at ${res.session.start_hour}:00
      </div>
    `;
    codeInput.value = '';
  } catch (err) {
    feedback.innerHTML = `<div class="state-message state-error">Check-in failed: ${escapeHtml(err.message)}</div>`;
  } finally {
    btn.disabled = false;
  }
}

async function loadSessionBookings(sessionId) {
  const container = document.getElementById('session-attendees-container');
  if (!container) return;

  if (!sessionId) {
    container.innerHTML = `<div class="state-message state-empty">Select a session above to inspect its attendees.</div>`;
    return;
  }

  container.innerHTML = `<div class="state-message state-loading">Loading attendee list...</div>`;

  try {
    const data = await api(`/api/sessions/${sessionId}/bookings`);
    const bookings = data.bookings;

    if (bookings.length === 0) {
      container.innerHTML = `<div class="state-message state-empty">No bookings for this session yet.</div>`;
      return;
    }

    container.innerHTML = `
      <table style="width:100%; border-collapse:collapse; margin-top:1rem; font-size:0.95rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border); text-align:left;">
            <th style="padding:0.5rem">Member</th>
            <th style="padding:0.5rem">Email</th>
            <th style="padding:0.5rem">Status</th>
            <th style="padding:0.5rem">Code</th>
            <th style="padding:0.5rem">Checked In</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.map(b => `
            <tr style="border-bottom:1px solid var(--border);">
              <td style="padding:0.5rem">${escapeHtml(b.member_name)}</td>
              <td style="padding:0.5rem">${escapeHtml(b.member_email)}</td>
              <td style="padding:0.5rem"><span class="badge ${b.status === 'confirmed' ? 'badge-open' : 'badge-full'}">${escapeHtml(b.status)}</span></td>
              <td style="padding:0.5rem"><span class="code-display">${escapeHtml(b.check_in_code)}</span></td>
              <td style="padding:0.5rem">${b.is_checked_in === 1 ? '✓ Yes' : 'No'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    container.innerHTML = `<div class="state-message state-error">${escapeHtml(err.message)}</div>`;
  }
}

// Initial Boot
window.addEventListener('DOMContentLoaded', () => {
  if (state.token) {
    navigate(state.user.role === 'admin' ? 'admin' : 'sessions');
  } else {
    navigate('login-register');
  }
});
