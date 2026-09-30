"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Book, Check, Loader2, Pen, PenLine } from "lucide-react";
import TextType from "../../components/TextType";
import image from "../../public/image.png";

export default function Page() {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [audience, setAudience] = useState("beginners");
  const [tone, setTone] = useState("fun & friendly");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [showProgress, setShowProgress] = useState(false);

  const [stages, setStages] = useState<
    {
      id: string;
      label: string;
      status: "idle" | "running" | "done" | "failed";
    }[]
  >([
    { id: "analyze", label: "Analyzing your request", status: "idle" },
    { id: "generate", label: "Generating interactive UI", status: "idle" },
    { id: "validate", label: "Validating TypeScript", status: "idle" },
    { id: "fix", label: "Auto-fixing errors", status: "idle" },
    { id: "save", label: "Saving lesson", status: "idle" },
  ]);


  const WaitingArray=["Tell Me About graphs ","Lets study about Sun","Help me Visualize Arrays ", " What is Mean , Mode , Median"]
  const visibleDelay = (ms: number) =>
    new Promise((res) => setTimeout(res, ms));

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a lesson topic");
      return;
    }

    setShowProgress(true);
    setResult(null);
    setError(null);

    const delays = [1200, 1700, 1500, 2000, 1200];

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
        body: JSON.stringify({ prompt, audience, tone }),
      });

      const textResponse = await res.text();
      let data: any;
      try {
        data = JSON.parse(textResponse);
      } catch {
        throw new Error(
          res.status === 504 || res.status === 500
            ? "Generation timed out or server error occurred. Please try again."
            : textResponse || `Server returned error (${res.status})`
        );
      }

      if (data.success) {
        setStages((s) => s.map((st) => ({ ...st, status: "done" })));
        setResult(data);

        setTimeout(() => {
          router.push(`/lessons/${data.lessonId}`);
        }, 1500);
      } else {
        setStages((s) => s.map((st) => ({ ...st, status: "failed" })));
        setError(data.error || "Something went wrong");
      }
    } catch (err: any) {
      setStages((s) => s.map((st) => ({ ...st, status: "failed" })));
      setError(err.message || "Unexpected Error");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setResult(null);
    setPrompt("");
    setAudience("beginners");
    setTone("fun & friendly");
    setShowProgress(false); // HIDE right panel again
    setStages((s) => s.map((st) => ({ ...st, status: "idle" })));
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <main className="flex flex-1 pt-24">
        {/* LEFT PANEL */}
        <div className="w-full lg:w-1/2 border-r border-white/10 p-10">
          <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-gray-200 to-gray-500 bg-clip-text text-transparent">
            Create a Lesson
          </h1>
          <p className="text-gray-400 mb-10">
            Describe the topic and customize how you want the lesson.
          </p>

          {/* INPUTS */}
          <div className="space-y-6">
            <div>
              <label className="text-gray-300 mb-2 block">Lesson Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 h-32"
                placeholder="Example: Teach me algebra basics"
              />
            </div>

            <div>
              <label className="text-gray-300 mb-2 block">
                Target Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white appearance-none cursor-pointer"
              >
                <option value="kids" className="bg-black text-white">Kids</option>
                <option value="beginners" className="bg-black text-white">Beginners</option>
                <option value="college students" className="bg-black text-white">College Students</option>
                <option value="professionals" className="bg-black text-white">Professionals</option>
              </select>
            </div>

            <div>
              <label className="text-gray-300 mb-2 block">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white appearance-none cursor-pointer"
              >
                <option value="fun & friendly" className="bg-black text-white">Fun & Friendly</option>
                <option value="professional" className="bg-black text-white">Professional</option>
                <option value="creative" className="bg-black text-white">Creative</option>
                <option value="academic" className="bg-black text-white">Academic</option>
              </select>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-white text-black px-6 py-3 rounded-full font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : null}
                {loading ? "Generating..." : "Generate Lesson"}
              </button>

              <button
                onClick={reset}
                className="bg-blue-300 text-black px-6 py-3 rounded-full font-medium"
              >
                Reset
              </button>
            </div>

            {error && (
              <p className="text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
                ❌ {error}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="hidden lg:flex w-1/2 p-10 items-center justify-center">
          {/* If NOT generating → show illustration */}
          {!showProgress && (
            <div className="w-full gap-6 h-full flex flex-col items-center justify-center text-center opacity-80 transition-all duration-700">
               {/* <h2 className="text-2xl text-gray-300">Your AI lesson awaits</h2> */}
               
<div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border bg-white/5 border border-white/10 text-gray-200">
  <PenLine size={18} className="text-gray-200" />
  <span className="font-medium">Try Now</span>
</div>
             <div className="text-6xl">
              <TextType
  text={WaitingArray}
  typingSpeed={75}
  pauseDuration={1500}
  showCursor={true}
  cursorCharacter="|"
  variableSpeed={false}
  onSentenceComplete={() => {}}
/>

             </div>
              <p className="text-gray-500 mt-2 max-w-sm">
                Start by entering a topic on the left. We'll generate a full
                interactive lesson for you.
              </p>
            </div>
          )}

          {/* If generating → show progress timeline */}
          {showProgress && (
            <div className="w-full opacity-100 animate-fadeIn mt-4 transition-all">
              <h2 className="text-xl mb-6 text-white/70 tracking-wide">
                Generation Progress
              </h2>

              <div className="space-y-6">
                {stages.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white/5 p-5 rounded-xl border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
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

                      {s.status === "done" && (
                        <Check size={18} className="text-green-300" />
                      )}
                      {s.status === "running" && (
                        <Loader2 className="animate-spin text-yellow-300" />
                      )}
                    </div>

                    <div className="w-full h-2 bg-white/10 rounded-xl overflow-hidden">
                      <div
                        className={`
                          h-2 transition-all ${
                            s.status === "done"
                              ? "bg-green-400 w-full"
                              : s.status === "running"
                              ? "bg-yellow-300 w-3/4 animate-pulse"
                              : "w-0"
                          }
                        `}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* SUCCESS PANEL */}
              {result && (
                <div className="mt-10 p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <h3 className="text-green-300 font-semibold text-xl mb-2">
                    Lesson Generated!
                  </h3>
                  <p className="text-gray-300 mb-4">Redirecting shortly...</p>

                  <button
                    onClick={() => router.push(`/lessons/${result.lessonId}`)}
                    className="bg-green-400 text-black px-6 py-2 rounded-full"
                  >
                    Open Lesson →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
