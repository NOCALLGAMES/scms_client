import React from "react";
import {
  FiHelpCircle,
  FiPhone,
  FiMail,
  FiMapPin,
  FiChevronDown,
} from "react-icons/fi";

const Support = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          How can we help you?
        </h1>
        <p className="text-gray-600 mt-2">
          Find answers to common questions or contact our support team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 text-xl">
            <FiPhone />
          </div>
          <h3 className="font-bold text-gray-900">Call Us</h3>
          <p className="text-sm text-gray-500 mt-1">+234 800 123 4567</p>
          <p className="text-xs text-gray-400">Mon-Fri, 9am - 5pm</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-xl">
            <FiMail />
          </div>
          <h3 className="font-bold text-gray-900">Email Us</h3>
          <p className="text-sm text-gray-500 mt-1">support@nocall.coop</p>
          <p className="text-xs text-gray-400">Response within 24hrs</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600 text-xl">
            <FiMapPin />
          </div>
          <h3 className="font-bold text-gray-900">Visit Us</h3>
          <p className="text-sm text-gray-500 mt-1">123 Cooperative Way</p>
          <p className="text-xs text-gray-400">Lagos, Nigeria</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            "How do I apply for a loan?",
            "What are the interest rates for savings?",
            "How long does withdrawal take?",
            "Can I change my next of kin?",
          ].map((q, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center group"
            >
              <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                {q}
              </span>
              <FiChevronDown className="text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Support;
