"use client";

import { useEffect, useState } from "react";
import * as React from "react";
import * as LucideReact from "lucide-react";
import * as Recharts from "recharts";
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

      // console.log("Original code:", code);

      
      const importedFromLucide = new Set<string>();
      const importedFromRecharts = new Set<string>();
      
      
      const lucideMatches = code.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g);
      for (const match of lucideMatches) {
        const items = match[1].split(',').map(s => s.trim());
        items.forEach(item => importedFromLucide.add(item));
      }
      

      const rechartsMatches = code.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]recharts['"]/g);
      for (const match of rechartsMatches) {
        const items = match[1].split(',').map(s => s.trim());
        items.forEach(item => importedFromRecharts.add(item));
      }

      console.log("Imported from Lucide:", Array.from(importedFromLucide));
      console.log("Imported from Recharts:", Array.from(importedFromRecharts));

      
      const match = code.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/);
      const componentName = match ? match[1] : null;

      if (!componentName) {
        throw new Error(
          "No default exported component found. Expected: export default function MyLesson() {}"
        );
      }

      console.log("Component name:", componentName);

      
      let cleaned = code
        .replace(/^["']use client["'];?\s*/gm, "")
        .replace(/import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"][^'"]+['"];?/gm, "")
        .replace(/export\s+default\s+function\s+/g, "function ")
        .replace(/export\s+default\s+/g, "")
        .replace(/export\s*\{[^}]*\}\s*;?/g, "")
        .trim();

      console.log("Cleaned code:", cleaned);

      
      let transformed = Babel.transform(cleaned, {
        presets: ["react", "typescript"],
        filename: "lesson.tsx",
      }).code;

      console.log("Transformed code:", transformed);

      
      const lucideDestructure = importedFromLucide.size > 0
        ? `const { ${Array.from(importedFromLucide).join(', ')} } = LucideReact;`
        : '';
      
      const rechartsDestructure = importedFromRecharts.size > 0
        ? `const { ${Array.from(importedFromRecharts).join(', ')} } = Recharts;`
        : '';

      
      const executionScope = `
        // React and hooks
        const React = arguments[0];
        const { useState, useEffect, useMemo, useCallback, useRef, useContext, useReducer } = React;
        
        // Libraries
        const Recharts = arguments[1];
        const LucideReact = arguments[2];
        const format = arguments[3];
        
        // Dynamically destructure only what's imported
        ${rechartsDestructure}
        ${lucideDestructure}
        
        ${transformed}
        
        return ${componentName};
      `;

      console.log("Execution scope created");

      // Simple date formatter
      const simpleDateFormat = (date: Date | string | number, formatStr: string) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return String(date);
        
        const formats: Record<string, string> = {
          'yyyy': d.getFullYear().toString(),
          'yy': String(d.getFullYear()).slice(-2),
          'MMMM': d.toLocaleString('default', { month: 'long' }),
          'MMM': d.toLocaleString('default', { month: 'short' }),
          'MM': String(d.getMonth() + 1).padStart(2, '0'),
          'M': String(d.getMonth() + 1),
          'dd': String(d.getDate()).padStart(2, '0'),
          'd': String(d.getDate()),
          'HH': String(d.getHours()).padStart(2, '0'),
          'H': String(d.getHours()),
          'hh': String(d.getHours() % 12 || 12).padStart(2, '0'),
          'h': String(d.getHours() % 12 || 12),
          'mm': String(d.getMinutes()).padStart(2, '0'),
          'm': String(d.getMinutes()),
          'ss': String(d.getSeconds()).padStart(2, '0'),
          's': String(d.getSeconds()),
          'a': d.getHours() >= 12 ? 'pm' : 'am',
          'A': d.getHours() >= 12 ? 'PM' : 'AM',
        };
        
        let result = formatStr;
        // Sort by length descending to replace longer patterns first
        Object.entries(formats)
          .sort((a, b) => b[0].length - a[0].length)
          .forEach(([key, value]) => {
            result = result.replace(new RegExp(key, 'g'), value);
          });
        return result;
      };

      // Execute the transformed code
      const componentFactory = new Function(executionScope);
      const GeneratedComponent = componentFactory(React, Recharts, LucideReact, simpleDateFormat);

      console.log("Generated component:", GeneratedComponent);

      if (typeof GeneratedComponent !== "function") {
        throw new Error("Generated lesson is not a valid React component.");
      }

      setComponent(() => GeneratedComponent);
      setError(null);
      console.log("✓ Component loaded successfully");

    } catch (err: any) {
      console.error("Lesson Render Error:", err);
      console.error("Stack:", err.stack);
      setError(err.message || "Unknown error occurred");
    }
  }, [code, lessonId]);

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        <h2 className="text-xl text-red-700 mb-1">Failed to Load Lesson</h2>
        <p className="text-red-600 mb-4">There was an error rendering this lesson.</p>

        <details className="bg-white border p-3 rounded">
          <summary className="cursor-pointer text-red-700 font-medium">Error Details</summary>
          <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
            {error}
          </pre>
        </details>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Reload Page
        </button>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
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