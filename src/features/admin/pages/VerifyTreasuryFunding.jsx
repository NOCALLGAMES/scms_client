import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import api from '../../../lib/api';

const VerifyTreasuryFunding = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your treasury funding transaction...');

    useEffect(() => {
        const verifyPayment = async () => {
            const reference = searchParams.get('reference');
            const isMock = searchParams.get('mock') === 'true';
            const accountId = searchParams.get('accountId');
            const amount = searchParams.get('amount');

            if (!reference) {
                setStatus('error');
                setMessage('No payment reference found.');
                return;
            }

            try {
                let url = `/payments/verify/${reference}`;
                if (isMock) {
                    url += `?mock=true&accountId=${accountId}&amount=${amount}`;
                }

                const { data } = await api.get(url);
                
                setStatus('success');
                setMessage(data.message || 'Treasury funded successfully!');
                toast.success('Treasury funded successfully!');
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. Please contact support.');
                toast.error('Payment verification failed');
            }
        };

        verifyPayment();
    }, [searchParams]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            {status === 'verifying' && (
                <>
                    <FiLoader className="text-6xl text-blue-500 animate-spin" />
                    <h2 className="text-2xl font-bold text-slate-800">Verifying Payment</h2>
                    <p className="text-slate-500">{message}</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                        <FiCheckCircle className="text-6xl" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800">Funding Successful</h2>
                    <p className="text-slate-500 max-w-md">{message}</p>
                    <button 
                        onClick={() => navigate('/admin/treasury')}
                        className="mt-8 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors shadow-lg"
                    >
                        Return to Treasury
                    </button>
                </>
            )}

            {status === 'error' && (
                <>
                    <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <FiXCircle className="text-6xl" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800">Funding Failed</h2>
                    <p className="text-slate-500 max-w-md">{message}</p>
                    <button 
                        onClick={() => navigate('/admin/treasury')}
                        className="mt-8 px-8 py-4 bg-slate-100 text-slate-800 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                    >
                        Go Back
                    </button>
                </>
            )}
        </div>
    );
};

export default VerifyTreasuryFunding;
