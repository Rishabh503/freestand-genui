"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({});

  const handleGenerate = async () => {
    console.log("prompt recievd ",prompt)
    setLoading(true);
    setResult(null);

   
   const res = await fetch('/api/generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })
    const data = await res.json();
    console.log(data.ans);

    setResult({
      id: 1,
      output: `Generated result for: ${data.ans}`,
    });

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-xl bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4">Front Page Discussion</h1>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
          className="w-full border p-3 rounded mb-4"
          rows={4}
        />

        <button
          onClick={handleGenerate}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
        >
          Generate
        </button>

        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">Status Table</h2>

          <table className="w-full border-collapse border text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Stage</th>
                <th className="border p-2">Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="border p-2">Prompt Received</td>
                <td className="border p-2">{prompt ? "Yes" : "No"}</td>
              </tr>

              <tr>
                <td className="border p-2">Generating</td>
                <td className="border p-2">
                  {loading ? "Loading..." : result ? "Done" : "Idle"}
                </td>
              </tr>

              <tr>
                <td className="border p-2">Output Ready</td>
                <td className="border p-2">
                  {result ? "Available" : "Not yet"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {result && (
          <div className="mt-6 bg-green-50 border border-green-400 p-4 rounded">
            <h3 className="font-medium mb-2">Generated Output</h3>
            <p>{result.output}</p>
          </div>
        )}
      </div>
    </div>
  );
}
