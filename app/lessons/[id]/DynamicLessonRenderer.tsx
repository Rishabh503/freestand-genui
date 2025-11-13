"use client";

import { useEffect, useState } from "react";
import * as React from "react";
import * as LucideReact from "lucide-react";
import * as Recharts from "recharts";
import { format } from "date-fns";
import * as Babel from "@babel/standalone";

interface DynamicLessonRendererProps {
  code: string;
  lessonId: string;
}

export default function DynamicLessonRenderer({
  code,
  lessonId,
}: DynamicLessonRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!code) return;

      // Get default component name
      const match = code.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/);
      const componentName = match ? match[1] : null;

      if (!componentName) {
        throw new Error(
          "No default exported component found. Your lesson must use: export default function MyComponent() {}"
        );
      }

      // Clean imports/exports
      let cleaned = code
        .replace(/import[\s\S]*?from\s+["'][^"']+["'];?/g, "")
        .replace(/export\s+default\s+function\s+/g, `function  `)
        .replace(/export\s+{[\s\S]*?};?/g, "");

      // Compile TS + JSX
      let transformed = Babel.transform(cleaned, {
        presets: ["react", "typescript"],
        filename: "lesson.tsx",
      }).code;

      // Add manual export
      transformed += `\nmodule.exports = ${componentName};`;

      // Create module wrapper
      const module = { exports: {} };
      const exports = module.exports;

      const func = new Function(
        "React",
        "LucideReact",
        "Recharts",
        "format",
        "module",
        "exports",
        transformed + "; return module.exports;"
      );

      const Generated = func(
        React,
        LucideReact,
        Recharts,
        format,
        module,
        exports
      );

      if (typeof Generated !== "function") {
        throw new Error("Generated lesson is not a valid React component.");
      }

      setComponent(() => Generated);
      setError(null);
    } catch (err: any) {
      console.error("Lesson Render Error:", err);
      setError(err.message);
    }
  }, [code]);

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        <h2 className="text-xl text-red-700 mb-1">Failed to Load Lesson</h2>
        <p className="text-red-600 mb-4">There was an error rendering this lesson.</p>

        <details className="bg-white border p-3 rounded">
          <summary className="cursor-pointer text-red-700">Error Details</summary>
          <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
            {error}
          </pre>
        </details>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
        >
          Reload Page
        </button>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="flex justify-center items-center h-64">
        <div>
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-600">Loading your lesson…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <Component />
    </div>
  );
}
