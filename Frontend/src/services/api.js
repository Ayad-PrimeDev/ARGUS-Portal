import axios from 'axios';

// Create a configured instance of Axios
const api = axios.create({
  // Point to our Express backend API
  baseURL: 'http://localhost:5000/api',
  
  // CRITICAL: Since our backend uses HTTP-only cookies for authentication (JWT),
  // this setting ensures that cookies are sent automatically with every request.
  // Without this, the server wouldn't receive the session cookie, and all protected
  // routes would return a 401 Unauthorized error.
  withCredentials: true,
});

export default api;
