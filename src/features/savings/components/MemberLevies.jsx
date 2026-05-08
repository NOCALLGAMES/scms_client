import React, { useState, useEffect } from "react";
import { getMyLevies, payLevy } from "../services/levyApi";
import { FiAlertTriangle, FiCheckCircle, FiClock, FiCreditCard, FiInfo } from "react-icons/fi";
import { toast } from "react-hot-toast";

const MemberLevies = () => {
  const [levies, setLevies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  const fetchLevies = async () => {
    try {
      const data = await getMyLevies();
      setLevies(data);
    } catch (err) {
      console.error("Failed to fetch levies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevies();
  }, []);

  const handlePay = async (id) => {
    setPayingId(id);
    try {
      await payLevy(id);
      toast.success("Levy paid successfully from your savings!");
      fetchLevies(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to pay levy");
    } finally {
      setPayingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const base = "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm";
    switch (status) {
      case "paid":
        return <span className={`${base} bg-green-100 text-green-700 border border-green-200`}>Paid</span>;
      case "pending":
        return <span className={`${base} bg-amber-100 text-amber-700 border border-amber-200`}>Pending</span>;
      case "waived":
        return <span className={`${base} bg-slate-100 text-slate-700 border border-slate-200`}>Waived</span>;
      default:
        return null;
    }
  };

  if (loading) return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm animate-pulse">
      <div className="h-4 w-48 bg-slate-100 rounded mb-6"></div>
      <div className="space-y-4">
        {[1, 2].map(i => <div key={i} className="h-16 bg-slate-50 rounded-2xl"></div>)}
      </div>
    </div>
  );

  // Filter for pending to show summary
  const pendingCount = levies.filter(l => l.status === 'pending').length;
  const pendingTotal = levies.filter(l => l.status === 'pending').reduce((sum, l) => sum + parseFloat(l.amount), 0);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-red-50/20 to-white">
        <div>
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <FiAlertTriangle className="text-red-500" />
            Cooperative Levies & Fines
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Pending Penalties & Admin Dues</p>
        </div>
        {pendingCount > 0 && (
           <div className="px-3 py-1 bg-red-100 rounded-full border border-red-200">
              <span className="text-[10px] font-black text-red-700">₦{pendingTotal.toLocaleString()} Due</span>
           </div>
        )}
      </div>

      <div className="p-4">
        {levies.length > 0 ? (
          <div className="space-y-3">
            {levies.map((levy) => (
              <div 
                key={levy.id}
                className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                  levy.status === 'pending' ? 'bg-white border-slate-100 hover:border-red-200' : 'bg-slate-50/50 border-slate-50 opacity-75'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    levy.status === 'pending' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {levy.status === 'pending' ? <FiClock /> : <FiCheckCircle />}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-700">{levy.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-sm font-black text-slate-900">₦{parseFloat(levy.amount).toLocaleString()}</span>
                       {getStatusBadge(levy.status)}
                    </div>
                  </div>
                </div>

                {levy.status === 'pending' && (
                  <button
                    onClick={() => handlePay(levy.id)}
                    disabled={payingId === levy.id}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-sm shadow-blue-200"
                  >
                    {payingId === levy.id ? "Processing..." : (
                      <><FiCreditCard className="text-xs" /> Pay Now</>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-200">
               <FiCheckCircle className="text-3xl" />
            </div>
            <p className="text-sm font-bold text-slate-500">You have no outstanding levies.</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Keep it up! Your compliance score is perfect.</p>
          </div>
        )}
      </div>

      <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-100">
         <div className="flex items-center gap-2">
            <FiInfo className="text-blue-500" />
            <p className="text-[10px] text-slate-400 font-bold uppercase leading-tight">
               Levies are deducted directly from your savings balance.
            </p>
         </div>
         <button className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors">
            Policy Details
         </button>
      </div>
    </div>
  );
};

export default MemberLevies;
