import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard APIs
export const getDashboardSummary = () => api.get('/dashboard/summary');
export const getRecentSales = (limit = 10) => api.get(`/dashboard/recent-sales?limit=${limit}`);

// Inventory APIs
export const getInventoryOverview = () => api.get('/inventory/overview');
export const getMedicines = (params = {}) => api.get('/inventory/medicines', { params });
export const createMedicine = (data) => api.post('/inventory/medicines', data);
export const updateMedicine = (id, data) => api.put(`/inventory/medicines/${id}`, data);
export const updateMedicineStatus = (id, status) => api.patch(`/inventory/medicines/${id}/status`, { status });

// Sales APIs
export const createSale = (data) => api.post('/sales', data);
export const searchMedicinesForSale = (q) => api.get(`/sales/search-medicines?q=${q}`);

export default api;
