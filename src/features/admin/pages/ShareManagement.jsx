import { FaNairaSign } from "react-icons/fa6";
;
import React, { useState, useEffect } from "react";
import { FiTrendingUp, FiPlus, FiUser, FiSearch, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../../lib/api";
import { purchaseShares } from "../services/sharesApi";

const ShareManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "Share Capital Purchase",
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      // Re-using user management or similar to get members
      const { data } = await api.get("/users?role=member");
      setMembers(data.data.users || []);
    } catch (error) {
      toast.error("Failed to fetch members");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await purchaseShares({
        userId: selectedMember.id,
        amount: Math.ceil(parseFloat(formData.amount)),
        description: formData.description,
      });
      toast.success(`Successfully recorded share purchase for ${selectedMember.name}`);
      setShowModal(false);
      setFormData({ amount: "", description: "Share Capital Purchase" });
      fetchMembers(); // Refresh to show new balances (if included in user data)
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to record purchase");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      m.email?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <FiTrendingUp className="text-blue-600" />
            Share Capital Management
          </h1>
          <p className="text-slate-500">
            Record and manage member share capital contributions.
          </p>
        </div>

        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search members..."
            className="pl-10 pr-4 py-2 border rounded-xl w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Member</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center">
                  <FiLoader className="inline animate-spin text-blue-600 text-2xl" />
                </td>
              </tr>
            ) : filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <FiUser />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {member.status?.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleOpenModal(member)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                    >
                      <FiPlus /> Record Shares
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-800">Record Share Purchase</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                ✕
              </button>
            </div>
            <form onSubmit={handlePurchase} className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <FiUser />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">{selectedMember?.name}</p>
                  <p className="text-xs text-slate-500">{selectedMember?.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">Amount (₦)</label>
                <div className="relative">
                  <FaNairaSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin" /> Recording...
                  </>
                ) : (
                  "Record Purchase"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareManagement;
