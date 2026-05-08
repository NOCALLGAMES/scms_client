import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiAlertTriangle } from "react-icons/fi";

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-red-50 p-6 rounded-full mb-6">
        <FiAlertTriangle className="text-6xl text-red-500" />
      </div>
      <h1 className="text-6xl font-black text-slate-900 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Page Not Found</h2>
      <p className="text-slate-500 max-w-md mb-8">
        Oops! The page you are looking for doesn't exist or has been moved.
        Please check the URL or return to the dashboard.
      </p>
      <Link
        to="/dashboard"
        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-200"
      >
        <FiHome />
        <span>Back to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFound;
