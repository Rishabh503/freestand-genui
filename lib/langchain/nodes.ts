import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GraphStateType } from "./state";
import { validateTSXCode, extractComponentCode } from "../compiler/validator";
import { createClient } from "@supabase/supabase-js";

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_KEY!,
  model: "gemini-2.5-flash",
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


const layout = `
0 Add the Name of the topic at the top first 
1 A detailed description of the topic (5–6 lines).
2 A clear section describing real-life usage of the topic.
3 One mandatory animated component using Tailwind animations (animate-bounce, animate-pulse, animate-spin) OR an SVG/canvas animation that is clearly visible (not micro).
   - AT LEAST TWO visible animation cues must exist somewhere (e.g., pulsing glow + slow spin).
   - One animated element must be SVG or canvas-based so animation is visually crisp.
4 One mandatory INTERACTIVE component directly connected to the specific topic:
   - The interaction must visually or logically demonstrate the topic.
   - Interaction must NOT be generic. It must deeply match the topic.
   - The interactive component MUST include controls (slider, buttons, color picker, draggable element) and update the visual in real-time.
   Examples:
     • Sun → brightness/size slider changing a glowing SVG sun with gradient and shadow
     • Moon → phase rotation slider that updates an SVG moon
     • Trees → growth height slider that animates an SVG/HTML plant growing
     • Colors → live color mixer with 3 sliders and a preview card using gradient
     • Physics → gravity toggle + draggable object that falls with easing
     • Math → live calculator with formula visualizer
     • Algorithms → step-by-step visualizer with play/pause controls
     • Databases → input → shows index/hash jump visual
     • Networking → packet flow mini-visual with animated packets
     • Encryption → input → animated transform showing encryption steps
5 A quiz with 3 questions + instant feedback based on user answers.
6 Buttons must use pastel colors (bg-blue-200, bg-pink-200, bg-green-200, bg-yellow-200) and never white.
7 At least five UI elements (cards, sections, containers, sidebars, quiz area) must use soft pastel backgrounds.
8 Use pastel accents in text, borders, and SVG fills. Provide at least 5 distinct pastel shades across the UI.
9 Ensure animations are visible on light (white) backgrounds: use glows, shadows, SVG fills, larger durations (>= 600ms) so they're noticeable.
10 Absolutely no hover effects anywhere.
`;


function buildSpecialHint(prompt: string) {
  const lc = prompt.toLowerCase();
  if (lc.includes("sun") || lc.includes("light") || lc.includes("brightness") || lc.includes("star")) {
    return "SPECIAL_INTERACTIVE_HINT: Create a glowing SVG sun with a brightness slider (0–100) that updates SVG fill, glow, and a subtle animate-pulse on higher brightness. Use a warm pastel gradient and visible shadow.";
  }
  if (lc.includes("moon") || lc.includes("phases")) {
    return "SPECIAL_INTERACTIVE_HINT: Create an SVG moon phase visual with a slider to rotate/change phase. Animate transition between phases and use cool pastel fills.";
  }
  if (lc.includes("tree") || lc.includes("plant") || lc.includes("growth")) {
    return "SPECIAL_INTERACTIVE_HINT: Create a plant SVG that grows taller when a slider increases. Animate stem growth and leaf fade-in, show numeric height.";
  }
  if (lc.includes("color") || lc.includes("rgb") || lc.includes("hsl") || lc.includes("palette")) {
    return "SPECIAL_INTERACTIVE_HINT: Create a 3-slider color mixer (R, G, B) with a live preview card and an animated gradient background preview. Use pastel color outputs and show HEX value.";
  }
  if (lc.includes("gravity") || lc.includes("physics") || lc.includes("motion")) {
    return "SPECIAL_INTERACTIVE_HINT: Create a small physics demo: a draggable object with gravity toggle and 'drop' button. Animate falling with easing and show velocity numeric readout.";
  }
  if (lc.includes("sort") || lc.includes("sorting") || lc.includes("algorithm")) {
    return "SPECIAL_INTERACTIVE_HINT: Create a step-by-step sorting visualizer with play/pause, step forward/back controls, and animated element swaps.";
  }
  if (lc.includes("graph") || lc.includes("chart") || lc.includes("plot") || lc.includes("recharts")) {
    return "SPECIAL_INTERACTIVE_HINT: Create a small graph builder: user inputs numbers (comma separated) and a Recharts line/bar updates live. Use pastel strokes and animated points.";
  }
  if (lc.includes("encrypt") || lc.includes("encryption") || lc.includes("cipher")) {
    return "SPECIAL_INTERACTIVE_HINT: Create an input that shows live encrypted output with animated transformation boxes showing steps (substitution/permutation).";
  }
  
  return "SPECIAL_INTERACTIVE_HINT: Create a topic-relevant interactive widget: choose an appropriate visual (slider, color mixer, draggable demo, or mini-graph) that updates a clear, visible SVG/HTML visual in real-time. Ensure controls are labeled and animations are visible (>=600ms).";
}

