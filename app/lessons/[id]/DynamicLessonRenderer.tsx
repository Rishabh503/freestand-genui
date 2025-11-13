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

      console.log("Original code:", code);

  
      const match = code.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/);
      const componentName = match ? match[1] : null;

      if (!componentName) {
        throw new Error(
          "No default exported component found. Expected: export default function MyLesson() {}"
        );
      }

      console.log("Component name:", componentName);

     
      let cleaned = code
        .replace(/import[\s\S]*?from\s+["'][^"']+["'];?/g, "")
        .replace(/export\s+default\s+function\s+/g, `function `)
        .replace(/export\s+{[\s\S]*?};?/g, "");

      console.log("Cleaned code:", cleaned);

      // Compile JSX + TypeScript → JS
      let transformed = Babel.transform(cleaned, {
        presets: ["react", "typescript"],
        filename: "lesson.tsx",
      }).code;

      console.log("Transformed code:", transformed);

 
      const globalScope = `
        const React = arguments[0];
        const { useState, useEffect, useMemo, useCallback, useRef } = React;
        const LucideReact = arguments[1];
        const Recharts = arguments[2];
        
        // Auto-destructure ALL Recharts exports
        const {
          ResponsiveContainer, LineChart, BarChart, PieChart, AreaChart, 
          ScatterChart, RadarChart, ComposedChart, Treemap, Sankey, Funnel,
          Line, Bar, Pie, Area, Scatter, Radar, RadialBar, Brush,
          XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, Cell,
          PolarGrid, PolarAngleAxis, PolarRadiusAxis, ReferenceLine,
          ReferenceDot, ReferenceArea, ErrorBar, LabelList, Label
        } = Recharts;
        
        // Auto-destructure ALL Lucide icons
        const {
          AlertCircle, ArrowRight, ArrowLeft, Check, X, Plus, Minus,
          Edit, Trash, Save, Download, Upload, Search, Filter, Menu,
          Home, User, Settings, Bell, Mail, Calendar, Clock, Star,
          Heart, Bookmark, Share, Copy, Eye, EyeOff, Lock, Unlock,
          Play, Pause, SkipForward, SkipBack, Volume, VolumeX,
          Image, File, Folder, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
          Loader, RefreshCw, MoreVertical, MoreHorizontal, Info, HelpCircle,
          CheckCircle, XCircle, AlertTriangle, Zap, TrendingUp, TrendingDown,
          Circle, Square, Triangle, Hexagon, Database, Server, Cloud,
          Wifi, WifiOff, Battery, BatteryCharging, Bluetooth, Camera,
          Mic, MicOff, Phone, PhoneOff, Video, VideoOff, MessageCircle,
          MessageSquare, Send, Paperclip, Link, ExternalLink, Code, Terminal,
          GitBranch, GitCommit, GitMerge, GitPullRequest, Package, Layers,
          Grid, List, LayoutGrid, LayoutList, Maximize, Minimize, ZoomIn, ZoomOut
        } = LucideReact;
        
        ${transformed}
        
        return ${componentName};
      `;

     
      const func = new Function(globalScope);
      const Generated = func(React, LucideReact, Recharts);

      console.log("Generated component:", Generated);

      if (typeof Generated !== "function") {
        throw new Error("Generated lesson is not a valid React component.");
      }

      setComponent(() => Generated);
      setError(null);
    } catch (err: any) {
      console.error("Lesson Render Error:", err);
      setError(err.message || "Unknown error occurred");
    }
  }, [code]);

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        <h2 className="text-xl text-red-700 mb-1">Failed to Load Lesson</h2>
        <p className="text-red-600 mb-4">There was an error rendering this lesson.</p>

        <details className="bg-white border p-3 rounded">
          <summary className="cursor-pointer text-red-700 font-medium">Error Details</summary>
          <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
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