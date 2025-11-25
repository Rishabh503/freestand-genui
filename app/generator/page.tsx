"use client";

import React, { useState } from 'react';

// The Sun: Our Star - An Interactive Lesson

export default function LessonComponent() {
  // State for the interactive sun brightness
  const [brightness, setBrightness] = useState(50); // Initial brightness

  // State for quiz answers and feedback
  const [quizAnswers, setQuizAnswers] = useState({ q1: null, q2: null, q3: null });
  const [quizFeedback, setQuizFeedback] = useState({ q1: '', q2: '', q3: '' });

  const quizQuestions = [
    {
      question: "Which element is the Sun primarily composed of?",
      options: ["Oxygen", "Hydrogen", "Carbon Dioxide", "Iron"],
      correctAnswer: "Hydrogen",
      id: "q1",
    },
    {
      question: "What process generates the Sun's immense energy?",
      options: ["Chemical reactions", "Nuclear fission", "Nuclear fusion", "Combustion"],
      correctAnswer: "Nuclear fusion",
      id: "q2",
    },
    {
      question: "How long does it take for light from the Sun to reach Earth?",
      options: ["8 seconds", "8 minutes", "8 hours", "8 days"],
      correctAnswer: "8 minutes",
      id: "q3",
    },
  ];

  const handleQuizAnswer = (questionId, selectedAnswer) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: selectedAnswer }));
    const question = quizQuestions.find(q => q.id === questionId);
    if (question) {
      if (selectedAnswer === question.correctAnswer) {
        setQuizFeedback(prev => ({ ...prev, [questionId]: "Correct! Well done." }));
      } else {
        setQuizFeedback(prev => ({ ...prev, [questionId]: `Incorrect. The correct answer is ${question.correctAnswer}.` }));
      }
    }
  };

  // Calculate dynamic SVG properties for the interactive sun based on brightness
  const glowOpacity = brightness / 100 * 0.6 + 0.2; // From 0.2 to 0.8
  const glowRadius = brightness / 100 * 40 + 60; // From 60 to 100 (relative to 200x200 viewBox)
  const shadowOffset = brightness / 100 * 5 + 5; // From 5 to 10
  const shadowBlur = brightness / 100 * 10 + 10; // From 10 to 20

  return (
    <div className="min-h-screen p-8 bg-yellow-50 text-gray-800 font-sans">
      <h1 className="text-5xl font-extrabold text-center mb-12 text-orange-700">
        The Sun: Our Star
      </h1>

      {/* 1. Detailed Description of the Topic */}
      <section className="mb-12 p-8 rounded-xl shadow-lg bg-orange-100 border border-orange-200">
        <h2 className="text-3xl font-semibold mb-4 text-orange-600">What is the Sun?</h2>
        <p className="text-lg leading-relaxed text-orange-800">
          The Sun is the star at the center of our solar system, a colossal ball of hot plasma.
          It is primarily composed of hydrogen and helium, heated to extreme temperatures by
          continuous nuclear fusion reactions in its core. These reactions convert hydrogen into helium,
          releasing an immense amount of energy in the process. This energy radiates outwards as light
          and heat, traveling across space to illuminate and warm our planet. The Sun's gravitational
          force is powerful enough to hold all the planets, asteroids, and comets of our solar system
          in their respective orbits, making it the most dominant celestial body in our cosmic neighborhood.
        </p>
      </section>

      {/* 2. Real-Life Usage of the Topic */}
      <section className="mb-12 p-8 rounded-xl shadow-lg bg-yellow-100 border border-yellow-200">
        <h2 className="text-3xl font-semibold mb-4 text-yellow-600">Real-Life Impact and Importance</h2>
        <ul className="list-disc list-inside text-lg leading-relaxed text-yellow-800 space-y-2">
          <li>
            <span className="font-medium">Sustainer of Life:</span> The Sun provides the light and heat absolutely essential for all life on Earth, driving the process of photosynthesis in plants, which forms the base of most food chains.
          </li>
          <li>
            <span className="font-medium">Climate and Weather Driver:</span> Solar energy powers Earth's entire climate system, influencing global temperatures, creating wind, driving ocean currents, and fueling the water cycle.
          </li>
          <li>
            <span className="font-medium">Primary Energy Source:</span> It is the ultimate source of almost all energy used on Earth, whether directly (solar panels) or indirectly (fossil fuels, wind, hydropower).
          </li>
          <li>
            <span className="font-medium">Timekeeping and Navigation:</span> Historically, the Sun has been crucial for defining day and night, seasons, and agricultural cycles, as well as for navigation.
          </li>
          <li>
            <span className="font-medium">Gravitational Anchor:</span> Its massive gravitational pull keeps Earth and all other planets locked in stable orbits, preventing them from drifting into deep space.
          </li>
        </ul>
      </section>

      {/* 3. Mandatory Animated Component */}
      <section className="mb-12 p-8 rounded-xl shadow-lg bg-pink-100 border border-pink-200 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-semibold mb-6 text-pink-600">Animated Sun Visual</h2>
        <p className="text-lg mb-6 text-pink-800 text-center">
          Observe our animated Sun, gently spinning and radiating energy with a vibrant pulse.
          This visual demonstrates the Sun's constant activity and energy emission.
        </p>
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Pulsing Glow (Animation 1: animate-pulse, duration 1000ms by default) */}
          <div className="absolute w-48 h-48 rounded-full bg-yellow-300 opacity-70 animate-pulse infinite"
               style={{ boxShadow: '0 0 40px 20px rgba(253, 224, 71, 0.7)' }}></div>
          {/* Spinning Sun (Animation 2: animate-spin, duration 1000ms by default - SVG based) */}
          <svg className="w-40 h-40 animate-spin infinite" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="animatedSunGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFEF00" /> {/* Bright yellow */}
                <stop offset="70%" stopColor="#FFA500" /> {/* Orange */}
                <stop offset="100%" stopColor="#FF6347" /> {/* Tomato red */}
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#animatedSunGradient)"
                    style={{ filter: 'drop-shadow(0px 0px 15px rgba(255, 165, 0, 0.8))' }} />
          </svg>
        </div>
      </section>

      {/* 4. Mandatory Interactive Component */}
      <section className="mb-12 p-8 rounded-xl shadow-lg bg-blue-100 border border-blue-200 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-semibold mb-6 text-blue-600">Interactive Sun Brightness Control</h2>
        <p className="text-lg mb-6 text-blue-800 text-center">
          Adjust the slider below to change the Sun's perceived brightness.
          Watch how its glow, core intensity, and shadow dynamically update in real-time.
        </p>

        <div className="relative w-64 h-64 flex items-center justify-center mb-8">
          {/* Dynamic Glow (Visual update 1 & subtle animation) */}
          <div
            className="absolute rounded-full bg-yellow-200 animate-pulse infinite" // Animation 1
            style={{
              width: `${glowRadius * 2}px`,
              height: `${glowRadius * 2}px`,
              opacity: glowOpacity,
              boxShadow: `0 0 ${shadowBlur}px ${shadowBlur / 2}px rgba(253, 224, 71, ${glowOpacity * 0.8})`,
              transition: 'all 0.3s ease-out', // Smooth transition for visual changes
            }}
          ></div>
          {/* Dynamic Sun SVG (Visual update 2) */}
          <svg className="relative w-64 h-64 animate-spin infinite duration-[3000ms]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"> {/* Animation 2 */}
            <defs>
              <radialGradient id="interactiveSunGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={`hsl(45, 100%, ${30 + brightness * 0.4}%)`} /> {/* Brighter yellow */}
                <stop offset="70%" stopColor={`hsl(30, 100%, ${30 + brightness * 0.2}%)`} /> {/* Orange */}
                <stop offset="100%" stopColor={`hsl(15, 80%, ${30 + brightness * 0.1}%)`} /> {/* Reddish */}
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill="url(#interactiveSunGradient)"
                    style={{
                      filter: `drop-shadow(${shadowOffset}px ${shadowOffset}px ${shadowBlur}px rgba(255, 165, 0, ${brightness / 100 * 0.7}))`,
                      transition: 'all 0.3s ease-out', // Smooth transition for visual changes
                    }} />
          </svg>
        </div>

        <div className="w-full max-w-md">
          <label htmlFor="brightness-slider" className="block text-lg font-medium text-blue-700 mb-2">
            Sun Brightness: {brightness}%
          </label>
          <input
            type="range"
            id="brightness-slider"
            min="0"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-blue-300"
            style={{
              background: `linear-gradient(to right, #FFEF00 ${brightness}%, #D1D5DB ${brightness}%)`
            }}
            aria-label="Sun brightness slider"
          />
        </div>
        <p className="mt-4 text-sm text-blue-800 text-center">
          <span className="font-semibold">Explanation:</span> As you increase the brightness, the Sun's core appears more vivid,
          its surrounding glow expands and intensifies, and its shadow becomes more prominent, mimicking a brighter star.
          The subtle pulse and spin further emphasize its dynamic nature.
        </p>
      </section>

      {/* 5. Quiz Section with Instant Feedback */}
      <section className="p-8 rounded-xl shadow-lg bg-green-100 border border-green-200">
        <h2 className="text-3xl font-semibold mb-6 text-green-600 text-center">Test Your Sun Knowledge!</h2>
        <div className="space-y-8">
          {quizQuestions.map((q) => (
            <div key={q.id} className="p-6 rounded-lg bg-green-50 border border-green-200 shadow-sm">
              <p className="text-xl font-medium mb-4 text-green-800">{q.question}</p>
              <div className="flex flex-wrap gap-3">
                {q.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleQuizAnswer(q.id, option)}
                    className={`
                      px-6 py-3 rounded-lg text-lg font-medium transition-colors duration-200
                      ${quizAnswers[q.id] === option
                        ? (option === q.correctAnswer ? 'bg-green-300 text-green-900 border-green-400' : 'bg-pink-300 text-pink-900 border-pink-400')
                        : 'bg-blue-200 text-blue-800 border-blue-300'
                      }
                      border-2
                    `}
                    aria-pressed={quizAnswers[q.id] === option}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {quizFeedback[q.id] && (
                <p className={`mt-4 text-md font-semibold ${quizFeedback[q.id].startsWith('Correct') ? 'text-green-700' : 'text-pink-700'}`}>
                  {quizFeedback[q.id]}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}