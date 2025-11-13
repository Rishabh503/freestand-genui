// lib/langchain/graph.ts
import { StateGraph } from "@langchain/langgraph";
import { GraphState } from "./state";
import {
  analyzePrompt,
  generateUI,
  validateCode,
  fixErrors,
  saveLesson,
  shouldRetry,
  finalizeState,
} from "./nodes";

export function createLessonGeneratorGraph() {
  const workflow = new StateGraph(GraphState)
    .addNode("analyze", analyzePrompt)
    .addNode("generate", generateUI)
    .addNode("validate", validateCode)
    .addNode("fix", fixErrors)
    .addNode("save", saveLesson)
    .addNode("finalize", finalizeState)
    .addEdge("__start__", "analyze")
    .addConditionalEdges("analyze", (state) => {
      return state.status === "rejected" ? "finalize" : "generate";
    })
    .addEdge("generate", "validate")
    .addConditionalEdges("validate", shouldRetry, {
      fix: "fix",
      save: "save",
      end: "finalize",
    })
    .addEdge("fix", "validate")
    .addEdge("save", "finalize")
    .addEdge("finalize", "__end__");

  return workflow.compile();
}

export async function runLessonGenerator(prompt: string) {
  const graph = createLessonGeneratorGraph();

  const initialState = {
    prompt,
    lessonTitle: "",
    tsxCode: "",
    validationErrors: [],
    attempt: 0,
    isValid: false,
    lessonId: null,
    status: "initialized",
    errorMessage: null,
  };

  const result = await graph.invoke(initialState);
  return result;
}