export async function generateUI(state: GraphStateType): Promise<Partial<GraphStateType>> {
 
  const specialHint = buildSpecialHint(state.prompt || state.lessonTitle || "");

  const systemPrompt = `
You are an expert React + TypeScript + Tailwind UI generator for educational lessons.

CRITICAL RULES (STRONG ENFORCEMENT):
1. Generate a COMPLETE, VALID React component in TypeScript.

2. IMPORTS MUST BE EXACTLY IN THIS FORMAT (NO ALIASES, NO "AS" KEYWORD):
   ✅ CORRECT:
   import React, { useState, useEffect } from 'react';
   import { Sun, Moon, Star } from 'lucide-react';
   import { LineChart, BarChart, PieChart } from 'recharts';
   import { format } from 'date-fns';

   ❌ WRONG - NEVER DO THIS:
   import { Sun as SunIcon } from 'lucide-react';
   import { Moon as MoonIcon } from 'lucide-react';
   import * as Icons from 'lucide-react';
   
   ABSOLUTELY NO IMPORT ALIASES OR "AS" KEYWORD ALLOWED IN ANY IMPORT STATEMENT.
   Each icon must be imported by its exact name without renaming.
   If you need multiple icons, import them in a single line: import { Icon1, Icon2, Icon3 } from 'lucide-react';

3. The component MUST be exported as:
   export default function LessonComponent()

4. Add "use client" at the VERY TOP.

5. Use Tailwind CSS for ALL styling. No inline styles. No external CSS files.

6. Follow this mandatory structure (this is REQUIRED):
${layout}

7. INTERACTIVE COMPONENT RULE (REQUIRED):
   You MUST create one interactive element that is uniquely designed for the lesson topic.
   - The interactive element must include labeled controls (slider, buttons, color pickers, input).
   - The element must update a visible SVG/HTML visual in REAL TIME.
   - The visual must be clearly visible on a white background (use pastel fills, glows, shadows).
   - Provide textual explanation of how the controls affect the visual.

8. VIVID COLOR RULE (REQUIRED):
   - Use at least 5 distinct pastel shades across the UI (cards, buttons, SVG fills, borders, quiz area).
   - All buttons must use pastel backgrounds (bg-blue-200, bg-pink-200, bg-green-200, bg-yellow-200).
   - No button may use bg-white or text-white on white backgrounds that reduces contrast.

9. ANIMATION VISIBILITY RULE (REQUIRED):
   - Provide at least TWO visible animations (e.g. animate-pulse on a glow + animate-spin on an icon).
   - Use at least one SVG or canvas animation (not just tiny text pulses).
   - Animations should have durations >= 600ms so they are noticeable.

10. ACCESSIBILITY & CLARITY:
   - Add aria-labels for interactive controls.
   - Use readable font sizes and clear labels.

11. STRICT: NO HOVER EFFECTS anywhere.
    - Remove any class that starts with "hover:".

12. SECURITY: NO dangerous code (NO innerHTML, NO dangerouslySetInnerHTML, NO eval).

13. CRITICAL IMPORT RULE - READ CAREFULLY:
    - NEVER use "as" keyword in imports
    - NEVER rename imports with aliases
    - Import each icon/component by its exact original name
    - Example: If you need a Sun icon, write: import { Sun } from 'lucide-react' and use <Sun /> in JSX
    - If the name conflicts with a variable, choose a different variable name, NOT a different import name

14. Include working examples inside the component. Show initial default values and usage hints.

15. Return ONLY the full TSX component inside a Markdown code block. Do not return analysis or any extra text.

${specialHint}

LESSON TOPIC: ${state.lessonTitle || state.prompt}
LESSON AUDIENCE: ${state.audience || "intermediate"}  
LESSON TONE: ${state.tone || "proffesional"}  
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
   5.4 Ensure animations required by the layout are present (if the component removed them, restore at least two visible animations: one larger SVG-based animation + one UI animate-pulse/animate-bounce).
   5.5 Ensure pastel backgrounds exist for at least five UI elements (cards, headers, inputs, quiz area, interactive preview).

6. CRITICAL IMPORT RULE (MANDATORY):
   6.1 NEVER use "as" keyword in any import statement
   6.2 NEVER rename imports with aliases
   6.3 If you see imports like:
       import { Sun as SunIcon } from 'lucide-react'
       
       FIX IT TO:
       import { Sun } from 'lucide-react'
       
       AND UPDATE ALL USAGE IN THE CODE:
       Change <SunIcon /> to <Sun />
       Change SunIcon variable references to Sun
   
   6.4 Each lucide-react icon must be imported with its exact original name
   6.5 If there's a variable name conflict, rename the VARIABLE not the IMPORT
   
   EXAMPLE FIX:
   ❌ WRONG:
   import { Sun as SunIcon, Moon as MoonIcon } from 'lucide-react';
   <SunIcon className="..." />
   
   ✅ CORRECT:
   import { Sun, Moon } from 'lucide-react';
   <Sun className="..." />

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
        clerk_id: state.clerkId,
        created_at: new Date().toISOString(),
        tone:state.tone,
        audience:state.audience
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