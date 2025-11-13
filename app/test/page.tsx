"use client";
import React, { useState, useEffect } from 'react';
import { Circle, Square, Triangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';

export default function LessonComponent() {
  const [radius, setRadius] = useState(50);
  const [diameter, setDiameter] = useState(radius * 2);
  const [circumference, setCircumference] = useState(2 * Math.PI * radius);
  const [area, setArea] = useState(Math.PI * radius * radius);
  const [showFormula, setShowFormula] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState(false);

  useEffect(() => {
    setDiameter(radius * 2);
    setCircumference(2 * Math.PI * radius);
    setArea(Math.PI * radius * radius);
  }, [radius]);

  const handleRadiusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = parseFloat(event.target.value);
    setRadius(newRadius);
  };

  const toggleFormula = () => {
    setShowFormula(!showFormula);
  };

  const triggerAnimation = () => {
    setAnimationTrigger(!animationTrigger);
  };

  const pieChartData = [
    { name: 'Area', value: area },
    { name: 'Remaining', value: 1000 - area > 0 ? 1000 - area : 0 }, // Ensure no negative values
  ];

  const COLORS = ['#0088FE', '#00C49F'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 shadow-md p-2 rounded-md">
          <p className="font-semibold">{`${payload[0].name} : ${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold mb-4 text-center text-blue-700">Understanding Circles</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Interactive Circle Visualizer</h2>
        <div className="flex items-center space-x-4">
          <label htmlFor="radius" className="block text-gray-700 text-sm font-bold">
            Radius:
          </label>
          <input
            type="number"
            id="radius"
            className="shadow appearance-none border rounded w-24 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={radius}
            onChange={handleRadiusChange}
          />
        </div>

        <div className="mt-4 flex justify-center items-center">
          <svg width="200" height="200">
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="blue"
              strokeWidth="4"
              fill="lightblue"
              className={`transition-all duration-500 ${animationTrigger ? 'scale-110' : 'scale-100'}`}
            />
            <line x1="100" y1="100" x2={100 + radius} y2="100" stroke="red" strokeWidth="2" />
            <text x={100 + radius / 2} y="95" fill="red" textAnchor="middle">
              Radius
            </text>
          </svg>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Circle Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-700">
              <span className="font-semibold">Diameter:</span> {diameter.toFixed(2)}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Circumference:</span> {circumference.toFixed(2)}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Area:</span> {area.toFixed(2)}
            </p>
          </div>
          <div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={toggleFormula}
            >
              {showFormula ? 'Hide Formulas' : 'Show Formulas'}
            </button>
            {showFormula && (
              <div className="mt-4">
                <p className="text-gray-600">Diameter = 2 * Radius</p>
                <p className="text-gray-600">Circumference = 2 * π * Radius</p>
                <p className="text-gray-600">Area = π * Radius²</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Area Visualization</h2>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="text-gray-700 text-center">This pie chart visualizes the proportion of the circle's area.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Interactive Animation</h2>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={triggerAnimation}
        >
          Animate Circle
        </button>
        <p className="mt-2 text-gray-700">Click the button to see the circle scale up and down!</p>
      </section>

      <footer className="mt-8 text-center text-gray-500">
        <p>Learn more about circles and other shapes!</p>
      </footer>
    </div>
  );
}