const API_BASE = '/api';
const authTokenKey = 'travels_token';
const authUserIdKey = 'travels_user_id';

const state = {
  buses: [],
  selectedBus: null,
};

const getElement = id => document.getElementById(id);

const elements = {
  messageBox: getElement('messageBox'),
  heroSection: getElement('heroSection'),
  busesSection: getElement('busesSection'),
  busDetailSection: getElement('busDetailSection'),
  userBookingsSection: getElement('userBookingsSection'),
  busList: getElement('busList'),
  bookingList: getElement('bookingList'),
  busDetail: getElement('busDetail'),
  loginForm: getElement('loginForm'),
  registerForm: getElement('registerForm'),
  paymentForm: getElement('paymentForm'),
  seatIdInput: getElement('seatIdInput'),
  cardNumberInput: getElement('cardNumberInput'),
  homeLink: getElement('homeLink'),
  loginLink: getElement('loginLink'),
  registerLink: getElement('registerLink'),
  bookingsLink: getElement('bookingsLink'),
  logoutLink: getElement('logoutLink'),
  backToBuses: getElement('backToBuses'),
};

function getAuthToken() {
  return localStorage.getItem(authTokenKey);
}

function getAuthUserId() {
  return localStorage.getItem(authUserIdKey);
}

function setAuth(token, userId) {
  localStorage.setItem(authTokenKey, token);
  localStorage.setItem(authUserIdKey, String(userId));
}

function clearAuth() {
  localStorage.removeItem(authTokenKey);
  localStorage.removeItem(authUserIdKey);
}

function showMessage(message, type = 'success') {
  if (!elements.messageBox) {
    return;
  }

  const formattedMessage = String(message || '').replace(/\n/g, '<br>');
  elements.messageBox.innerHTML = formattedMessage;
  elements.messageBox.className = `message-box ${type}`;
  elements.messageBox.classList.remove('hidden');
  window.setTimeout(() => {
    elements.messageBox.classList.add('hidden');
  }, 5000);
}

const paymentMessageKey = 'travels_payment_message';
const showBookingsAfterPaymentKey = 'travels_show_bookings_after_payment';

function persistSuccessMessage(message) {
  if (message) {
    sessionStorage.setItem(paymentMessageKey, message);
    sessionStorage.setItem(showBookingsAfterPaymentKey, '1');
  }
}

function consumeSuccessMessage() {
  const message = sessionStorage.getItem(paymentMessageKey);
  if (message) {
    sessionStorage.removeItem(paymentMessageKey);
    showMessage(message, 'success');
  }
}

function shouldShowBookingsAfterPayment() {
  return sessionStorage.getItem(showBookingsAfterPaymentKey) === '1';
}

function showSection(section) {
  if (elements.heroSection) {
    elements.heroSection.classList.add('hidden');
  }
  if (elements.busesSection) {
    elements.busesSection.classList.add('hidden');
  }
  if (elements.busDetailSection) {
    elements.busDetailSection.classList.add('hidden');
  }
  if (elements.userBookingsSection) {
    elements.userBookingsSection.classList.add('hidden');
  }

  if (section === 'hero' && elements.heroSection) {
    elements.heroSection.classList.remove('hidden');
  }
  if (section === 'buses' && elements.busesSection) {
    elements.busesSection.classList.remove('hidden');
  }
  if (section === 'busDetail' && elements.busDetailSection) {
    elements.busDetailSection.classList.remove('hidden');
  }
  if (section === 'bookings' && elements.userBookingsSection) {
    elements.userBookingsSection.classList.remove('hidden');
  }

  updateNav();
}

function updateNav() {
  const token = getAuthToken();
  const loggedIn = Boolean(token);
  const isStartingHomePage = window.location.pathname === '/' && !loggedIn;
  const shouldShowHome = !isStartingHomePage;

  if (elements.loginLink) {
    elements.loginLink.classList.toggle('hidden', loggedIn);
  }
  if (elements.registerLink) {
    elements.registerLink.classList.toggle('hidden', loggedIn);
  }
  if (elements.bookingsLink) {
    elements.bookingsLink.classList.toggle('hidden', !loggedIn);
  }
  if (elements.logoutLink) {
    elements.logoutLink.classList.toggle('hidden', !loggedIn);
  }
  if (elements.homeLink) {
    elements.homeLink.classList.toggle('hidden', !shouldShowHome);
  }
}

