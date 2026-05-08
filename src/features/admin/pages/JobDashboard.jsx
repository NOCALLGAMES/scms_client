import React, { useState, useEffect } from "react";
import {
  FiActivity,
  FiPlay,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiRefreshCw,
  FiEdit2,
  FiPlus,
  FiX,
  FiPower
} from "react-icons/fi";
import { triggerJob, getJobs, updateJob, createJob } from "../services/jobApi";
import { getAllSettings } from "../services/settingsApi";
import toast from "react-hot-toast";

const AVAILABLE_MODULES = [
  { id: 'monthly-thrift', name: 'Monthly Thrift Generation', category: 'thrift' },
  { id: 'thrift-deductions', name: 'Automated Thrift Deductions', category: 'thrift' },
  { id: 'thrift-penalties', name: 'Thrift Penalties', category: 'thrift' },
  { id: 'loan-deductions', name: 'Automated Loan Deductions', category: 'loans' },
  { id: 'savings-interest', name: 'Savings Interest Posting', category: 'savings' },
  { id: 'savings-maturity', name: 'Savings Maturity Processing', category: 'savings' },
  { id: 'account-freeze', name: 'Automatic Account Freeze', category: 'admin' },
];

const JobDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [settings, setSettings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [runningJob, setRunningJob] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cronExpression: "",
    isEnabled: true
  });
  
  const [createData, setCreateData] = useState({
    jobId: AVAILABLE_MODULES[0].id,
    name: "",
    description: "",
    cronExpression: "0 0 * * *",
    category: AVAILABLE_MODULES[0].category
  });

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const [jobsData, settingsData] = await Promise.all([
        getJobs(),
        getAllSettings()
      ]);
      setJobs(jobsData);
      setSettings(settingsData);
    } catch (err) {
      toast.error('Failed to fetch jobs data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleRunJob = async (id, name) => {
    setRunningJob(id);
    const toastId = toast.loading(`Running ${name}...`);

    try {
      const res = await triggerJob(id);
      toast.success(`${name} completed: ${res.message || "Success"}`, {
        id: toastId,
      });
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to run ${name}`, {
        id: toastId,
      });
      fetchJobs();
    } finally {
      setRunningJob(null);
    }
  };

  const handleToggleState = async (job) => {
    try {
      await updateJob(job.jobId, { isEnabled: !job.isEnabled });
      toast.success(`${job.name} ${!job.isEnabled ? 'Enabled' : 'Disabled'}`);
      fetchJobs();
    } catch (err) {
      toast.error('Failed to toggle job state');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateJob(editingJob.jobId, formData);
      toast.success('Job schedule updated');
      setShowEditModal(false);
      fetchJobs();
    } catch(err) {
      toast.error('Failed to update job');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createJob(createData);
      toast.success('New job created successfully');
      setShowCreateModal(false);
      fetchJobs();
    } catch(err) {
      toast.error(err.response?.data?.message || 'Failed to create job');
    }
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      name: job.name,
      description: job.description,
      cronExpression: job.cronExpression,
      isEnabled: job.isEnabled
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'text-green-500 bg-green-50';
      case 'failed': return 'text-red-500 bg-red-50';
      case 'running': return 'text-blue-500 bg-blue-50';
      default: return 'text-slate-400 bg-slate-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Job Management System
          </h1>
          <p className="text-slate-500 font-medium">
            Monitor, configure, and execute automated financial background processes.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all text-sm shadow-xl shadow-slate-200"
          >
            <FiPlus />
            <span>Create Custom Job</span>
          </button>
          <div className="bg-blue-50 px-4 py-2 rounded-full flex items-center space-x-2 text-blue-600 border border-blue-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest hidden sm:block">
              Scheduler: Active
            </span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-2xl font-black tracking-tight">
              Operational Ethics
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
              Manual triggers bypass the standard schedule. The system dynamically schedules jobs based on the cron configurations below. Disable a job to stop it completely.
            </p>
          </div>
          <div className="flex justify-end lg:pr-10">
             <div className="w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center text-2xl text-slate-700 animate-pulse">
                <FiActivity />
             </div>
          </div>
        </div>
        <div className="absolute top-[-50%] left-[-20%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full" />
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <FiRefreshCw className="animate-spin text-4xl text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className={`bg-white rounded-[2rem] border transition-all group relative overflow-hidden ${
                job.isEnabled ? 'border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-50/50' : 'border-slate-200 opacity-70 bg-slate-50'
              }`}
            >
              <div className="p-8 pb-6 flex items-start justify-between relative z-10">
                <div className="space-y-4 w-full pr-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-3 py-1 bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 rounded-full">
                      {job.category?.replace(/_/g, " ")}
                    </span>
                    {!job.isSystem && (
                      <span className="px-3 py-1 bg-amber-50 text-[9px] font-black uppercase tracking-widest text-amber-600 rounded-full">
                        Custom
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center">
                      {job.name}
                      {!job.isEnabled && <span className="ml-2 text-[10px] font-black uppercase bg-red-100 text-red-600 px-2 py-0.5 rounded">Disabled</span>}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1 leading-snug line-clamp-2">
                      {job.description}
                    </p>
                  </div>
                  <div className="flex items-center flex-wrap gap-2 pt-2">
                    <span className="flex items-center text-[10px] font-black tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                      <FiClock className="mr-1.5" /> CRON: {job.cronExpression}
                    </span>
                    <span className={`flex items-center text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${getStatusColor(job.lastRunStatus)}`}>
                      {job.lastRunStatus === 'success' ? <FiCheckCircle className="mr-1.5" /> : (job.lastRunStatus === 'failed' ? <FiAlertCircle className="mr-1.5" /> : <FiActivity className="mr-1.5" />)} 
                      {job.lastRunStatus?.replace(/_/g, " ") || 'Idle'}
                    </span>
                  </div>
                  {job.lastRunAt && (
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Last execution: {new Date(job.lastRunAt).toLocaleString()}
                    </p>
                  )}
                  {job.jobId === 'monthly-thrift' && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4">
                       <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Rate</span>
                          <span className="text-xs font-black text-slate-800">₦{parseFloat(settings.find(s => s.key === 'monthly_thrift_amount')?.value || 0).toLocaleString()}</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Maint. Fee</span>
                          <span className="text-xs font-black text-slate-800">₦{parseFloat(settings.find(s => s.key === 'monthly_commission_amount')?.value || 0).toLocaleString()}</span>
                       </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center relative z-10">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => openEditModal(job)}
                    className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all shadow-sm"
                    title="Configure Schedule"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleToggleState(job)}
                    className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm ${
                      job.isEnabled ? 'text-red-500 hover:bg-red-50 hover:border-red-200' : 'text-green-500 hover:bg-green-50 hover:border-green-200'
                    }`}
                    title={job.isEnabled ? 'Disable Job' : 'Enable Job'}
                  >
                    <FiPower size={16} />
                  </button>
                </div>

                <button
                  onClick={() => handleRunJob(job.jobId, job.name)}
                  disabled={runningJob !== null || !job.isEnabled}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                    runningJob === job.jobId
                      ? "bg-blue-100 text-blue-400 cursor-wait"
                      : !job.isEnabled 
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed hidden"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-900/20 active:scale-95"
                  }`}
                >
                  {runningJob === job.jobId ? (
                    <>
                      <FiRefreshCw className="animate-spin text-lg" />
                      <span>Running...</span>
                    </>
                  ) : (
                    <>
                      <FiPlay className="text-lg" />
                      <span>Run Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-slate-800">Job Scheduler</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Display Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none text-sm font-bold text-slate-700" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">CRON Expression</label>
                  <input 
                    type="text" 
                    value={formData.cronExpression}
                    onChange={e => setFormData({...formData, cronExpression: e.target.value})}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none text-sm font-bold text-blue-600 tracking-widest font-mono" 
                    required 
                  />
                  <p className="text-[10px] text-slate-400 mt-2 font-bold flex items-center">
                    <FiInfo className="mr-1" /> Standard Cron format (min hr day month dow)
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none text-sm font-bold text-slate-700 min-h-[100px]" 
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all">
                Save & Reschedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-slate-800">Add New Process</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-8 space-y-6">
              
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start space-x-3 text-blue-700">
                <FiInfo className="mt-0.5 flex-shrink-0" />
                <p className="text-[11px] font-bold leading-relaxed">
                  You can only deploy jobs from the pre-approved operational logic library. Assign a CRON schedule to determine execution frequency.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Logic Module</label>
                  <select 
                    value={createData.jobId}
                    onChange={e => {
                      const mod = AVAILABLE_MODULES.find(m => m.id === e.target.value);
                      setCreateData({...createData, jobId: mod.id, name: mod.name, category: mod.category});
                    }}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none text-sm font-bold text-slate-700" 
                  >
                    {AVAILABLE_MODULES.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">CRON Expression</label>
                  <input 
                    type="text" 
                    value={createData.cronExpression}
                    onChange={e => setCreateData({...createData, cronExpression: e.target.value})}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none text-sm font-bold text-blue-600 tracking-widest font-mono" 
                    required 
                    placeholder="0 0 * * *"
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Display Description</label>
                  <textarea 
                    value={createData.description}
                    onChange={e => setCreateData({...createData, description: e.target.value})}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none text-sm font-bold text-slate-700" 
                    placeholder="What does this schedule accomplish?"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all">
                Deploy & Schedule Job
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDashboard;
