import React, { useState } from "react";
import { FiSearch, FiCheckCircle } from "react-icons/fi";

import { useBrand } from "../../../contexts/BrandContext";

const ManagementDirectory = ({
  title,
  description,
  primaryAction,
  data = [],
  columns = [],
  isLoading,
  isError,
  searchKeys = [], // e.g. ['name', 'email']
  filterNodes, // extra React elements for filtering
  emptyMessage = "No records found.",
  customEmptyNode,
  onRowClick,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { brandColor, getBrandBg, getBrandBgLight } = useBrand();

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    return searchKeys.some((key) => {
      // Allow nested keys like "user.name"? Usually simple keys are enough.
      const val = item[key];
      return (
        val && String(val)?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      );
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>

        {primaryAction && (
          <div className="mt-4 md:mt-0">
            <button
              onClick={primaryAction.onClick}
              style={getBrandBg()}
              className="flex items-center px-4 py-2 text-white rounded-lg transition-all hover:opacity-90 active:scale-95 shadow-sm font-medium"
            >
              {primaryAction.icon && (
                <span className="mr-2">{primaryAction.icon}</span>
              )}
              {primaryAction.label}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        {searchKeys.length > 0 && (
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ '--focus-color': brandColor }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--focus-color)] outline-none text-sm bg-white transition-all"
            />
          </div>
        )}

        {filterNodes && (
          <div className="flex items-center space-x-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {filterNodes}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Loading...
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-64 text-red-500">
            Failed to load data.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      className={`px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}`}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((row, rowIdx) => (
                  <tr
                    key={row.id || rowIdx}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors group ${onRowClick ? 'cursor-pointer hover:bg-brand-50/50' : 'hover:bg-brand-50/30'}`}
                    style={onRowClick ? { '--hover-bg': getBrandBgLight().backgroundColor } : {}}
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className={`px-6 py-4 whitespace-nowrap ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}`}
                      >
                        {col.render ? col.render(row) : row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredData.length === 0 && (
              <div className="py-20 text-center">
                {customEmptyNode ? (
                  customEmptyNode
                ) : (
                  <>
                    <FiCheckCircle className="text-5xl text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">{emptyMessage}</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagementDirectory;
