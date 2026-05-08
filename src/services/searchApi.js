import api from '../lib/api';

export const globalSearch = async (query) => {
  if (!query) return { results: [] };
  const res = await api.get(`search?q=${encodeURIComponent(query)}`);
  return res.data.data;
};
