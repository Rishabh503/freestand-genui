"use client";

import React, { useState, useEffect } from 'react';
import { Sun as SunIcon } from 'lucide-react';
// These imports are mandated by the rules, even if not explicitly used in this specific lesson.
import { Chart, Component } from 'recharts';
import { format } from 'date-fns';

export default function LessonComponent() {
  const [brightness, setBrightness] = useState(50);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: string | null }>({});
  const [quizFeedback, setQuizFeedback] = useState<{ [key: number]: boolean | null }>({});

  const quizQuestions = [
    {
      question: "What is the primary process that generates the Sun's energy?",
      options: [
        "Chemical combustion",
        "Nuclear fission",
        "Nuclear fusion",
        "Gravitational collapse"
      ],
      correctAnswer: "Nuclear fusion"
    },
    {
      question: "Which of the following is NOT a direct benefit of the Sun's energy on Earth?",
      options: [
        "Photosynthesis in plants",
        "Driving weather patterns",
        "Providing breathable oxygen directly",
        "Heating the planet"
      ],
      correctAnswer: "Providing breathable oxygen directly"
    },
    {
      question: "Approximately how long does it take for light from the Sun to reach Earth?",
      options: [
        "8 seconds",
        "8 minutes",
        "8 hours",
        "8 days"
      ],
      correctAnswer: "8 minutes"
    }
  ];

  const handleQuizAnswer = (questionIndex: number, selectedOption: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionIndex]: selectedOption }));
    const isCorrect = selectedOption === quizQuestions[questionIndex].correctAnswer;
    setQuizFeedback(prev => ({ ...prev, [questionIndex]: isCorrect }));
  };

  // Calculate SVG properties based on brightness
  const sunGlowRadius = 5 + brightness / 10; // Blur radius increases
  const sunGlowOpacity = 0.3 + brightness / 150; // Opacity increases
  const sunShadowOffset = 5 + brightness / 20; // Shadow offset increases
  const sunShadowOpacity = 0.2 + brightness / 200; // Shadow opacity increases
  const sunCoreOpacity = 0.6 + brightness / 100; // Core opacity increases

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6 font-sans text-gray-800">
      {/* Topic Name */}
      <h1 className="text-5xl font-extrabold text-center mb-10 pt-4 text-orange-700 tracking-tight">
        The Sun: Our Star
      </h1>

      {/* 1. Description */}
      <section className="bg-yellow-100 p-8 rounded-3xl shadow-xl mb-12 max-w-4xl mx-auto border border-yellow-200">
        <h2 className="text-3xl font-bold text-yellow-800 mb-4">What is The Sun?</h2>
        <p className="text-lg leading-relaxed text-yellow-700">
          The Sun is the star at the center of our solar system. It is a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions in its core. This incredible process converts hydrogen into helium, releasing an enormous amount of energy. This energy is radiated outward as light and heat, making life on Earth possible. The Sun's immense gravitational pull holds all the planets, including Earth, in their orbits, ensuring the stability of our solar system.
        </p>
      </section>

      {/* 2. Real-life Usage */}
      <section className="bg-orange-100 p-8 rounded-3xl shadow-xl mb-12 max-w-4xl mx-auto border border-orange-200">
        <h2 className="text-3xl font-bold text-orange-800 mb-4">The Sun's Impact on Life</h2>
        <p className="text-lg leading-relaxed text-orange-700">
          The Sun is absolutely vital for all life on Earth. It provides the light and warmth necessary for plants to grow through photosynthesis, forming the base of nearly all food chains. Its energy drives Earth's climate and weather patterns, powers the water cycle, and is the ultimate source of most renewable energy, like solar power. Without the Sun, Earth would be a frozen, dark, and lifeless planet, making it the most important celestial body for our existence.
        </p>
      </section>

      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto mb-12">
        {/* 3. Animated Component */}
        <section className="bg-pink-100 p-8 rounded-3xl shadow-xl flex-1 flex flex-col items-center justify-center border border-pink-200">
          <h2 className="text-3xl font-bold text-pink-800 mb-6">Animated Sun</h2>
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Outer Glow - animate-pulse */}
            <div className="absolute w-full h-full rounded-full bg-yellow-300 opacity-70 animate-pulse duration-[1500ms] ease-in-out"></div>
            {/* Main Sun Body */}
            <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg flex items-center justify-center">
              {/* Inner Core - animate-spin */}
              <div className="absolute w-24 h-24 rounded-full bg-yellow-200 opacity-80 animate-spin duration-[8000ms] infinite"></div>
              {/* Sun Icon */}
              <SunIcon className="w-20 h-20 text-orange-700 z-10" />
            </div>
          </div>
          <p className="mt-6 text-pink-700 text-center text-lg">
            Observe the Sun's radiant energy! The outer glow gently pulses, while its core slowly spins, symbolizing the dynamic processes within.
          </p>
        </section>

        {/* 4. Interactive Component */}
        <section className="bg-blue-100 p-8 rounded-3xl shadow-xl flex-1 border border-blue-200">
          <h2 className="text-3xl font-bold text-blue-800 mb-6">Interactive Sun Brightness</h2>
          <div className="flex flex-col items-center justify-center mb-6">
            <label htmlFor="brightness-slider" className="text-xl font-medium text-blue-700 mb-3">
              Adjust Sun Brightness: <span className="font-bold">{brightness}%</span>
            </label>
            <input
              id="brightness-slider"
              type="range"
              min="0"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full h-2 bg-blue-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
              aria-label="Sun Brightness Slider"
            />
          </div>

          <div className="flex items-center justify-center h-64 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full max-w-xs">
              <defs>
                <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation={sunGlowRadius} result="blur" />
                  <feFlood floodColor="orange" floodOpacity={sunGlowOpacity} result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="sunShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx={sunShadowOffset / 5} dy={sunShadowOffset / 5} stdDeviation={sunShadowOffset / 2} floodColor="rgba(0,0,0,0.5)" floodOpacity={sunShadowOpacity} />
                </filter>
                <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor={`hsl(40, ${70 + brightness / 3}%, ${60 + brightness / 4}%)`} />
                  <stop offset="70%" stopColor={`hsl(20, ${60 + brightness / 4}%, ${50 + brightness / 5}%)`} />
                  <stop offset="100%" stopColor={`hsl(0, ${50 + brightness / 5}%, ${40 + brightness / 6}%)`} />
                </radialGradient>
              </defs>

              {/* Sun body with gradient, glow, and shadow */}
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="url(#sunGradient)"
                filter="url(#sunGlow) url(#sunShadow)"
                className={brightness > 70 ? 'animate-pulse duration-[1500ms]' : ''} // Add pulse animation at higher brightness
              />
              {/* Inner core element, slightly animated */}
              <circle
                cx="50"
                cy="50"
                r="15"
                fill={`rgba(255, 240, 180, ${sunCoreOpacity})`}
                className="animate-spin duration-[6000ms] infinite"
              />
            </svg>
          </div>
          <p className="mt-6 text-blue-700 text-center text-lg">
            Move the slider to adjust the Sun's brightness. Notice how the color, glow intensity, and shadow depth change in real-time, simulating its powerful luminosity! The Sun also subtly pulses at higher brightness levels.
          </p>
        </section>
      </div>

      {/* 5. Quiz Section */}
      <section className="bg-green-100 p-8 rounded-3xl shadow-xl max-w-4xl mx-auto border border-green-200">
        <h2 className="text-3xl font-bold text-green-800 mb-6 text-center">Quiz Time!</h2>
        {quizQuestions.map((q, qIndex) => (
          <div key={qIndex} className="mb-8 p-6 bg-green-50 rounded-2xl shadow-md border border-green-200">
            <p className="text-xl font-semibold text-green-700 mb-4">{qIndex + 1}. {q.question}</p>
            <div className="space-y-3">
              {q.options.map((option, oIndex) => (
                <button
                  key={oIndex}
                  onClick={() => handleQuizAnswer(qIndex, option)}
                  className={`block w-full text-left py-3 px-5 rounded-lg text-lg transition-all duration-300
                    ${quizAnswers[qIndex] === option
                      ? (quizFeedback[qIndex] === true ? 'bg-green-200 text-green-800 border-green-400' : 'bg-red-200 text-red-800 border-red-400')
                      : 'bg-blue-200 text-blue-800 border-blue-300'
                    } border-2`}
                  aria-label={`Select ${option} for question ${qIndex + 1}`}
                  disabled={quizFeedback[qIndex] !== null}
                >
                  {option}
                </button>
              ))}
            </div>
            {quizFeedback[qIndex] !== null && (
              <p className={`mt-4 text-lg font-medium ${quizFeedback[qIndex] ? 'text-green-600' : 'text-red-600'}`}>
                {quizFeedback[qIndex] ? "Correct!" : `Incorrect. The correct answer was: ${q.correctAnswer}`}
              </p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}