async function request(url, options = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Token ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = data?.error || data || 'Request failed';
    throw new Error(typeof error === 'object' ? JSON.stringify(error) : error);
  }

  return data;
}

async function loadBuses() {
  try {
    const buses = await request(`${API_BASE}/buses/`);
    state.buses = buses;
    renderBusList();
  } catch (error) {
    showMessage(`Could not load buses: ${error.message}`, 'error');
  }
}

function renderBusList() {
  elements.busList.innerHTML = '';
  if (!state.buses.length) {
    elements.busList.innerHTML = '<p>No buses available yet.</p>';
    return;
  }

  state.buses.forEach(bus => {
    const card = document.createElement('article');
    card.className = 'card bus-card';
    card.innerHTML = `
      <h3>${bus.Bus_name} (${bus.number})</h3>
      <div class="bus-details">
        <p><strong>Route:</strong> ${bus.origin} → ${bus.destination}</p>
        <p><strong>Departure:</strong> ${bus.start_time}</p>
        <p><strong>Arrival:</strong> ${bus.reach_time}</p>
        <p><strong>Price:</strong> $${bus.price}</p>
        <p><strong>Seats:</strong> ${bus.no_of_seats}</p>
        <p><strong>Remaining:</strong> ${bus.available_seats}</p>
      </div>
      <button class="primary-button" data-bus-id="${bus.id}">View Seats</button>
    `;

    card.querySelector('button')?.addEventListener('click', () => {
      showBusDetail(bus.id);
    });

    elements.busList.append(card);
  });

  showSection('buses');
}

function showBusDetail(busId) {
  const bus = state.buses.find(item => item.id === busId);
  if (!bus) {
    showMessage('Bus not found', 'error');
    return;
  }

  state.selectedBus = bus;
  const seatRows = bus.seats || [];

  elements.busDetail.innerHTML = `
    <div class="card">
      <h2>${bus.Bus_name} (${bus.number})</h2>
      <div class="bus-details">
        <p><strong>Route:</strong> ${bus.origin} → ${bus.destination}</p>
        <p><strong>Departure:</strong> ${bus.start_time}</p>
        <p><strong>Arrival:</strong> ${bus.reach_time}</p>
        <p><strong>Price:</strong> $${bus.price}</p>
        <p><strong>Features:</strong> ${bus.features || 'No details provided'}</p>
        <p><strong>Remaining Seats:</strong> ${bus.available_seats}</p>
      </div>
      <div class="section-header">
        <h3>Seats</h3>
        <p>Book an available seat below.</p>
      </div>
      <div class="seat-list">
        ${seatRows.length ? seatRows.map(seat => {
          const status = seat.is_book ? 'Booked' : 'Available';
          return `
            <div class="seat-row ${seat.is_book ? 'booked' : 'available'}">
              <span>${seat.seat_number}</span>
              <small>${status}</small>
              <button class="book-seat" ${seat.is_book ? 'disabled' : ''} data-seat-id="${seat.id}" data-bus-id="${bus.id}">
                ${seat.is_book ? 'Unavailable' : 'Book now'}
              </button>
            </div>
          `;
        }).join('') : '<p>No seat details are available for this bus.</p>'}
      </div>
    </div>
  `;

  elements.busDetail.querySelectorAll('.book-seat').forEach(button => {
    button.addEventListener('click', () => {
      const seatId = Number(button.dataset.seatId);
      const busId = Number(button.dataset.busId);
      goToPayment(seatId, busId);
    });
  });

  showSection('busDetail');
}

function goToPayment(seatId, busId) {
  window.location.href = `/payment/${seatId}/?bus=${busId}`;
}

async function payForSeat(seatId, cardNumber) {
  try {
    const data = await request(`${API_BASE}/payment/`, {
      method: 'POST',
      body: JSON.stringify({ seat: seatId, card_number: cardNumber }),
    });

    const message = data.message || 'Payment successful. Booking confirmed.';
    persistSuccessMessage(message);
    window.location.href = '/';
    return data;
  } catch (error) {
    showMessage(`Payment failed: ${error.message}`, 'error');
    throw error;
  }
}

async function loadUserBookings() {
  const userId = getAuthUserId();
  if (!userId) {
    showMessage('Login required to load bookings.', 'error');
    return;
  }

  try {
    const bookings = await request(`${API_BASE}/user/${userId}/bookings/`);
    renderBookings(bookings);
  } catch (error) {
    showMessage(`Could not load bookings: ${error.message}`, 'error');
  }
}

