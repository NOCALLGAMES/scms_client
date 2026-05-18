import { FaNairaSign } from "react-icons/fa6";
;
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiTrendingUp, 
  FiClock, 
  FiActivity,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiBriefcase } from "react-icons/fi";
import api from '../../../lib/api';

const InstitutionTreasury = () => {
  const [treasury, setTreasury] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [funding, setFunding] = useState(false);
  const [amount, setAmount] = useState('');

  const fetchTreasury = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/treasury/summary');
      setTreasury(data.data.treasury);
      setRecentTransactions(data.data.recentTransactions || []);
    } catch (err) {
      toast.error('Failed to load treasury data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreasury();
  }, []);

  const handleFund = async (e) => {
    e.preventDefault();
    if (!amount || amount < 100) {
      return toast.error('Minimum funding amount is ₦100');
    }

    setFunding(true);
    try {
      const { data } = await api.post('/treasury/fund', { amount: Number(amount) });
      
      // Redirect to Paystack
      if (data.data && data.data.authorization_url) {
        window.location.href = data.data.authorization_url;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize funding');
      setFunding(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateStr));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-pulse">
        <FiBriefcase size={48} className="text-slate-200 animate-bounce" />
        <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Loading Treasury...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter text-premium">Treasury Vault</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.25em] text-[10px] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200"></span>
            Cooperative Master Fund
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Balance & Funding Action */}
        <div className="lg:col-span-1 space-y-8">
          
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
            <div className="absolute -right-10 -top-10 text-slate-800 opacity-50 transform rotate-12">
              <FiBriefcase size={180} />
            </div>
            <div className="relative z-10">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Available Balance</h3>
              <div className="text-4xl font-black tracking-tight mb-8">
                {formatCurrency(treasury?.balance)}
              </div>

              <div className="pt-6 border-t border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Account Number</p>
                <p className="font-mono text-lg text-slate-300">{treasury?.accountNumber}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleFund} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm border-b-4 border-b-slate-50">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
               <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl"><FiArrowDownLeft /></div>
               Fund Treasury
            </h3>
            <div className="space-y-6">
              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Amount (NGN)</label>
                 <div className="relative">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"><FaNairaSign /></div>
                   <input 
                     type="number"
                     value={amount}
                     onChange={(e) => setAmount(e.target.value)}
                     min="100"
                     required
                     className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-lg font-black text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                     placeholder="0.00"
                   />
                 </div>
              </div>
              <button 
                type="submit"
                disabled={funding}
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50"
              >
                 {funding ? <FiActivity className="animate-spin" /> : <FiTrendingUp />} 
                 {funding ? "Initializing..." : "Proceed to Payment"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Ledger / History */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm min-h-full">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                   <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><FiClock /></div>
                   Recent Activity
                </h3>
             </div>

             {recentTransactions.length === 0 ? (
               <div className="text-center py-20 text-slate-400 font-medium text-sm">
                 No transactions found in the treasury ledger.
               </div>
             ) : (
               <div className="space-y-4">
                 {recentTransactions.map(txn => (
                   <div key={txn.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${txn.transactionType === 'deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {txn.transactionType === 'deposit' ? <FiArrowDownLeft size={20} /> : <FiArrowUpRight size={20} />}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-800">{txn.description || 'Treasury Funding'}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{formatDate(txn.createdAt)} • REF: {txn.reference}</p>
                         </div>
                      </div>
                      <div className={`text-right font-black ${txn.transactionType === 'deposit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {txn.transactionType === 'deposit' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionTreasury;
