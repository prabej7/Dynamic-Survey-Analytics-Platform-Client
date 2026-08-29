// components/survey-builder/hooks/usePreviewAnswers.ts
import type { BuilderQuestion } from "@/types/survey";
import { useEffect, useState } from "react";

export const usePreviewAnswers = (questions: BuilderQuestion[]) => {
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, unknown>>({});

  const updatePreviewAnswer = (questionId: string, value: unknown) => {
    setPreviewAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const resetPreview = () => {
    setPreviewAnswers({});
  };

  const shouldShowQuestion = (question: BuilderQuestion) => {
    if (!question.condition) return true;

    const { questionId, operator, value } = question.condition;
    const answer = previewAnswers[questionId];

    if (Array.isArray(answer)) {
      const containsValue = answer.includes(value);
      switch (operator) {
        case "equals":
          return containsValue;
        case "not_equals":
          return !containsValue;
        case "contains":
          return answer.some((v: string) => v.includes(value));
        default:
          return false;
      }
    }

    const answerValue = answer === undefined || answer === null ? "" : String(answer);

    switch (operator) {
      case "equals":
        return answerValue === value;
      case "not_equals":
        return answerValue !== value;
      case "contains":
        return answerValue.includes(value);
      default:
        return false;
    }
  };

  // Reset when questions change
  useEffect(() => {
    resetPreview();
  }, [questions]);

  return {
    previewAnswers,
    updatePreviewAnswer,
    resetPreview,
    shouldShowQuestion,
  };
};