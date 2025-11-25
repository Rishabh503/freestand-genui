"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { Search, Eye, Edit, Trash2, Loader2, Plus } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Page() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [lessons, setLessons] = useState<any[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    if (isLoaded && user) {
      fetchLessons();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    filterAndSortLessons();
  }, [searchQuery, sortBy, lessons]);

  const fetchLessons = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("clerk_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLessons(data || []);
    } catch (err) {
      console.error("Error fetching lessons:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortLessons = () => {
    let filtered = [...lessons];

    if (searchQuery.trim()) {
      filtered = filtered.filter((lesson) =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredLessons(filtered);
  };

  const deleteLesson = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
      fetchLessons();
    } catch (err) {
      console.error("Error deleting lesson:", err);
      alert("Failed to delete lesson");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-400" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="w-full fixed top-0 left-0 z-40 bg-black/70 border-b border-white/8 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-extrabold bg-gradient-to-b from-gray-300 to-gray-500 bg-clip-text text-transparent">
              LessonAI
            </div>
            <div className="text-xs text-gray-400 tracking-widest">Dashboard</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 rounded-full bg-white text-black font-semibold"
            >
              Home
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto pt-28 px-6 pb-20">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-b from-gray-200 to-gray-500 bg-clip-text text-transparent mb-3">
             Lessons Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            View, manage, and  all of your AI-generated lessons in one place.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search lessons by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/6 border border-white/10 rounded-full pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
              className="bg-white/6 border border-white/10 rounded-full px-4 py-3 text-black focus:outline-none focus:border-white/20"
            >
              <option value="newest">Sort by Date (Newest)</option>
              <option value="oldest">Sort by Date (Oldest)</option>
            </select>

            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 bg-gradient-to-b from-slate-800 to-gray-700 text-white px-6 py-3 rounded-full font-semibold hover:from-slate-600 hover:to-black transition"
            >
              <Plus size={20} />
              Generate New Lesson
            </button>
          </div>
        </div>

        {filteredLessons.length === 0 && !loading ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-lg mb-4">
              {searchQuery ? "No lessons found matching your search." : "No lessons yet."}
            </div>
            {!searchQuery && (
              <button
                onClick={() => router.push("/")}
                className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
              >
                Create Your First Lesson
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition group"
              >
                <h3 className="font-bold text-lg text-white mb-2 line-clamp-2 min-h-[56px]">
                  {lesson.title}
                </h3>

                <p className="text-sm text-gray-400 mb-4">
                  Generated: {formatDate(lesson.created_at)}
                </p>

                <p className="text-sm text-gray-300 mb-6 line-clamp-3 min-h-[60px]">
                  {lesson.prompt}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/lessons/${lesson.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-b from-slate-800 to-gray-700   text-white px-4 py-2 rounded-lg font-medium hover:from-slate-600 hover:to-black transition"
                  >
                    <Eye size={16} />
                    View
                  </button>

                


                  <button
                    onClick={() => deleteLesson(lesson.id)}
                    className="bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 p-2 rounded-lg transition"
                    title="Delete lesson"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}