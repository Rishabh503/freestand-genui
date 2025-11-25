"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Copy, Download, Check, Loader2 } from "lucide-react";

export default function GeneratorPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState<
    { id: string; label: string; icon?: React.ReactNode; status: "idle" | "running" | "done" | "failed" }[]
  >([
    { id: "analyze", label: "Analyzing your request", status: "idle" },
    { id: "generate", label: "Generating interactive UI", status: "idle" },
    { id: "validate", label: "Validating TypeScript", status: "idle" },
    { id: "fix", label: "Auto-fixing errors", status: "idle" },
    { id: "save", label: "Saving lesson", status: "idle" },
  ]);
  const [generated, setGenerated] = useState<{ title: string; lessonId?: string; tsx: string } | null>(null);

  useEffect(() => {
    return () => {}; // no-op cleanup
  }, []);

  const reset = () => {
    setError(null);
    setGenerated(null);
    setStages((s) => s.map((st) => ({ ...st, status: "idle" })));
    setRunning(false);
  };

  const visibleDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const fakeGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a lesson prompt");
      return;
    }
    setError(null);
    setGenerated(null);
    setRunning(true);
    const delays = [1200, 1800, 1400, 2000, 1000];
    try {
      for (let i = 0; i < stages.length; i++) {
        setStages((prev) => prev.map((p, idx) => (idx < i ? { ...p, status: "done" } : idx === i ? { ...p, status: "running" } : { ...p, status: "idle" })));
        await visibleDelay(delays[i]);
      }
      setStages((s) => s.map((st) => ({ ...st, status: "done" })));
      await visibleDelay(600);
      const sampleTSX = buildSampleTSX(prompt);
      setGenerated({
        title: deriveTitle(prompt),
        lessonId: "lesson_" + Math.random().toString(36).slice(2, 9),
        tsx: sampleTSX,
      });
      setRunning(false);
    } catch (e: any) {
      setError("Generation failed. Try again.");
      setStages((s) => s.map((st) => ({ ...st, status: "failed" })));
      setRunning(false);
    }
  };

  const deriveTitle = (p: string) => {
    const trimmed = p.trim();
    if (!trimmed) return "Untitled Lesson";
    return trimmed.length > 48 ? trimmed.slice(0, 45) + "..." : trimmed;
  };

  const buildSampleTSX = (p: string) => {
    const safe = p.replace(/`/g, "'");
    return `// LessonAI generated lesson for: ${safe}
"use client";
import React, { useState } from "react";

export default function LessonDemo() {
  const [value, setValue] = useState(50);
  return (
    <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm">
      <h2 className="text-lg font-semibold mb-3">Interactive demo for: ${safe}</h2>
      <input
        aria-label="Demo slider"
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full"
      />
      <div className="mt-4 text-sm">Current value: {value}</div>
    </div>
  );
}
`;
  };

  const copyCode = async () => {
    if (!generated) return;
    await navigator.clipboard.writeText(generated.tsx);
    alert("TSX copied to clipboard");
  };

  const downloadCode = () => {
    if (!generated) return;
    const blob = new Blob([generated.tsx], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${generated.title.replace(/\s+/g, "_") || "lesson"}.tsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="w-full fixed top-0 left-0 z-40 bg-black/70 border-b border-white/8 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
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
            <button onClick={() => alert("Sign-In placeholder")} className="px-4 py-2 rounded-full bg-blue-200 text-black font-medium">
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto pt-28 px-6 pb-20">
        <section className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-b from-gray-200 to-gray-500 bg-clip-text text-transparent">
            AI Lesson Generator
          </h1>
          <p className="mt-3 text-gray-400 max-w-2xl mx-auto">
            Describe your topic and our AI will build a complete interactive lesson for you. Each stage runs in sequence so you can watch the generator do its work.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/6 border border-white/6 rounded-2xl p-6 shadow-xl">
              <label className="text-sm text-gray-300 mb-2 block">Lesson prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your lesson topic, like 'Introduction to Photosynthesis for 5th graders'..."
                className="w-full bg-black/60 border border-white/6 p-4 rounded-lg text-white resize-none focus:outline-none"
                rows={5}
              />

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={fakeGenerate}
                  disabled={running}
                  className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full font-semibold shadow-sm disabled:opacity-50"
                >
                  {running ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <span>Generate Lesson</span>
                    </>
                  )}
                </button>

                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-full bg-blue-200 text-black font-medium"
                >
                  Reset
                </button>
              </div>

              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-8 bg-gradient-to-b from-pink-300 to-yellow-200 rounded-full animate-pulse" />
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Generation Progress</div>
                    <div className="text-sm text-gray-300">Watch each stage complete in order</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {stages.map((s, idx) => (
                    <div key={s.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            s.status === "done" ? "bg-green-400" : s.status === "running" ? "bg-yellow-400 animate-pulse" : "bg-white/10"
                          }`}
                          aria-hidden
                        >
                          {s.status === "done" ? <Check size={12} className="text-black" /> : s.status === "running" ? <Loader2 size={12} className="text-black animate-spin" /> : null}
                        </div>
                        {idx < stages.length - 1 && <div className="w-px h-full bg-white/6 mt-2" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">
                            <span className={s.status === "done" ? "text-green-300" : s.status === "running" ? "text-yellow-300" : "text-gray-300"}>
                              {s.label}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {s.status === "done" ? "Done" : s.status === "running" ? "In progress" : "Pending"}
                          </div>
                        </div>

                        <div className="mt-2 h-2 bg-white/6 rounded-full overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-700 ${
                              s.status === "done" ? "bg-green-400 w-full" : s.status === "running" ? "bg-yellow-400 w-3/4 animate-pulse" : "bg-white/10 w-0"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-500 mt-4 text-center">
                  Stages show sequential progress with slight delays so you can visually confirm each step.
                </p>
              </div>
            </div>

            <div className="mt-6 bg-white/5 border border-white/6 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-3">Generator Output</h3>

              {!generated && (
                <div className="text-gray-400">
                  No lesson generated yet. Click <span className="text-white">Generate Lesson</span> to start.
                </div>
              )}

              {generated && (
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Title</div>
                      <div className="text-white font-semibold">{generated.title}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={copyCode} className="px-3 py-2 rounded-full bg-blue-200 text-black flex items-center gap-2">
                        <Copy size={14} /> Copy TSX
                      </button>
                      <button onClick={downloadCode} className="px-3 py-2 rounded-full bg-pink-200 text-black flex items-center gap-2">
                        <Download size={14} /> Download
                      </button>
                      <button onClick={() => router.push(`/lessons/${generated.lessonId}`)} className="px-3 py-2 rounded-full bg-white text-black font-semibold">
                        View Lesson
                      </button>
                    </div>
                  </div>

                  <pre className="bg-black/70 border border-white/6 rounded-lg p-4 text-xs overflow-auto max-h-72">
                    <code className="whitespace-pre-wrap break-all">{generated.tsx}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gradient-to-b from-black/60 to-black/40 border border-white/6 rounded-2xl p-6 shadow-xl h-full flex flex-col items-center justify-center">
              <img src="/mnt/data/dbd7026e-ae5f-48ed-943c-ebcebdc495c6.png" alt="hero" className="w-40 h-40 object-cover rounded-lg shadow-lg mb-6" />
              <div className="text-center">
                <div className="text-sm text-gray-400">Design inspiration</div>
                <div className="mt-2 text-white font-semibold">akxr labs style</div>
                <p className="text-xs text-gray-400 mt-3 max-w-[220px]">
                  Dark, minimal, elegant. Buttons use soft pastel accents where needed. Stages have visible animations and clear progress indicators.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
