// components/survey-builder/utils.ts
import type { BuilderQuestion } from "@/types/survey";

export const getQuestionAnswerOptions = (
  question: BuilderQuestion,
): { label: string; value: string }[] => {
  if (question.type === "SINGLE_SELECT" || question.type === "MULTI_SELECT") {
    return question.options ?? [];
  }

  if (question.type === "RATING") {
    return [1, 2, 3, 4, 5].map((rating) => ({
      label: String(rating),
      value: String(rating),
    }));
  }

  return [];
};

export const createQuestion = (): BuilderQuestion => ({
  id: crypto.randomUUID(),
  type: "TEXT",
  label: "",
  required: false,
});