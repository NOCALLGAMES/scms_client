import api from "../../../lib/api";

export const getMyNotifications = async () => {
  const { data } = await api.get("/notifications");
  return data.data.notifications;
};

export const markAsRead = async (id) => {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data.data.notification;
};

export const markAllAsRead = async () => {
  const { data } = await api.patch("/notifications/read-all");
  return data;
};
