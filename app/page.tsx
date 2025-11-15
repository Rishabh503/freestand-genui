"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    console.log("prompt received", prompt);
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (data.success) {
        setResult(data);
        
        setTimeout(() => {
          router.push(`/lessons/${data.lessonId}`);
        }, 2000);
      } else {
        setError(data.error || "Failed to generate lesson");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            AI Lesson Generator
          </h1>
          <p className="text-gray-600 mb-6">
            Describe what you want to learn and we'll create an interactive lesson for you
          </p>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: 'Teach me about graphs and coordinates' or 'Explain photosynthesis with animations'"
            className="w-full border-2 border-gray-300 p-4 rounded-lg mb-4 focus:border-blue-500 focus:outline-none transition"
            rows={4}
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? "Generating Your Lesson..." : "Generate Interactive Lesson"}
          </button>

          {error && (
            <div className="mt-6 bg-red-50 border-2 border-red-300 p-4 rounded-lg">
              <p className="text-red-700 font-medium">❌ {error}</p>
            </div>
          )}

          {loading && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">
                Generation Progress
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">🔍 Analyzing your request</span>
                  <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">✨ Generating interactive UI</span>
                  <span className="text-gray-400">⏳</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">✅ Validating TypeScript</span>
                  <span className="text-gray-400">⏳</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="text-gray-500">🔧 Auto-fixing any errors</span>
                  <span className="text-gray-400">⏳</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">💾 Saving lesson</span>
                  <span className="text-gray-400">⏳</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3 text-center">
                💡 Smart error fixing: We fix issues instead of regenerating!
              </p>
            </div>
          )}

          {result && (
            <div className="mt-6 bg-green-50 border-2 border-green-400 p-6 rounded-lg">
              <h3 className="font-semibold text-xl mb-2 text-green-800">
                ✅ Lesson Generated!
              </h3>
              <p className="text-gray-700 mb-3">
                <strong>Title:</strong> {result.title}
              </p>
              <p className="text-gray-600 text-sm mb-4">
                Redirecting you to your interactive lesson...
              </p>
              <button
                onClick={() => router.push(`/lessons/${result.lessonId}`)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
              >
                View Lesson Now →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}