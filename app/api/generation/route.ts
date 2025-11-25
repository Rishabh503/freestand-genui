import { NextRequest, NextResponse } from "next/server";
import { runLessonGenerator } from "@/lib/langchain/graph";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
     const { userId } =await auth();
     console.log(userId)
     if(!userId){
       return NextResponse.json({
      success: false,
      error:"user not signed or the userId not found"
    });

     }
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid prompt" },
        { status: 400 }
      );
    }

    //  the LangGraph pipeline
    const result = await runLessonGenerator(prompt,userId);

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