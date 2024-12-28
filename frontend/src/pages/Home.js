import React from 'react';
import { Link } from 'react-router-dom';
import Img from '../home.jpg'; // Fixed import (ensure the path to home.jpg is correct)

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Refuel Rescue</h1>
          <p className="text-xl text-gray-600 mb-8">
            Search for nearby fuel stations or request emergency assistance!
          </p>
          <Link
            to="/login"
            className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>

        {/* Right Image */}
        <div className="flex justify-center">
          <img
            src={Img}
            alt="Fuel Rescue Illustration"
            className="w-full h-auto max-w-md rounded-lg shadow-md"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
