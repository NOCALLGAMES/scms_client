import api from "../../../lib/api";

export const getDashboardStats = async (params = {}) => {
    const res = await api.get("/dashboard/stats", { params });
    return res.data;
};

export const getChartData = async () => {
    const res = await api.get("/dashboard/charts");
    return res.data;
};
