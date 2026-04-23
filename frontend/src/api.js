import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? '/api' : 'https://lost-found-backend-gr2n.onrender.com/api');

const API = axios.create({ baseURL: BASE_URL });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const registerUser = (data) => API.post('register', data);
export const loginUser   = (data) => API.post('login', data);
export const getAllItems  = ()     => API.get('items');
export const getItemById = (id)   => API.get(`items/${id}`);
export const addItem     = (data) => API.post('items', data);
export const updateItem  = (id, data) => API.put(`items/${id}`, data);
export const deleteItem  = (id)   => API.delete(`items/${id}`);
export const searchItems = (q)    => API.get(`items/search?name=${q}`);

export default API;
