import api from "../../../lib/api";

export const getMyLevies = async () => {
  const { data } = await api.get("/levies/my-levies");
  return data.data.levies;
};

export const payLevy = async (id) => {
  const { data } = await api.post(`/levies/${id}/pay`);
  return data.data.levy;
};

export const getAllLevies = async () => {
  const { data } = await api.get("/levies/admin");
  return data.data.levies;
};

export const waiveLevy = async (id) => {
  const { data } = await api.patch(`/levies/admin/${id}/waive`);
  return data.data.levy;
};
