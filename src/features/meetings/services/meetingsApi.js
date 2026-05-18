import api from "../../../lib/api";

export const getMeetings = async (filter = "") => {
  const { data } = await api.get(`/meetings${filter ? `?filter=${filter}` : ""}`);
  return data.data.meetings;
};

export const getMeetingDetails = async (id) => {
  const { data } = await api.get(`/meetings/${id}`);
  return data.data.meeting;
};

export const scheduleMeeting = async (payload) => {
  const { data } = await api.post("/meetings/schedule", payload);
  return data.data.meeting;
};

export const recordMeetingMinutes = async (meetingId, payload) => {
  const { data } = await api.post(`/meetings/record-minutes/${meetingId}`, payload);
  return data.data;
};

export const cancelMeeting = async (id) => {
  const { data } = await api.patch(`/meetings/cancel/${id}`);
  return data.data.meeting;
};
