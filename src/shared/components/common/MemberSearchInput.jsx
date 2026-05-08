import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiUser, FiLoader, FiX } from 'react-icons/fi';
import API from '../../../lib/api';
import { useAuth } from '../../../features/auth/hooks/useAuth';

const MemberSearchInput = ({ onSelect, selectedMember, placeholder = "Search for a member by name or email...", excludeId }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const { user } = useAuth(); // to exclude self

  useEffect(() => {
    // Click outside to close standard dropdown behavior
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Debounce the search
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const res = await API.get(`/users/search?q=${encodeURIComponent(query)}`);
          let members = res.data?.data?.users || [];
          
          // Filter out the current user and any explicitly excluded ID
          members = members.filter(m => m.id !== user?.id && m.id !== excludeId);
          
          setResults(members);
          setIsOpen(true);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, user?.id, excludeId]);

  const handleSelect = (member) => {
    onSelect(member);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery('');
  };

  if (selectedMember) {
    return (
      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <FiUser />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{selectedMember.name}</p>
            <p className="text-xs text-slate-500">{selectedMember.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
          title="Remove"
        >
          <FiX />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <FiLoader className="text-slate-400 animate-spin" />
          ) : (
            <FiSearch className="text-slate-400" />
          )}
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all font-medium text-slate-700"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
             setQuery(e.target.value);
             if (e.target.value.length < 2) setIsOpen(false);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
      </div>

      {/* Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {results.length > 0 ? (
            <ul className="divide-y divide-slate-50">
              {results.map((member) => (
                <li key={member.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(member)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      <FiUser />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-700 text-sm truncate">{member.name}</p>
                      <p className="text-xs text-slate-400 truncate">{member.email}</p>
                    </div>
                    {member.accounts?.[0] && (
                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Savings</p>
                        <p className="text-sm font-bold text-slate-600">
                          ₦{parseFloat(member.accounts[0].balance).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-slate-500 text-sm">
              {!isLoading && "No active members found."}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberSearchInput;
