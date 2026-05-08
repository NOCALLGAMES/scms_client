import api from "../../../lib/api";

export const getMyContributions = async () => {
  const { data } = await api.get("/contributions/my-contributions");
  return data.data.contributions;
};

export const getMonthlyReport = async (month, type) => {
  const { data } = await api.get(`/contributions/admin/report/${month}${type ? `?type=${type}` : ""}`);
  return data.data.contributions;
};

export const getContributionStats = async () => {
  const { data } = await api.get("/contributions/admin/stats");
  return data.data;
};

export const generateMonthlyRecords = async (month) => {
  const { data } = await api.post("/contributions/admin/generate", { month });
  return data;
};

export const collectInternalBalance = async (id) => {
  const { data } = await api.post(`/contributions/admin/collect-internal/${id}`);
  return data;
};

export const recordCashPayment = async (id) => {
  const { data } = await api.post(`/contributions/admin/record-cash/${id}`);
  return data;
};
