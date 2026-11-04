import React from 'react';

export const Badge = ({ status }) => {
  const statusStyles = {
    AVAILABLE: "bg-emerald-50 text-emerald-600 border-emerald-200",
    RENTED: "bg-blue-50 text-blue-600 border-blue-200",
    MAINTENANCE: "bg-amber-50 text-amber-600 border-amber-200",
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
    VERIFIED: "bg-emerald-50 text-emerald-600 border-emerald-200",
    REJECTED: "bg-rose-50 text-rose-600 border-rose-200",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};