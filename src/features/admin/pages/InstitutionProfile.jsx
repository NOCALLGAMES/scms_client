import { FaNairaSign } from "react-icons/fa6";
;
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { FiUploadCloud, 
  FiSave, 
  FiImage, 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiGlobe,
  FiClock,
  FiPercent,
  FiActivity } from "react-icons/fi";
import api from '../../../lib/api';
import { useBrand } from '../../../contexts/BrandContext';

const InstitutionProfile = () => {
  const { getBrandBg, getBrandText, getBrandBgLight } = useBrand();
  const queryClient = useQueryClient();
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    settings: {
      currency: 'NGN',
      timezone: 'Africa/Lagos',
      defaultInterestRate: 5,
      brandColor: '#2563eb'
    }
  });

  const fetchInstitution = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/institutions/my-institution');
      const inst = data.data.institution;
      setInstitution(inst);
      
      setFormData({
        name: inst.name || '',
        email: inst.email || '',
        phone: inst.phone || '',
        address: inst.address || '',
        settings: {
          currency: inst.settings?.currency || 'NGN',
          timezone: inst.settings?.timezone || 'Africa/Lagos',
          defaultInterestRate: inst.settings?.defaultInterestRate || 5,
          brandColor: inst.settings?.brandColor || '#2563eb'
        }
      });

      if (inst.logoUrl) {
        setLogoPreview(`${import.meta.env.VITE_SERVER_URL}/img/institutions/${inst.logoUrl}`);
      }
    } catch (err) {
      toast.error('Failed to load institution profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitution();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('settings.')) {
      const settingKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingKey]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('phone', formData.phone);
      submitData.append('address', formData.address);
      submitData.append('settings', JSON.stringify(formData.settings));
      
      if (selectedFile) {
        submitData.append('logoUrl', selectedFile);
      }

      const { data } = await api.patch('/institutions/my-institution', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setInstitution(data.data.institution);
      // Invalidate user query so BrandContext picks up the new brandColor immediately
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Institution profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-pulse">
        <FiGlobe size={48} className="text-slate-200 animate-spin-slow" />
        <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter text-premium">Institution Identity</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.25em] text-[10px] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shadow-lg" style={getBrandBg()}></span>
            Configure Core Profile & Branding
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-12 py-5 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-2xl disabled:opacity-50 hover:brightness-110"
          style={getBrandBg()}
        >
           {saving ? <FiActivity className="animate-spin" /> : <FiSave />} 
           {saving ? "Saving Changes..." : "Save Profile"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Branding & Readonly info */}
        <div className="space-y-8">
          
          {/* Logo Upload Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Brand Logo</h3>
            <div className="flex flex-col items-center space-y-6">
              <div 
                className="w-48 h-48 rounded-full border-4 border-slate-50 shadow-inner bg-slate-50 flex items-center justify-center overflow-hidden relative cursor-pointer group/upload"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Institution Logo" className="w-full h-full object-cover" />
                ) : (
                  <FiImage size={48} className="text-slate-300" />
                )}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity backdrop-blur-sm">
                  <FiUploadCloud size={32} className="text-white mb-2" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Upload</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Click image to upload</p>
                <p className="text-[9px] text-slate-400 mt-1">Recommended: 512x512px. Max 5MB (JPEG, PNG)</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          {/* Read-only Information */}
          <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">System Identifiers</h3>
             <div className="space-y-4">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institution Code</label>
                   <div className="mt-1 font-mono text-lg font-bold text-slate-900 bg-white px-4 py-2 rounded-xl inline-block border border-slate-200">
                     {institution?.code || 'N/A'}
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration Email</label>
                   <p className="mt-1 text-sm font-bold text-slate-700 flex items-center gap-2">
                     <FiMail className="text-slate-400" /> {institution?.email}
                   </p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Editable Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* General Information */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm border-b-4 border-b-slate-50">
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-3">
               <div className="p-2 rounded-xl" style={getBrandBgLight()}><FiMapPin style={getBrandText()} /></div>
               General Details
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Institution Name</label>
                   <input 
                     type="text"
                     name="name"
                     value={formData.name}
                     onChange={handleChange}
                     className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                     placeholder="E.g., Global Tech Cooperative"
                   />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Contact Phone</label>
                   <div className="relative">
                     <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"><FiPhone /></div>
                     <input 
                       type="text"
                       name="phone"
                       value={formData.phone}
                       onChange={handleChange}
                       className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                       placeholder="+1 (555) 000-0000"
                     />
                   </div>
                </div>
                <div className="md:col-span-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Physical Address</label>
                   <textarea 
                     name="address"
                     value={formData.address}
                     onChange={handleChange}
                     rows="3"
                     className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                     placeholder="123 Business Avenue, City, Country"
                   />
                </div>
             </div>
          </div>

          {/* Base Settings */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm border-b-4 border-b-slate-50">
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-3">
               <div className="p-2 rounded-xl" style={getBrandBgLight()}><FiActivity style={getBrandText()} /></div>
               Regional & Base Settings
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Base Currency</label>
                   <div className="relative">
                     <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"><FaNairaSign /></div>
                     <select 
                       name="settings.currency"
                       value={formData.settings.currency}
                       onChange={handleChange}
                       className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none"
                     >
                       <option value="NGN">NGN - Nigerian Naira</option>
                       <option value="USD">USD - US Dollar</option>
                       <option value="EUR">EUR - Euro</option>
                       <option value="GBP">GBP - British Pound</option>
                     </select>
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Timezone</label>
                   <div className="relative">
                     <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"><FiClock /></div>
                     <select 
                       name="settings.timezone"
                       value={formData.settings.timezone}
                       onChange={handleChange}
                       className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none"
                     >
                       <option value="Africa/Lagos">Africa/Lagos</option>
                       <option value="UTC">UTC</option>
                       <option value="America/New_York">America/New_York</option>
                       <option value="Europe/London">Europe/London</option>
                     </select>
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Default Interest Rate (%)</label>
                   <div className="relative">
                     <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"><FiPercent /></div>
                     <input 
                       type="number"
                       name="settings.defaultInterestRate"
                       value={formData.settings.defaultInterestRate}
                       onChange={handleChange}
                       step="0.1"
                       min="0"
                       className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                     />
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Brand Primary Color</label>
                   <div className="relative flex items-center gap-3">
                     <input 
                       type="color"
                       name="settings.brandColor"
                       value={formData.settings.brandColor}
                       onChange={handleChange}
                       className="w-14 h-14 rounded-xl cursor-pointer border-0 p-0"
                     />
                     <div className="flex-1">
                       <input 
                         type="text"
                         name="settings.brandColor"
                         value={formData.settings.brandColor}
                         onChange={handleChange}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all uppercase"
                         placeholder="#2563EB"
                       />
                     </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InstitutionProfile;