function renderBookings(bookings) {
  elements.bookingList.innerHTML = '';
  if (!bookings.length) {
    elements.bookingList.innerHTML = '<p>You have no bookings yet.</p>';
    showSection('bookings');
    return;
  }

  bookings.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card booking-card';
    card.innerHTML = `
      <h3>${item.bus}</h3>
      <p><strong>Seat:</strong> ${item.seat.seat_number}</p>
      <p><strong>Booked:</strong> ${new Date(item.booking_time).toLocaleString()}</p>
    `;
    elements.bookingList.append(card);
  });

  showSection('bookings');
}

function getSeatIdFromUrl() {
  const matches = window.location.pathname.match(/\/payment\/(\d+)\//);
  return matches ? Number(matches[1]) : null;
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function refreshData() {
  await Promise.all([loadBuses(), loadUserBookings()]);
  if (state.selectedBus) {
    showBusDetail(state.selectedBus.id);
  }
}

async function initPaymentPage() {
  const seatId = getSeatIdFromUrl();
  if (!seatId || !elements.paymentForm) {
    return;
  }

  elements.seatIdInput.value = String(seatId);
  const busId = Number(getQueryParam('bus')) || null;

  if (busId) {
    await loadBuses();
    const bus = state.buses.find(b => b.id === busId);
    const seat = bus?.seats?.find(s => s.id === seatId);
    if (bus && seat) {
      const info = document.createElement('div');
      info.className = 'payment-info';
      info.innerHTML = `
        <p><strong>Bus:</strong> ${bus.Bus_name} (${bus.number})</p>
        <p><strong>Seat:</strong> ${seat.seat_number}</p>
        <p><strong>Price:</strong> $${bus.price}</p>
      `;
      elements.paymentForm.prepend(info);
    }
  }

  elements.paymentForm.addEventListener('submit', async event => {
    event.preventDefault();
    const cardNumber = elements.cardNumberInput?.value.trim();
    await payForSeat(seatId, cardNumber);
  });
}

async function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(elements.loginForm);
  const payload = {
    username: formData.get('username'),
    password: formData.get('password'),
  };

  try {
    const data = await request(`${API_BASE}/login/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAuth(data.token, data.user_id);
    updateNav();
    showMessage('Login successful.', 'success');
    window.location.href = '/';
  } catch (error) {
    showMessage(`Login failed: ${error.message}`, 'error');
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const formData = new FormData(elements.registerForm);
  const payload = {
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
  };

  try {
    await request(`${API_BASE}/register/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    showMessage('Account created. Please log in.', 'success');
    elements.registerForm.reset();
    window.location.href = '/login/';
  } catch (error) {
    showMessage(`Registration failed: ${error.message}`, 'error');
  }
}

function handleLogout() {
  clearAuth();
  updateNav();
  window.location.href = '/';
}

function handleHome() {
  showSection(getAuthToken() ? 'buses' : 'hero');
}

function handleShowBookings() {
  loadUserBookings();
}

async function initializeApp() {
  updateNav();
  const afterPaymentBookings = shouldShowBookingsAfterPayment();
  consumeSuccessMessage();

  if (elements.paymentForm) {
    await initPaymentPage();
    return;
  }

  const token = getAuthToken();
  if ((elements.loginForm || elements.registerForm) && token) {
    window.location.href = '/';
    return;
  }

  if (elements.loginForm || elements.registerForm) {
    return;
  }

  if (token) {
    await loadBuses();
    if (afterPaymentBookings) {
      sessionStorage.removeItem(showBookingsAfterPaymentKey);
      await loadUserBookings();
      showSection('bookings');
      return;
    }
    showSection('buses');
  } else {
    showSection('hero');
  }
}

function bindEvents() {
  if (elements.loginForm) {
    elements.loginForm.addEventListener('submit', handleLogin);
  }
  if (elements.registerForm) {
    elements.registerForm.addEventListener('submit', handleRegister);
  }
  if (elements.logoutLink) {
    elements.logoutLink.addEventListener('click', handleLogout);
  }
  if (elements.homeLink) {
    elements.homeLink.addEventListener('click', handleHome);
  }
  if (elements.bookingsLink) {
    elements.bookingsLink.addEventListener('click', handleShowBookings);
  }
  if (elements.backToBuses) {
    elements.backToBuses.addEventListener('click', () => {
      showSection('buses');
    });
  }
}

bindEvents();
initializeApp();
