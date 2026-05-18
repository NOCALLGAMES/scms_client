import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiUser, FiLoader, FiX, FiCheckCircle } from 'react-icons/fi';
import API from '../../../lib/api';
import { useAuth } from '../../../features/auth/hooks/useAuth';

/**
 * AccountSearchInput - Searches savings accounts by partial account number.
 * Follows the same pattern as MemberSearchInput used in guarantor selection.
 *
 * @param {Object} props
 * @param {Object|null} props.selectedAccount - Currently confirmed recipient { accountNumber, ownerName, ownerEmail }
 * @param {Function} props.onSelect - Called with an account object or null when cleared
 * @param {string} [props.placeholder]
 */
const AccountSearchInput = ({ onSelect, selectedAccount, placeholder = "Type or paste account number..." }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const { user } = useAuth(); // to exclude self

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (selectedAccount) return; // don't search if already confirmed

    const timer = setTimeout(async () => {
      if (query.length < 3) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await API.get(`/transactions/find-account/${encodeURIComponent(query)}`);
        const data = res.data?.data;

        if (data?.exact) {
          // Exact match — but reject if it's the current user's own account
          if (data.ownerEmail && user?.email && data.ownerEmail === user.email) {
            setSuggestions([]);
            setIsOpen(false);
            // Show nothing; backend will also reject
            return;
          }
          onSelect({
            accountNumber: data.accountNumber,
            ownerName: data.ownerName,
            ownerEmail: data.ownerEmail,
          });
          setSuggestions([]);
          setIsOpen(false);
        } else if (data?.suggestions?.length > 0) {
          // Filter out the current user's own accounts
          const filtered = data.suggestions.filter(
            (s) => !user?.email || s.ownerEmail !== user.email
          );
          setSuggestions(filtered);
          setIsOpen(filtered.length > 0);
        } else {
          setSuggestions([]);
          setIsOpen(false);
        }
      } catch {
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, selectedAccount]);

  const handleSelect = (account) => {
    onSelect(account);
    setQuery('');
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  // Confirmed state — show the selected recipient chip
  if (selectedAccount) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <FiCheckCircle size={18} />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{selectedAccount.ownerName}</p>
            <p className="text-xs text-slate-500 font-mono">{selectedAccount.accountNumber}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
          title="Clear"
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
            if (e.target.value.length < 3) {
              setSuggestions([]);
              setIsOpen(false);
            }
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
        />
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && query.length >= 3 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.length > 0 ? (
            <ul className="divide-y divide-slate-50">
              {suggestions.map((account) => (
                <li key={account.accountNumber}>
                  <button
                    type="button"
                    onClick={() => handleSelect(account)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                      <FiUser size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-700 text-sm truncate">{account.ownerName}</p>
                      <p className="text-xs text-slate-400 font-mono truncate">{account.accountNumber}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-slate-500 text-sm">
              {!isLoading && 'No savings account found.'}
            </div>
          )}
        </div>
      )}

      {query.length >= 3 && !isLoading && suggestions.length === 0 && !isOpen && (
        <p className="mt-1 text-xs text-slate-400 pl-1">Type at least 3 characters to search...</p>
      )}
    </div>
  );
};

export default AccountSearchInput;
