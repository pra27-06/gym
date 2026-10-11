// Client-side Application State
const state = {
  user: JSON.parse(localStorage.getItem('gym_user') || 'null'),
  token: localStorage.getItem('gym_token') || null,
  currentPage: 'login-register',
  authTab: 'login', // 'login' or 'register'
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
    alert('Access Forbidden: Admin privileges required.');
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
      <button class="nav-btn ${state.currentPage === 'login-register' ? 'active' : ''}" onclick="navigate('login-register')">Portal Sign In</button>
    `;
    return;
  }

  let links = `
    <button class="nav-btn ${state.currentPage === 'sessions' ? 'active' : ''}" onclick="navigate('sessions')">Sessions</button>
    <button class="nav-btn ${state.currentPage === 'my-bookings' ? 'active' : ''}" onclick="navigate('my-bookings')">My Passes</button>
  `;

  if (state.user && state.user.role === 'admin') {
    links += `<button class="nav-btn ${state.currentPage === 'admin' ? 'active' : ''}" onclick="navigate('admin')">Admin Hub</button>`;
  }

  links += `<button class="nav-btn btn-logout" onclick="logout()">Sign Out (${escapeHtml(state.user.name)})</button>`;
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
// PAGE 1: Login & Register (Editorial Split Screen)
// ==========================================
function renderLoginRegister(container) {
  const isLogin = state.authTab === 'login';

  container.innerHTML = `
    <div class="auth-split-wrapper">
      <!-- Left Editorial Panel -->
      <div class="auth-editorial-panel">
        <div>
          <div class="auth-editorial-tag">Engineered For Performance</div>
          <h1 class="auth-editorial-title">PULSE OF <br><span class="lime">PERFECTION.</span></h1>
          <p class="auth-editorial-desc">Reserve elite gym sessions, track live capacity, and unlock turnkey turnstile check-ins with guaranteed capacity enforcement.</p>
        </div>

        <div class="auth-editorial-stats">
          <div>
            <div class="stat-metric">20</div>
            <div class="stat-label">Max Athletes / Slot</div>
          </div>
          <div>
            <div class="stat-metric">60m</div>
            <div class="stat-label">High-Impact Sessions</div>
          </div>
          <div>
            <div class="stat-metric">FIFO</div>
            <div class="stat-label">Dynamic Waitlist</div>
          </div>
        </div>
      </div>

      <!-- Right Interactive Form Panel -->
      <div class="auth-forms-panel">
        <div class="auth-tabs">
          <button class="auth-tab-btn ${isLogin ? 'active' : ''}" onclick="switchAuthTab('login')">Account Sign In</button>
          <button class="auth-tab-btn ${!isLogin ? 'active' : ''}" onclick="switchAuthTab('register')">New Athlete Register</button>
        </div>

        ${isLogin ? `
          <!-- Sign In Form -->
          <div id="login-container">
            <div id="login-message" role="alert"></div>
            <form id="login-form" onsubmit="handleLogin(event)">
              <div class="form-group">
                <label for="login-email">Athlete / Staff Email</label>
                <input type="email" id="login-email" placeholder="e.g. member@gym.com" required autocomplete="email">
              </div>
              <div class="form-group">
                <label for="login-password">Access Password</label>
                <input type="password" id="login-password" placeholder="••••••••••••" required autocomplete="current-password">
              </div>
              <button type="submit" id="login-btn" class="btn" style="width: 100%; margin-top: 0.5rem;">Access Portal →</button>
            </form>
          </div>
        ` : `
          <!-- Register Form -->
          <div id="register-container">
            <div id="register-message" role="alert"></div>
            <form id="register-form" onsubmit="handleRegister(event)">
              <div class="form-group">
                <label for="reg-name">Full Athlete Name</label>
                <input type="text" id="reg-name" placeholder="e.g. Taylor Vance" required autocomplete="name">
              </div>
              <div class="form-group">
                <label for="reg-email">Personal Email</label>
                <input type="email" id="reg-email" placeholder="e.g. athlete@gym.com" required autocomplete="email">
              </div>
              <div class="form-group">
                <label for="reg-password">Password (Minimum 6 Characters)</label>
                <input type="password" id="reg-password" placeholder="••••••••••••" required minlength="6" autocomplete="new-password">
              </div>
              <button type="submit" id="reg-btn" class="btn" style="width: 100%; margin-top: 0.5rem;">Create Athlete Profile →</button>
            </form>
          </div>
        `}
      </div>
    </div>
  `;
}

function switchAuthTab(tab) {
  state.authTab = tab;
  renderPage();
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
      <div class="card-header-flex">
        <div>
          <h2 id="sessions-heading">Daily Training Schedule</h2>
          <p style="color:var(--text-muted);font-size:0.85rem;margin-top:0.35rem;">Real-time availability polls every 5 seconds. Sessions strictly capped at 20.</p>
        </div>
        <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
          <label for="date-filter" style="margin-bottom:0">Filter Date:</label>
          <input type="date" id="date-filter" onchange="loadSessions(this.value)" style="width: auto;">
          <button class="btn btn-secondary btn-sm" onclick="clearDateFilter()">View All</button>
        </div>
      </div>
      <div id="sessions-feedback" role="alert"></div>
      <div id="sessions-container" class="grid-list">
        <div class="state-message state-loading">Retrieving scheduled sessions...</div>
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
  container.innerHTML = `<div class="state-message state-loading">Loading schedule...</div>`;

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
    // Polling fails silently
  }
}

function renderSessionsList(sessions) {
  const container = document.getElementById('sessions-container');
  if (!container) return;

  if (sessions.length === 0) {
    container.innerHTML = `<div class="state-message state-empty">No sessions scheduled for this date. Select another date above.</div>`;
    return;
  }

  container.innerHTML = sessions.map(s => {
    const isOpen = s.seats_remaining > 0;
    const badgeClass = isOpen ? 'badge-open' : 'badge-full';
    const badgeText = isOpen ? `${s.seats_remaining} Open Slots` : 'Full (20/20)';

    // Capacity calculations
    const capacity = s.capacity || 20;
    const bookedCount = capacity - s.seats_remaining;
    const occupancyPercent = Math.min(100, Math.round((bookedCount / capacity) * 100));

    let actionButton = '';
    if (s.is_booked_by_user) {
      actionButton = `<span class="badge badge-open" style="width:100%;justify-content:center;padding:0.75rem;">✓ Reserved &amp; Confirmed</span>`;
    } else if (s.is_waitlisted_by_user) {
      actionButton = `
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
          <span class="badge badge-waitlist" style="justify-content:center;padding:0.5rem;">⏳ Waitlist Active</span>
          <button class="btn btn-danger btn-sm" onclick="handleLeaveWaitlist(${s.id})">Leave Waitlist</button>
        </div>
      `;
    } else if (isOpen) {
      actionButton = `<button class="btn" style="width:100%;" id="book-btn-${s.id}" onclick="handleBookSession(${s.id})">Reserve Slot →</button>`;
    } else {
      actionButton = `<button class="btn btn-secondary" style="width:100%;" id="waitlist-btn-${s.id}" onclick="handleJoinWaitlist(${s.id})">Join Waitlist ⏳</button>`;
    }

    return `
      <article class="session-item" id="session-card-${s.id}">
        <div>
          <div class="card-top">
            <div class="session-date">${escapeHtml(s.session_date)}</div>
            <span class="badge ${badgeClass}" id="seat-badge-${s.id}">${badgeText}</span>
          </div>
          <div class="session-time">
            <svg style="width:16px;height:16px;fill:currentColor;" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2-11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
            ${String(s.start_hour).padStart(2, '0')}:00 – ${String(s.start_hour + 1).padStart(2, '0')}:00 (60 Minutes)
          </div>

          <!-- Capacity Bar -->
          <div class="progress-container">
            <div class="progress-labels">
              <span style="color:var(--text-muted)">Live Occupancy</span>
              <span id="seat-count-text-${s.id}" style="color:${isOpen ? 'var(--text-primary)' : 'var(--status-crimson)'}">${bookedCount}/${capacity} Athletes</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill ${isOpen ? 'fill-open' : 'fill-full'}" id="progress-fill-${s.id}" style="width: ${occupancyPercent}%"></div>
            </div>
          </div>
        </div>

        <div style="margin-top: 0.5rem;">${actionButton}</div>
      </article>
    `;
  }).join('');
}

// Rule: Booking feels instant: the seat count updates straight away and rolls back if the server refuses.
async function handleBookSession(sessionId) {
  const feedback = document.getElementById('sessions-feedback');
  const btn = document.getElementById(`book-btn-${sessionId}`);
  const badge = document.getElementById(`seat-badge-${sessionId}`);
  const progressFill = document.getElementById(`progress-fill-${sessionId}`);
  const countText = document.getElementById(`seat-count-text-${sessionId}`);

  const targetSession = currentSessions.find(s => s.id === sessionId);
  if (!targetSession) return;

  const previousSeats = targetSession.seats_remaining;

  // Optimistic UI update
  targetSession.seats_remaining = Math.max(0, previousSeats - 1);
  const newBookedCount = 20 - targetSession.seats_remaining;
  const newPercent = Math.round((newBookedCount / 20) * 100);

  if (badge) {
    badge.className = targetSession.seats_remaining > 0 ? 'badge badge-open' : 'badge badge-full';
    badge.textContent = targetSession.seats_remaining > 0 ? `${targetSession.seats_remaining} Open Slots` : 'Full (20/20)';
  }
  if (progressFill) {
    progressFill.style.width = `${newPercent}%`;
  }
  if (countText) {
    countText.textContent = `${newBookedCount}/20 Athletes`;
  }
  if (btn) btn.disabled = true;

  try {
    await api('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId })
    });
    feedback.innerHTML = `<div class="state-message state-success">Session successfully confirmed. Your check-in pass is available in "My Passes".</div>`;
    loadSessions(document.getElementById('date-filter')?.value || '');
  } catch (err) {
    // Rollback on failure
    targetSession.seats_remaining = previousSeats;
    const oldBookedCount = 20 - previousSeats;
    const oldPercent = Math.round((oldBookedCount / 20) * 100);

    if (badge) {
      badge.className = previousSeats > 0 ? 'badge badge-open' : 'badge badge-full';
      badge.textContent = previousSeats > 0 ? `${previousSeats} Open Slots` : 'Full (20/20)';
    }
    if (progressFill) {
      progressFill.style.width = `${oldPercent}%`;
    }
    if (countText) {
      countText.textContent = `${oldBookedCount}/20 Athletes`;
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
    feedback.innerHTML = `<div class="state-message state-success">Added to priority waitlist. You will be automatically confirmed if an athlete cancels.</div>`;
    loadSessions(document.getElementById('date-filter')?.value || '');
  } catch (err) {
    feedback.innerHTML = `<div class="state-message state-error">Waitlist request rejected: ${escapeHtml(err.message)}</div>`;
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
      <div class="card-header-flex">
        <div>
          <h2 id="bookings-heading">Athlete Reservation Passes</h2>
          <p style="color:var(--text-muted);font-size:0.85rem;margin-top:0.35rem;">Present your 6-character short code to front-desk staff during your session hour.</p>
        </div>
      </div>
      <div id="my-bookings-feedback" role="alert"></div>
      <div id="my-bookings-container">
        <div class="state-message state-loading">Retrieving your passes...</div>
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
      container.innerHTML = `
        <div class="state-message state-empty">
          You currently have no active gym reservations.<br>Browse the schedule to secure your slot.
        </div>
      `;
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
            statusBadge = `<span class="badge badge-checkedin">✓ Checked In</span>`;
          } else {
            statusBadge = `<span class="badge badge-open">Confirmed Pass</span>`;
          }

          return `
            <article class="booking-item">
              <div>
                <div class="card-top">
                  <div class="session-date">${escapeHtml(b.session_date)}</div>
                  ${statusBadge}
                </div>
                <div class="session-time">
                  ${String(b.start_hour).padStart(2, '0')}:00 – ${String(b.start_hour + 1).padStart(2, '0')}:00
                </div>

                <div class="code-display-box">
                  <div class="code-display-label">Turnstile Check-In Code</div>
                  <div class="code-display">${escapeHtml(b.check_in_code)}</div>
                </div>
              </div>

              ${!isCancelled && !isCheckedIn ? `
                <button class="btn btn-danger btn-sm" id="cancel-btn-${b.id}" onclick="handleCancelBooking(${b.id})" style="margin-top:0.75rem; width:100%;">
                  Cancel Reservation
                </button>
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

  if (!confirm('Cancel this reservation? The first athlete on the waitlist will be immediately promoted.')) return;

  if (btn) btn.disabled = true;

  try {
    await api(`/api/bookings/${bookingId}/cancel`, { method: 'POST' });
    feedback.innerHTML = `<div class="state-message state-success">Reservation cancelled. Slot relinquished.</div>`;
    loadMyBookings();
  } catch (err) {
    feedback.innerHTML = `<div class="state-message state-error">Cancellation rejected: ${escapeHtml(err.message)}</div>`;
    if (btn) btn.disabled = false;
  }
}

// ==========================================
// PAGE 4: Admin Page
// Rule: Does three things: create a session, see a session's bookings, and mark who turned up.
// ==========================================
function renderAdmin(container) {
  container.innerHTML = `
    <!-- Top Stats Row -->
    <div class="admin-metrics-grid">
      <div class="metric-card">
        <div class="metric-card-top">Administrative Role</div>
        <div class="metric-card-value" style="color:var(--neon-lime);">Gym Staff</div>
        <div class="metric-card-sub">Privileged Operations Active</div>
      </div>
      <div class="metric-card">
        <div class="metric-card-top">Capacity Rule</div>
        <div class="metric-card-value">20 Seats</div>
        <div class="metric-card-sub">Hard Concurrency Constraint</div>
      </div>
      <div class="metric-card">
        <div class="metric-card-top">Turnstile Window</div>
        <div class="metric-card-value" style="color:#38bdf8;">60 Min</div>
        <div class="metric-card-sub">Session Hour Redemption Only</div>
      </div>
    </div>

    <!-- 1. Create Session Section -->
    <section class="card" aria-labelledby="create-session-heading">
      <div class="card-header-flex">
        <h2 id="create-session-heading">1. Schedule New Session</h2>
        <span class="badge badge-open">Admin Action</span>
      </div>
      <div id="admin-create-feedback" role="alert"></div>
      <form id="create-session-form" onsubmit="handleCreateSession(event)">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">
          <div class="form-group">
            <label for="sess-date">Session Date</label>
            <input type="date" id="sess-date" required>
          </div>
          <div class="form-group">
            <label for="sess-hour">Start Hour (0 to 23)</label>
            <input type="number" id="sess-hour" min="0" max="23" placeholder="e.g. 10 for 10:00" required>
          </div>
        </div>
        <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1.25rem;">Capacity is automatically fixed at 20 athletes per policy.</p>
        <button type="submit" id="create-sess-btn" class="btn">Publish Session Slot</button>
      </form>
    </section>

    <!-- 2. Check-in Section -->
    <section class="card" aria-labelledby="checkin-heading">
      <div class="card-header-flex">
        <h2 id="checkin-heading">2. Turnstile Code Validation</h2>
        <span class="badge badge-checkedin">Live Check-In</span>
      </div>
      <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.25rem;">Input the member's short code. Only valid during the session's 1-hour time frame.</p>
      <div id="admin-checkin-feedback" role="alert"></div>
      <form id="checkin-form" onsubmit="handleAdminCheckin(event)">
        <div class="form-group" style="max-width: 340px;">
          <label for="checkin-code">6-Character Short Code</label>
          <input type="text" id="checkin-code" placeholder="e.g. 7XKP2Q" required maxlength="10" style="text-transform:uppercase; font-family:'JetBrains Mono', monospace; font-size:1.1rem; letter-spacing:2px; font-weight:800;">
        </div>
        <button type="submit" id="checkin-btn" class="btn">Verify &amp; Admit Athlete</button>
      </form>
    </section>

    <!-- 3. View Session Bookings Section -->
    <section class="card" aria-labelledby="view-bookings-heading">
      <div class="card-header-flex">
        <h2 id="view-bookings-heading">3. Session Roster &amp; Attendance</h2>
        <span class="badge badge-open">Roster Inspection</span>
      </div>
      <div class="form-group" style="max-width: 420px;">
        <label for="select-session">Select Session to Inspect</label>
        <select id="select-session" onchange="loadSessionBookings(this.value)">
          <option value="">-- Choose a scheduled session --</option>
        </select>
      </div>
      <div id="session-attendees-container">
        <div class="state-message state-empty">Select a session above to load its attendee roster.</div>
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
    select.innerHTML = `<option value="">-- Choose a scheduled session --</option>` +
      data.sessions.map(s => `
        <option value="${s.id}">${s.session_date} @ ${String(s.start_hour).padStart(2, '0')}:00 (${s.seats_remaining} slots remaining)</option>
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
    feedback.innerHTML = `<div class="state-message state-success">Session successfully published for ${res.session.session_date} at ${res.session.start_hour}:00!</div>`;
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
        ✓ <strong>Attendance Confirmed:</strong> ${escapeHtml(res.member.name)} (${escapeHtml(res.member.email)})<br>
        Session: ${escapeHtml(res.session.session_date)} at ${res.session.start_hour}:00
      </div>
    `;
    codeInput.value = '';
  } catch (err) {
    feedback.innerHTML = `<div class="state-message state-error">Check-in rejected: ${escapeHtml(err.message)}</div>`;
  } finally {
    btn.disabled = false;
  }
}

async function loadSessionBookings(sessionId) {
  const container = document.getElementById('session-attendees-container');
  if (!container) return;

  if (!sessionId) {
    container.innerHTML = `<div class="state-message state-empty">Select a session above to load its attendee roster.</div>`;
    return;
  }

  container.innerHTML = `<div class="state-message state-loading">Loading roster...</div>`;

  try {
    const data = await api(`/api/sessions/${sessionId}/bookings`);
    const bookings = data.bookings;

    if (bookings.length === 0) {
      container.innerHTML = `<div class="state-message state-empty">No confirmed athletes for this session yet.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="data-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Athlete Name</th>
              <th>Email Address</th>
              <th>Booking Status</th>
              <th>Check-in Pass</th>
              <th>Admitted</th>
            </tr>
          </thead>
          <tbody>
            ${bookings.map(b => `
              <tr>
                <td style="font-weight:700; color:var(--pure-white);">${escapeHtml(b.member_name)}</td>
                <td style="color:var(--text-muted);">${escapeHtml(b.member_email)}</td>
                <td><span class="badge ${b.status === 'confirmed' ? 'badge-open' : 'badge-full'}">${escapeHtml(b.status)}</span></td>
                <td><span style="font-family:'JetBrains Mono', monospace; color:var(--neon-lime); font-weight:800; letter-spacing:1px;">${escapeHtml(b.check_in_code)}</span></td>
                <td>${b.is_checked_in === 1 ? '<span class="badge badge-checkedin">✓ Yes</span>' : '<span style="color:var(--text-dim)">No</span>'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
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
