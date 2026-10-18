// src/components/LoadingScreen.jsx
import React from "react";

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 flex-col gap-4">
      {/* Container for logo + spinning ring */}
      <div className="relative w-28 h-28">
        {/* Spinning outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        {/* Centered logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="https://res.cloudinary.com/djtvxmttf/image/upload/v1792321290/92b7c9c1-cf96-4949-90e4-87ab165623cc.png"
            alt="puchhuu logo"
            className="w-20 h-20 object-contain"
          />
        </div>
      </div>
      {/* Welcome text */}
      <p className="text-gray-800 font-semibold text-xl mt-2">Welcome to puchhuu :- The Art Of Clean</p>
    </div>
  );
};

export default LoadingScreen;