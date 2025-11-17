"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Clock, ExternalLink, Trash2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

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
        fetchHistory(); // Refresh history
        // Redirect to lesson page after 2 seconds
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

  const deleteLesson = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
      fetchHistory(); // Refresh list
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Failed to delete lesson");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Generator */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h1 className="text-3xl font-bold mb-2 text-gray-800">
                AI Lesson Generator
              </h1>
              <p className="text-gray-600 mb-6">
                Describe what you want to learn and we'll create an interactive
                lesson for you
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
                {loading
                  ? "Generating Your Lesson..."
                  : "Generate Interactive Lesson"}
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
                      <span className="text-gray-700">
                        🔍 Analyzing your request
                      </span>
                      <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-500">
                        ✨ Generating interactive UI
                      </span>
                      <span className="text-gray-400">⏳</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-500">
                        ✅ Validating TypeScript
                      </span>
                      <span className="text-gray-400">⏳</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <span className="text-gray-500">
                        🔧 Auto-fixing any errors
                      </span>
                      <span className="text-gray-400">⏳</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-500">💾 Saving lesson</span>
                      <span className="text-gray-400">⏳</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    💡 Smart error fixing: We fix issues instead of
                    regenerating!
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

          {/* Right Column - History */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-xl sticky top-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <Clock className="text-blue-600" size={24} />
                Recent Lessons
              </h2>

              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">No lessons yet</p>
                  <p className="text-sm">Generate your first lesson!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {history.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 flex-1">
                          {lesson.title}
                        </h3>
                        <button
                          onClick={() => deleteLesson(lesson.id)}
                          className="opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700 ml-2"
                          title="Delete lesson"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                        {lesson.prompt}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {formatDate(lesson.created_at)}
                        </span>
                        <button
                          onClick={() => router.push(`/lessons/${lesson.id}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        >
                          View
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}