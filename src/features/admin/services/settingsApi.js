import api from "../../../lib/api";

export const getAllSettings = async () => {
  const { data } = await api.get("/admin/settings");
  return data.data.settings;
};

export const updateSetting = async (key, value) => {
  const { data } = await api.patch(`/admin/settings/${key}`, { value });
  return data.data.setting;
};
export const getPublicSettings = async () => {
  const { data } = await api.get("/admin/settings/public");
  return data.data.settings;
};
