import React from "react";
import { FiMessageSquare, FiSend, FiInbox } from "react-icons/fi";

const Messages = () => {
  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
        <p className="text-gray-600">
          Secure communication with support and admin.
        </p>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex">
        {/* Inbox List */}
        <div className="w-1/3 border-r border-gray-100 bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm outline-none"
            />
          </div>
          <div className="overflow-y-auto h-full">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-white transition-colors ${i === 1 ? "bg-white border-l-4 border-l-blue-600" : ""}`}
              >
                <h4 className="font-bold text-gray-800 text-sm">
                  Support Team
                </h4>
                <p className="text-xs text-gray-500 truncate mt-1">
                  Re: Loan Application Inquiry...
                </p>
                <p className="text-[10px] text-gray-400 mt-2 text-right">
                  2 hrs ago
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <div>
              <h3 className="font-bold text-gray-800">Support Team</h3>
              <span className="text-xs text-green-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>{" "}
                Online
              </span>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 space-y-4">
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-xs text-sm border border-gray-100">
                Hello, how can we assist you today regarding your loan
                application?
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white p-3 rounded-lg rounded-tr-none shadow-sm max-w-xs text-sm">
                I wanted to check if I can increase the amount requested.
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Type your message..."
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 p-1">
                <FiSend className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
