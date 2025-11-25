"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Check, Loader2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Page() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [stages, setStages] = useState<
    { id: string; label: string; status: "idle" | "running" | "done" | "failed" }[]
  >([
    { id: "analyze", label: "Analyzing your request", status: "idle" },
    { id: "generate", label: "Generating interactive UI", status: "idle" },
    { id: "validate", label: "Validating TypeScript", status: "idle" },
    { id: "fix", label: "Auto-fixing errors", status: "idle" },
    { id: "save", label: "Saving lesson", status: "idle" },
  ]);

  const visibleDelay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);
    setStages((s) => s.map((st) => ({ ...st, status: "idle" })));

    const delays = [1200, 1800, 1400, 2000, 1000];

    try {
      for (let i = 0; i < stages.length; i++) {
        setStages((prev) =>
          prev.map((p, idx) =>
            idx < i
              ? { ...p, status: "done" }
              : idx === i
              ? { ...p, status: "running" }
              : { ...p, status: "idle" }
          )
        );
        await visibleDelay(delays[i]);
      }

      const res = await fetch("/api/generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (data.success) {
        setStages((s) => s.map((st) => ({ ...st, status: "done" })));
        setResult(data);

        setTimeout(() => {
          router.push(`/lessons/${data.lessonId}`);
        }, 2000);
      } else {
        setStages((s) => s.map((st) => ({ ...st, status: "failed" })));
        setError(data.error || "Failed to generate lesson");
      }
    } catch (err: any) {
      setStages((s) => s.map((st) => ({ ...st, status: "failed" })));
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setResult(null);
    setStages((s) => s.map((st) => ({ ...st, status: "idle" })));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="w-full fixed top-0 left-0 z-40 bg-black/70 border-b border-white/8 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-extrabold bg-gradient-to-b from-gray-300 to-gray-500 bg-clip-text text-transparent">
              LessonAI
            </div>
            <div className="text-xs text-gray-400 tracking-widest">AI Lesson Generator</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 rounded-full bg-white text-black font-semibold"
            >
              Home
            </button>
            <button
              onClick={() => alert("Sign-In placeholder")}
              className="px-4 py-2 rounded-full bg-blue-200 text-black font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto pt-28 px-6 pb-20">
        <section className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-b from-gray-200 to-gray-500 bg-clip-text text-transparent">
            AI Lesson Generator
          </h1>
          <p className="mt-3 text-gray-400 max-w-2xl mx-auto">
            Describe your topic and our AI will build a complete interactive lesson for you.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/6 border border-white/6 rounded-2xl p-6 shadow-xl">
              <label className="text-xl font-semibold text-gray-300 mb-2 block">Lesson prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: 'Teach me about graphs and coordinates'"
                className="w-full bg-black/60 border border-white/6 p-4 rounded-lg text-white resize-none focus:outline-none"
                rows={5}
              />

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full font-semibold shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Generating...
                    </>
                  ) : (
                    <span>Generate Lesson</span>
                  )}
                </button>

                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-full bg-blue-200 text-black font-medium"
                >
                  Reset
                </button>
              </div>

              {error && (
                <div className="mt-6 bg-red-500/20 border border-red-500/50 p-4 rounded-lg">
                  <p className="text-red-300 font-medium">❌ {error}</p>
                </div>
              )}

              {loading && (
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-8 bg-gradient-to-b from-pink-300 to-yellow-200 rounded-full animate-pulse" />
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">
                        Generation Progress
                      </div>
                      <div className="text-sm text-gray-300">
                        Watch each stage complete in order
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {stages.map((s, idx) => (
                      <div key={s.id} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              s.status === "done"
                                ? "bg-green-400"
                                : s.status === "running"
                                ? "bg-yellow-400 animate-pulse"
                                : "bg-white/10"
                            }`}
                          >
                            {s.status === "done" ? (
                              <Check size={12} className="text-black" />
                            ) : s.status === "running" ? (
                              <Loader2 size={12} className="text-black animate-spin" />
                            ) : null}
                          </div>
                          {idx < stages.length - 1 && (
                            <div className="w-px h-full bg-white/6 mt-2" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">
                              <span
                                className={
                                  s.status === "done"
                                    ? "text-green-300"
                                    : s.status === "running"
                                    ? "text-yellow-300"
                                    : "text-gray-300"
                                }
                              >
                                {s.label}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {s.status === "done"
                                ? "Done"
                                : s.status === "running"
                                ? "In progress"
                                : "Pending"}
                            </div>
                          </div>

                          <div className="mt-2 h-2 bg-white/6 rounded-full overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-700 ${
                                s.status === "done"
                                  ? "bg-green-400 w-full"
                                  : s.status === "running"
                                  ? "bg-yellow-400 w-3/4 animate-pulse"
                                  : "bg-white/10 w-0"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-gray-500 mt-4 text-center">
                    💡 Smart error fixing: We fix issues instead of regenerating!
                  </p>
                </div>
              )}

              {result && (
                <div className="mt-6 bg-green-500/20 border border-green-500/50 p-6 rounded-lg">
                  <h3 className="font-semibold text-xl mb-2 text-green-300">
                    ✅ Lesson Generated!
                  </h3>
                  <p className="text-gray-300 mb-3">
                    <strong>Title:</strong> {result.title}
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    Redirecting you to your interactive lesson...
                  </p>
                  <button
                    onClick={() => router.push(`/lessons/${result.lessonId}`)}
                    className="bg-green-500 text-black px-6 py-2 rounded-full hover:bg-green-400 transition font-semibold"
                  >
                    View Lesson Now →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
