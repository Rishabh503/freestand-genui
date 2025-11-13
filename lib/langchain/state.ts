import { Annotation } from "@langchain/langgraph";

export const GraphState = Annotation.Root({
  prompt: Annotation<string>,
  lessonTitle: Annotation<string>,
  tsxCode: Annotation<string>,
  validationErrors: Annotation<string[]>,
  attempt: Annotation<number>,
  isValid: Annotation<boolean>,
  lessonId: Annotation<string | null>,
  status: Annotation<string>,
  errorMessage: Annotation<string | null>,
});

export type GraphStateType = typeof GraphState.State;