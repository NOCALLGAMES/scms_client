import api from "../../../lib/api";

export const getChartOfAccounts = async () => {
    const res = await api.get("/coa");
    return res.data;
};
