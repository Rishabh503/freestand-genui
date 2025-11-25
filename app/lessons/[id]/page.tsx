import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import DynamicLessonRenderer from "./DynamicLessonRenderer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function LessonPage({ params }: { params: { id: string } }) {
  const gotId = await params;

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", gotId.id)
    .single();

  if (error || !lesson) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
 

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
       <span> Generated Lesson :</span>     {lesson.title}
          </h1>
          <p className="text-gray-500 text-sm">
            Generated on {new Date(lesson.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <DynamicLessonRenderer code={lesson.tsx_code} lessonId={lesson.id} />
        </div>
      </main>
    </div>
  );
}