import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default ErrorMessage;
