import API from "../../../lib/api";

export const getJobs = async () => {
  const response = await API.get('/admin/jobs');
  return response.data.data.jobs;
};

export const updateJob = async (jobId, data) => {
  const response = await API.patch(`/admin/jobs/${jobId}`, data);
  return response.data.data.job;
};

export const createJob = async (data) => {
  const response = await API.post('/admin/jobs', data);
  return response.data.data.job;
};

/**
 * Trigger a background job manually
 * @param {string} jobType - 'savings-interest' | 'loan-deductions' | 'loan-defaults' | 'loan-maturity' | 'auto-deposits'
 */
export const triggerJob = async (jobType) => {
  const response = await API.post(`/admin/jobs/${jobType}/run`);
  return response.data;
};
