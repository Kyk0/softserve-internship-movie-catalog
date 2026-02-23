import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of visible pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the start
      if (currentPage <= 3) {
        end = 4;
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* First Page Button */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg text-sm font-medium transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          bg-gray-800 text-white hover:bg-gray-700
          disabled:hover:bg-gray-800"
      >
        ««
      </button>

      {/* Previous Page Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg text-sm font-medium transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          bg-gray-800 text-white hover:bg-gray-700
          disabled:hover:bg-gray-800"
      >
        «
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${page === currentPage
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : page === '...'
                ? 'bg-transparent text-gray-400 cursor-default'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
        >
          {page}
        </button>
      ))}

      {/* Next Page Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg text-sm font-medium transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          bg-gray-800 text-white hover:bg-gray-700
          disabled:hover:bg-gray-800"
      >
        »
      </button>

      {/* Last Page Button */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg text-sm font-medium transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          bg-gray-800 text-white hover:bg-gray-700
          disabled:hover:bg-gray-800"
      >
        »»
      </button>
    </div>
  );
};

export default Pagination; 