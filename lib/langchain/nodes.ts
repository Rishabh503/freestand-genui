// lib/langchain/nodes.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GraphStateType } from "./state";
import { validateTSXCode, extractComponentCode } from "../compiler/validator";
import { createClient } from "@supabase/supabase-js";

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_KEY!,
  model: "gemini-2.0-flash",
  temperature: 0.7,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function analyzePrompt(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const systemPrompt = `You are an educational content analyzer. 
  Analyze if the prompt is related to education/learning.
  Extract a clear lesson title.
  Return JSON: { "isValid": true/false, "title": "...", "reason": "..." }`;

  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: state.prompt },
  ]);

  try {
    const parsed = JSON.parse(response.content.toString());
    
    if (!parsed.isValid) {
      return {
        status: "rejected",
        errorMessage: parsed.reason || "Not an educational topic",
      };
    }

    return {
      lessonTitle: parsed.title,
      status: "analyzed",
    };
  } catch {
    return {
      lessonTitle: state.prompt.slice(0, 100),
      status: "analyzed",
    };
  }
}

export async function generateUI(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const systemPrompt = `You are an expert React/TypeScript UI generator for educational content.

You are an expert React/TypeScript UI generator for educational content.

CRITICAL RULES:
1. Generate a COMPLETE, FUNCTIONAL React component in TypeScript.
2. Import structure MUST be exactly like this:
   import React, { useState, useEffect } from 'react';
   import { IconName } from 'lucide-react';
   import { Chart, Component } from 'recharts';
   import { format } from 'date-fns';

3. Component MUST be exported as: export default function LessonComponent()
4. Use Tailwind CSS for ALL styling.
5. Make it HIGHLY INTERACTIVE with buttons, inputs, animations.
6. Include working examples, visualizations, or interactive elements.
7. Add clear instructions and explanations within the UI.

8. STRICT RULE: Do NOT add ANY hover effects anywhere.
   - No hover:bg-...
   - No hover:text-...
   - No hover:opacity-...
   - No hover:shadow-...
   - No hover:scale-...
   - No transition tied to hover

9. Buttons must NEVER use a white background.
   - Use pastel colors like bg-blue-200, bg-pink-200, bg-green-200, bg-yellow-200.
   - Background must be light and bright.

10. My primary background is white, so use a soft contrast palette.

11. Focus heavily on written content and explanations.

12. Add at least one animation using Tailwind classes (animate-bounce, animate-pulse, etc.), but NOT hover-based.

13. NO dangerous code: no eval, innerHTML, dangerouslySetInnerHTML.

14. The code must run in Next.js → add "use client" at the TOP.

15. Return ONLY the complete TSX component inside a Markdown code block.

LESSON TOPIC: ${state.lessonTitle}

Generate the full component now:
`;

  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: `Create an interactive lesson for: ${state.prompt}` },
  ]);

  const rawCode = response.content.toString();
  const extractedCode = extractComponentCode(rawCode);

  return {
    tsxCode: extractedCode,
    status: "generated",
  };
}

export async function fixErrors(state: GraphStateType): Promise<Partial<GraphStateType>> {

  const criticalErrors = state.validationErrors.filter(err => 
    !err.includes("Try `npm i --save-dev @types/") &&
    !err.includes("Could not find a declaration file") &&
    !err.includes("Module") &&
    err !== "Component must have 'export default'"
  );

  
  if (criticalErrors.length === 0) {
    return {
      isValid: true,
      validationErrors: [],
      status: "validated",
    };
  }

  const systemPrompt = `You are a code fixing expert. Your job is to fix TypeScript/React errors.

INSTRUCTIONS:
1. Review the code and ONLY fix the specific errors listed.
2. Make minimum changes — keep logic the same.
3. Keep all imports exactly as they are.
4. Do not rewrite working parts.

5. STRICT STYLE RULES:
   5.1 Remove ALL hover: classes from the code.
       - Delete any class starting with "hover:"
       - Remove hover:bg, hover:text, hover:opacity, hover:scale, hover:shadow, etc.
   5.2 If any button uses bg-white, change it to a pastel color (bg-blue-200).
   5.3 Ensure there are NO hover effects left anywhere in the file.
   5.4 Keep all button styles light, bright, and without white backgrounds.

CRITICAL ERRORS TO FIX:
${criticalErrors.join("\n")}

CURRENT CODE:
\`\`\`tsx
${state.tsxCode}
\`\`\`

Return ONLY the corrected TSX code with NO extra text:
`;

  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: "Fix these errors in the code" },
  ]);

  const rawCode = response.content.toString();
  const extractedCode = extractComponentCode(rawCode);

  return {
    tsxCode: extractedCode,
    status: "fixed",
  };
}

export async function validateCode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const validation = validateTSXCode(state.tsxCode);

  if (validation.isValid) {
    return {
      isValid: true,
      validationErrors: [],
      status: "validated",
    };
  }

  return {
    isValid: false,
    validationErrors: validation.errors,
    attempt: (state.attempt || 0) + 1,
    status: "validation_failed",
  };
}

export async function saveLesson(state: GraphStateType): Promise<Partial<GraphStateType>> {
  try {
    const { data, error } = await supabase
      .from("lessons")
      .insert({
        title: state.lessonTitle,
        prompt: state.prompt,
        tsx_code: state.tsxCode,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return {
      lessonId: data.id,
      status: "saved",
    };
  } catch (error: any) {
    return {
      status: "save_failed",
      errorMessage: error.message,
    };
  }
}

export function shouldRetry(state: GraphStateType): string {
  if (state.status === "rejected" || state.status === "save_failed") {
    return "end";
  }
  
  if (state.isValid) {
    return "save";
  }
  
  if ((state.attempt || 0) >= 3) {
    return "end";
  }
  
  return "fix";
}

export function finalizeState(state: GraphStateType): Partial<GraphStateType> {
  if (state.lessonId) {
    return { status: "completed" };
  }
  
  return {
    status: "failed",
    errorMessage: state.errorMessage || "Maximum retry attempts reached",
  };
}