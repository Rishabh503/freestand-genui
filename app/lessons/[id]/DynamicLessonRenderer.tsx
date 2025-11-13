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

      // Extract default exported function name
      const match = code.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/);
      const componentName = match ? match[1] : null;

      if (!componentName) {
        throw new Error(
          "No default exported component found. Expected: export default function MyLesson() {}"
        );
      }

      console.log("Component name:", componentName);

      // Remove ALL imports and exports
      let cleaned = code
        .replace(/^["']use client["'];?\s*/gm, "") // Remove "use client"
        .replace(/import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"][^'"]+['"];?/gm, "") // Remove all import statements
        .replace(/export\s+default\s+function\s+/g, "function ") // Remove export default
        .replace(/export\s+default\s+/g, "") // Remove standalone export default
        .replace(/export\s*\{[^}]*\}\s*;?/g, "") // Remove named exports
        .trim();

      console.log("Cleaned code:", cleaned);

      // Compile JSX + TypeScript → JS using Babel
      let transformed = Babel.transform(cleaned, {
        presets: ["react", "typescript"],
        filename: "lesson.tsx",
      }).code;

      console.log("Transformed code:", transformed);

      // Create comprehensive execution scope with ALL available libraries
      const executionScope = `
        // React and hooks
        const React = arguments[0];
        const { useState, useEffect, useMemo, useCallback, useRef, useContext, useReducer } = React;
        
        // Recharts - ALL exports
        const Recharts = arguments[1];
        const { 
          ResponsiveContainer, LineChart, BarChart, PieChart, AreaChart, 
          ScatterChart, RadarChart, ComposedChart, Treemap, Sankey, 
          FunnelChart, Funnel, Line, Bar, Pie, Area, Scatter, Radar, 
          RadialBar, Brush, XAxis, YAxis, ZAxis, CartesianGrid, 
          Tooltip, Legend, Cell, PolarGrid, PolarAngleAxis, 
          PolarRadiusAxis, ReferenceLine, ReferenceDot, ReferenceArea, 
          ErrorBar, LabelList, Label, Text, RadialBarChart, Sector,
          Curve, Dot, Cross, Customized
        } = Recharts;
        
        // Lucide React - ALL common icons
        const LucideReact = arguments[2];
        const {
          Activity, AlertCircle, AlertTriangle, Archive, ArrowRight, ArrowLeft,
          ArrowUp, ArrowDown, Award, BarChart2, BarChart3, Battery, BatteryCharging,
          Bell, BellOff, Bluetooth, Bold, Book, BookOpen, Bookmark, Box, Briefcase,
          Calendar, Camera, CameraOff, Check, CheckCircle, CheckSquare, ChevronDown,
          ChevronLeft, ChevronRight, ChevronUp, Circle, Clipboard, Clock, Cloud,
          Code, Coffee, Command, Copy, CreditCard, Crop, Database, Delete, Disc,
          Download, DownloadCloud, Droplet, Edit, Edit2, Edit3, ExternalLink,
          Eye, EyeOff, Facebook, FastForward, File, FileText, Film, Filter, Flag,
          Folder, Frown, Gift, GitBranch, GitHub, Globe, Grid, Hash, Heart,
          HelpCircle, Home, Image, Inbox, Info, Instagram, Italic, Key, Layers,
          Layout, Link, Link2, Linkedin, List, Loader, Lock, LogIn, LogOut, Mail,
          Map, MapPin, Maximize, Menu, MessageCircle, MessageSquare, Mic, MicOff,
          Minimize, Minus, MinusCircle, Monitor, Moon, MoreHorizontal, MoreVertical,
          Music, Navigation, Package, Paperclip, Pause, PauseCircle, Percent, Phone,
          PhoneCall, PhoneOff, Play, PlayCircle, Plus, PlusCircle, Power, Printer,
          Radio, RefreshCcw, RefreshCw, Repeat, Rewind, Save, Scissors, Search,
          Send, Server, Settings, Share, Share2, Shield, ShoppingBag, ShoppingCart,
          Shuffle, Sidebar, SkipBack, SkipForward, Slack, Sliders, Smartphone,
          Smile, Speaker, Square, Star, Sun, Tablet, Tag, Target, Terminal,
          ThumbsDown, ThumbsUp, TrendingDown, TrendingUp, Trash, Trash2, Triangle,
          Truck, Tv, Twitter, Type, Umbrella, Unlock, Upload, UploadCloud, User,
          Users, Video, VideoOff, Volume, Volume1, Volume2, VolumeX, Watch, Wifi,
          WifiOff, X, XCircle, XSquare, Youtube, Zap, ZoomIn, ZoomOut
        } = LucideReact;
        
        // Date formatting utilities (simple replacements for date-fns)
        const format = arguments[3];
        
        ${transformed}
        
        return ${componentName};
      `;

      console.log("Executing component...");

      // Simple date formatter as fallback
      const simpleDateFormat = (date: Date | string | number, formatStr: string) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return String(date);
        
        const formats: Record<string, string> = {
          'yyyy': d.getFullYear().toString(),
          'MM': String(d.getMonth() + 1).padStart(2, '0'),
          'dd': String(d.getDate()).padStart(2, '0'),
          'HH': String(d.getHours()).padStart(2, '0'),
          'mm': String(d.getMinutes()).padStart(2, '0'),
          'ss': String(d.getSeconds()).padStart(2, '0'),
        };
        
        let result = formatStr;
        Object.entries(formats).forEach(([key, value]) => {
          result = result.replace(key, value);
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