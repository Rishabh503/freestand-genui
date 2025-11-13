// app/api/generation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runLessonGenerator } from "@/lib/langchain/graph";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid prompt" },
        { status: 400 }
      );
    }

    // Run the LangGraph pipeline
    const result = await runLessonGenerator(prompt);

    if (result.status === "completed" && result.lessonId) {
      return NextResponse.json({
        success: true,
        lessonId: result.lessonId,
        title: result.lessonTitle,
        message: "Lesson generated successfully!",
      });
    }

    if (result.status === "rejected") {
      return NextResponse.json({
        success: false,
        error: result.errorMessage || "This topic is not suitable for a lesson",
      });
    }

    return NextResponse.json({
      success: false,
      error: result.errorMessage || "Failed to generate lesson",
    });
  } catch (error: any) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}