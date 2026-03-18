import axios from 'axios';

(async () => {
  try {
    const base = 'http://localhost:5000/api';
    const email = `test${Date.now()}@example.com`;

    const res1 = await axios.post(`${base}/auth/register`, {
      name: 'Test User',
      email,
      password: 'Password123!',
    });
    console.log('register', res1.status, res1.data);
    if (!res1.data.token) return;
    const token = res1.data.token;

    const res2 = await axios.get(`${base}/ai/analysis`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('ai/analysis', res2.status, res2.data);
  } catch (err) {
    console.error('ERROR', err.response?.data || err.message);
  }
})();
