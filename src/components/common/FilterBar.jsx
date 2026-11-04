import React from 'react';

export const FilterBar = ({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory }) => {
  const categories = ['Semua', 'iPhone', 'Samsung'];

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      
      {/* Search Input */}
      <div className="w-full sm:w-72">
        <input
          type="text"
          placeholder="Cari smartphone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-[#0071E3] text-white'
                : 'bg-[#F5F5F7] text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

    </div>
  );
};