"use client";
import React, { useState, useEffect } from 'react';
import { Sun, ArrowUp, ArrowDown, Cloud, Thermometer, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function LessonComponent() {
  const [sunFacts, setSunFacts] = useState([
    "The Sun is a star at the center of our Solar System.",
    "It's a giant ball of hot gas, mostly hydrogen and helium.",
    "The Sun's gravity holds the Solar System together.",
    "Light from the Sun reaches Earth in about 8 minutes.",
    "The Sun is about 4.6 billion years old."
  ]);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [temperature, setTemperature] = useState(25);
  const [cloudCover, setCloudCover] = useState(0); // 0-100
  const [brightness, setBrightness] = useState(100); // 0-100
  const [isDay, setIsDay] = useState(true);

  const temperatureData = [
    { time: '0:00', temperature: 15 },
    { time: '3:00', temperature: 14 },
    { time: '6:00', temperature: 18 },
    { time: '9:00', temperature: 25 },
    { time: '12:00', temperature: 30 },
    { time: '15:00', temperature: 28 },
    { time: '18:00', temperature: 22 },
    { time: '21:00', temperature: 18 },
    { time: '24:00', temperature: 16 },
  ];

  useEffect(() => {
    if (temperature > 35) {
      alert("Warning: High temperature! Stay hydrated.");
    }
    if (temperature < 10) {
      alert("Warning: Low temperature! Dress warmly.");
    }

    // Simulate day/night cycle
    const currentHour = new Date().getHours();
    setIsDay(currentHour > 6 && currentHour < 18);

  }, [temperature]);

  const nextFact = () => {
    setCurrentFactIndex((prevIndex) => (prevIndex + 1) % sunFacts.length);
  };

  const prevFact = () => {
    setCurrentFactIndex((prevIndex) => (prevIndex - 1 + sunFacts.length) % sunFacts.length);
  };

  const handleTemperatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTemperature(Number(event.target.value));
  };

  const handleCloudCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCloudCover(Number(event.target.value));
    setBrightness(100 - Number(event.target.value)); // Adjust brightness based on cloud cover
  };

  return (
    <div className="container mx-auto p-8 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-center text-orange-700 mb-6">Let's Learn About the Sun!</h1>

      {/* Sun Visualization */}
      <div className="flex justify-center items-center mb-8">
        <div className={`relative w-40 h-40 rounded-full ${isDay ? 'bg-yellow-500 shadow-2xl' : 'bg-gray-800'} transition-all duration-500 ease-in-out`}>
          {isDay && <Sun className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-orange-500 w-20 h-20" />}
          {!isDay && <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white w-20 h-20 animate-pulse">Night</div>}
        </div>
        <div className="ml-4">
          <p className="text-gray-700">{isDay ? 'It\'s daytime!' : 'It\'s nighttime!'}</p>
        </div>
      </div>

      {/* Temperature Control */}
      <div className="mb-6">
        <label htmlFor="temperature" className="block text-gray-700 text-sm font-bold mb-2">
          Temperature (°C):
        </label>
        <div className="flex items-center">
          <Thermometer className="mr-2 text-orange-500" />
          <input
            type="number"
            id="temperature"
            value={temperature}
            onChange={handleTemperatureChange}
            className="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <span className="ml-2 text-gray-700">{temperature}°C</span>
        </div>
      </div>

      {/* Cloud Cover Control */}
      <div className="mb-6">
        <label htmlFor="cloudCover" className="block text-gray-700 text-sm font-bold mb-2">
          Cloud Cover (%):
        </label>
        <div className="flex items-center">
          <Cloud className="mr-2 text-gray-500" />
          <input
            type="range"
            id="cloudCover"
            min="0"
            max="100"
            value={cloudCover}
            onChange={handleCloudCoverChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="ml-2 text-gray-700">{cloudCover}%</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">Adjust the cloud cover to see how it affects brightness.</p>
        <p className="text-sm text-gray-500 mt-1">Brightness: {brightness}%</p>
      </div>

      {/* Sun Facts Carousel */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-orange-600 mb-4">Fun Fact About the Sun:</h2>
        <p className="text-gray-800">{sunFacts[currentFactIndex]}</p>
        <div className="flex justify-between mt-4">
          <button onClick={prevFact} className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            <ArrowUp className="inline-block mr-2" />
            Previous
          </button>
          <button onClick={nextFact} className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Next
            <ArrowDown className="inline-block ml-2" />
          </button>
        </div>
      </div>

      {/* Temperature Chart */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-orange-600 mb-4">Daily Temperature Variation</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={temperatureData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperature" stroke="#e67e22" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-500 mt-2">This chart shows how the temperature changes throughout the day.</p>
      </div>

      {/* Additional Information */}
      <div className="mt-8 p-4 bg-yellow-50 rounded-md border border-yellow-200">
        <h3 className="font-semibold text-lg text-orange-700 flex items-center"><Info className="mr-2" /> Additional Resources</h3>
        <ul className="list-disc pl-5 mt-2 text-gray-700">
          <li><a href="https://www.nasa.gov/mission_pages/sunearth/index.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">NASA - Sun-Earth Connection</a></li>
          <li><a href="https://www.space.com/15592-sun-facts-composition-size-age.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Space.com - Facts About The Sun</a></li>
        </ul>
      </div>
    </div>
  );
}