const STORAGE_KEY = 'chatbox_booking_count';
const BASE_COUNT = 0;

const countEl = document.getElementById('booking-count');
const cardEl = document.getElementById('booking-card');

function pulseCard() {
  cardEl.classList.add('pulse');
  setTimeout(() => cardEl.classList.remove('pulse'), 700);
}

function getCount() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored !== null ? parseInt(stored, 10) : BASE_COUNT;
}

function setCount(n) {
  localStorage.setItem(STORAGE_KEY, n);
  updateDisplay(n);
}

function updateDisplay(n) {
  countEl.textContent = n;
  countEl.style.transition = 'color 0.3s ease';
  countEl.style.color = '#60a5fa';
  pulseCard();
  setTimeout(() => {
    countEl.style.color = '';
  }, 800);
}

if (localStorage.getItem(STORAGE_KEY) === null) {
  localStorage.setItem(STORAGE_KEY, BASE_COUNT);
}

updateDisplay(getCount());

window.addEventListener('storage', function (event) {
  if (event.key === STORAGE_KEY && event.newValue !== null) {
    const newVal = parseInt(event.newValue, 10);
    updateDisplay(newVal);
  }
});

window.addEventListener('message', function (event) {
  // debug event data and origin
  //console.log('[Chatbox] postMessage received | origin:', event.origin, '| data:', event.data);

  const trustedOrigin = /^https:\/\/([a-z0-9-]+\.)?(jotform\.com|jotfor\.ms)(:\d+)?$/i.test(event.origin);
  if (!trustedOrigin) return;

  let data = event.data;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return;
    }
  }

  const signal = [
    data && typeof data === 'object' ? data.type : '',
    data && typeof data === 'object' ? data.event : '',
    data && typeof data === 'object' ? data.action : '',
    data && typeof data === 'object' ? data.status : '',
    data && typeof data === 'object' ? data.name : ''
  ]
    .join(' ')
    .toLowerCase();
  const raw = JSON.stringify(data || '').toLowerCase();
  
  const isBookingEvent =
    /\b(submit|taskcompleted|confirmed)\b/.test(signal) ||
    /\b(booking|reservation)\b/.test(raw);

  if (isBookingEvent) {
    console.log('[Chatbox] ✅ Booking event detected — incrementing counter:', data);
    setCount(getCount() + 1);
  }
});