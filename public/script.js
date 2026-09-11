// ---- Auth ----
const loggedOutView = document.getElementById('loggedOutView');
const loggedInView = document.getElementById('loggedInView');
const userEmail = document.getElementById('userEmail');
const authError = document.getElementById('authError');
let currentFavorites = [];

async function updateAuthView() {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  const upgradeBtn = document.getElementById('upgradeBtn');
  const premiumBadge = document.getElementById('premiumBadge');

  if (token) {
    loggedOutView.classList.add('hidden');
    loggedInView.classList.remove('hidden');
    userEmail.textContent = email;

    try {
      const meResponse = await fetch('/api/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const meData = await meResponse.json();

      if (meData.user?.isPremium) {
        upgradeBtn.classList.add('hidden');
        premiumBadge.classList.remove('hidden');
      } else {
        upgradeBtn.classList.remove('hidden');
        premiumBadge.classList.add('hidden');
      }
    } catch (err) {}
  } else {
    loggedOutView.classList.remove('hidden');
    loggedInView.classList.add('hidden');
  }
  loadFavorites();
}

async function authRequest(endpoint) {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value.trim();
  authError.textContent = '';

  try {
    const response = await fetch(`/api/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await response.json();

    if (!response.ok) {
      authError.textContent = result.error || 'Something went wrong';
      return;
    }

    if (endpoint === 'login') {
      localStorage.setItem('token', result.token);
      localStorage.setItem('email', result.user.email);
      updateAuthView();
    } else {
      authError.textContent = 'Account created — now log in';
      authError.classList.remove('text-red-500');
      authError.classList.add('text-green-600');
    }
  } catch (err) {
    authError.textContent = 'Network error';
  }
}

document.getElementById('loginBtn').addEventListener('click', () => authRequest('login'));
document.getElementById('signupBtn').addEventListener('click', () => authRequest('signup'));
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  weatherResult.innerHTML = '';
  cityInput.value = '';
  updateAuthView();
});

document.getElementById('upgradeBtn').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/payment/initialize', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const result = await response.json();
    window.location.href = result.authorization_url;
  } catch (err) {
    alert('Could not start payment');
  }
});
document.getElementById('forgotPasswordLink').addEventListener('click', async (e) => {
  e.preventDefault();
  const email = document.getElementById('authEmail').value.trim();
  if (!email) {
    authError.textContent = 'Enter your email above first';
    return;
  }

  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const result = await response.json();
    authError.textContent = result.message;
    authError.classList.remove('text-red-500');
    authError.classList.add('text-green-600');
  } catch (err) {
    authError.textContent = 'Something went wrong';
  }
});


// ---- Weather search ----
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherResult = document.getElementById('weatherResult');

searchBtn.addEventListener('click', async () => {
  const city = cityInput.value.trim();
  if (!city) return;

  weatherResult.innerHTML = `
    <div class="flex justify-center py-8">
      <div class="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  `;

  try {
    const response = await fetch(`/api/weather/${city}`);
    const result = await response.json();

    if (!response.ok) {
      weatherResult.innerHTML = `<p class="text-white bg-red-500/80 rounded-lg p-3 text-center">${result.error || 'City not found'}</p>`;
      return;
    }

    const data = result.data;
    const isLoggedIn = !!localStorage.getItem('token');
    let isPremium = false;

    if (isLoggedIn) {
      const meResponse = await fetch('/api/me', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const meData = await meResponse.json();
      isPremium = meData.user?.isPremium;
    }

    const weatherEmoji = {
      Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
      Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️'
    }[data.weather[0].main] || '🌡️';

    const alreadySaved = currentFavorites.includes(data.name.toLowerCase());

    weatherResult.innerHTML = `
      <div class="bg-white rounded-2xl p-6 shadow-xl">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-2xl font-bold text-slate-800">${data.name}</h2>
            <p class="text-slate-500 capitalize">${data.weather[0].description}</p>
          </div>
          <span class="text-5xl">${weatherEmoji}</span>
        </div>
        <p class="text-5xl font-extrabold text-slate-800 my-3">${Math.round(data.main.temp)}°C</p>
        <p class="text-xs text-slate-400">Source: ${result.source}</p>
        <div class="flex gap-2 mt-4">
          ${isLoggedIn
            ? (alreadySaved
                ? `<button class="text-sm bg-green-500 text-white px-3 py-1.5 rounded-lg cursor-default" disabled>✓ Saved</button>`
                : `<button id="saveFavBtn" class="text-sm bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition">★ Save</button>`)
            : ''}
          ${isPremium
            ? `<button id="forecastBtn" class="text-sm bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition">5-Day Forecast</button>`
            : (isLoggedIn ? `<button id="upgradePromptBtn" class="text-sm bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-300 transition">🔒 Unlock Forecast</button>` : '')}
        </div>
      </div>
      <div id="forecastResult" class="mt-4"></div>
    `;

    if (isLoggedIn && document.getElementById('saveFavBtn')) {
      document.getElementById('saveFavBtn').addEventListener('click', async (e) => {
        const btn = e.target;
        btn.disabled = true;
        btn.textContent = 'Saving...';

        try {
          const saveResponse = await fetch('/api/favorites', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ cityName: data.name, countryCode: data.sys.country })
          });

          if (saveResponse.ok) {
            btn.textContent = '✓ Saved';
            btn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
            btn.classList.add('bg-green-500');
          } else {
            btn.textContent = 'Failed — retry';
            btn.disabled = false;
          }

          loadFavorites();
        } catch (err) {
          btn.textContent = 'Failed — retry';
          btn.disabled = false;
        }
      });
    }

    if (isPremium) {
      document.getElementById('forecastBtn').addEventListener('click', async () => {
        const forecastResult = document.getElementById('forecastResult');
        forecastResult.innerHTML = `
          <div class="flex justify-center py-4">
            <div class="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        `;

        const fResponse = await fetch(`/api/weather/${city}/forecast`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const forecastData = await fResponse.json();

        const daily = forecastData.data.list.filter(item => item.dt_txt.includes('12:00:00'));

        forecastResult.innerHTML = `
          <div class="grid grid-cols-5 gap-2">
            ${daily.map(day => `
              <div class="bg-white/90 backdrop-blur rounded-xl p-3 shadow text-center">
                <p class="text-xs text-slate-500">${new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                <p class="font-bold text-slate-800">${Math.round(day.main.temp)}°C</p>
                <p class="text-xs text-slate-500 capitalize">${day.weather[0].main}</p>
              </div>
            `).join('')}
          </div>
        `;
      });
    } else if (isLoggedIn) {
      document.getElementById('upgradePromptBtn').addEventListener('click', () => {
        document.getElementById('upgradeBtn').scrollIntoView({ behavior: 'smooth' });
      });
    }
  } catch (err) {
    weatherResult.innerHTML = '<p class="text-white bg-red-500/80 rounded-lg p-3 text-center">Something went wrong</p>';
  }
});


// ---- Favorites list ----
const favoritesList = document.getElementById('favoritesList');

async function loadFavorites() {
  const token = localStorage.getItem('token');
  if (!token) {
    favoritesList.innerHTML = '<p class="text-white/70 text-sm">Log in to save favorites</p>';
    currentFavorites = [];
    return;
  }

  try {
    const response = await fetch('/api/favorites', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const favorites = await response.json();
    currentFavorites = favorites.map(f => f.city_name.toLowerCase());

    if (favorites.length === 0) {
      favoritesList.innerHTML = '<p class="text-white/70 text-sm">No favorites yet</p>';
      return;
    }

    favoritesList.innerHTML = favorites.map(fav => `
      <div class="bg-white/90 backdrop-blur rounded-xl p-3 shadow flex justify-between items-center">
        <span onclick="searchFavorite('${fav.city_name}')" class="text-slate-700 cursor-pointer hover:text-indigo-600 hover:underline">${fav.city_name}${fav.country_code ? `, ${fav.country_code}` : ''}</span>
        <button onclick="deleteFavorite(${fav.id})" class="text-red-500 text-sm hover:underline">Remove</button>
      </div>
    `).join('');
  } catch (err) {
    favoritesList.innerHTML = '<p class="text-red-300 text-sm">Could not load favorites</p>';
  }
}

async function deleteFavorite(id) {
  await fetch(`/api/favorites/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  loadFavorites();
}

function searchFavorite(cityName) {
  cityInput.value = cityName;
  searchBtn.click();
}


// ---- Run on page load ----
updateAuthView();