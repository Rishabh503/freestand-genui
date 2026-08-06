"use client";

import { useEffect, useState } from "react";
import * as React from "react";
import * as LucideReact from "lucide-react";
import * as Recharts from "recharts";
import * as Babel from "@babel/standalone";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  countdown: number;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private timer: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, countdown: 5 };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Runtime error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ countdown: 5 });
    
    this.timer = setInterval(() => {
      this.setState((prev) => {
        if (prev.countdown <= 1) {
          if (this.timer) clearInterval(this.timer);
          window.location.href = '/generator';
          return { countdown: 0 };
        }
        return { countdown: prev.countdown - 1 };
      });
    }, 1000);
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-red-900 my-4 shadow-md">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <LucideReact.AlertOctagon size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-800 mb-1">Interactive Component Crashed</h3>
              <p className="text-red-700 text-sm mb-4">
                The generated interactive element crashed during execution. This could be due to a runtime bug in the code.
                <span className="block mt-2 font-semibold text-red-800">
                  Automatically redirecting back to the generator space in {this.state.countdown} seconds...
                </span>
              </p>
              {this.state.error && (
                <details className="bg-white border border-red-200 p-3 rounded-lg text-xs font-mono max-h-42 overflow-y-auto">
                  <summary className="cursor-pointer text-red-600 font-semibold mb-1">
                    Error Log
                  </summary>
                  <pre className="whitespace-pre-wrap text-red-800">
                    {this.state.error.toString()}
                    {"\n"}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition"
                >
                  Reset Component State
                </button>
                <button
                  onClick={() => window.location.href = '/generator'}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-full text-sm font-semibold transition"
                >
                  Go Back to Generator
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    let interval: NodeJS.Timeout;
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
        .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/gm, "")
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
      
      let count = 5;
      setCountdown(count);
      interval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(interval);
          window.location.href = '/generator';
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [code, lessonId]);

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        <h2 className="text-xl text-red-700 mb-1">Failed to Load Lesson</h2>
        <p className="text-red-600 mb-4">
          There was an error rendering this lesson.
          <span className="block mt-2 font-semibold text-red-800">
            Automatically redirecting back to the generator space in {countdown} seconds...
          </span>
        </p>

        <details className="bg-white border p-3 rounded">
          <summary className="cursor-pointer text-red-700 font-medium">Error Details</summary>
          <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
            {error}
          </pre>
        </details>

        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Reload Page
          </button>
          <button
            onClick={() => window.location.href = '/generator'}
            className="bg-gray-200 text-gray-800 px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-300 transition-colors"
          >
            Go Back to Generator
          </button>
        </div>
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
      <ErrorBoundary>
        <Component />
      </ErrorBoundary>
    </div>
  );
}