// components/survey-builder/hooks/useSurveyForm.ts
import api from "@/services/api";
import { createSurvey, updateSurvey } from "@/services/surveyApi";
import type { BuilderFormData, BuilderQuestion, QuestionType, Survey } from "@/types/survey";
import { handleApiError } from "@/utils/apiError";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface GetSurveyResponse {
  success: boolean;
  data: Survey;
}

const createQuestion = (): BuilderQuestion => ({
  id: crypto.randomUUID(),
  type: "TEXT",
  label: "",
  required: false,
});

export const useSurveyForm = (surveyId?: string) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingSurvey, setFetchingSurvey] = useState(false);
  const [form, setForm] = useState<BuilderFormData>({
    title: "",
    description: "",
    slug: "",
    schema: {
      questions: [],
    },
  });

  // Fetch survey
  useEffect(() => {
    if (!surveyId) return;

    const fetchSurvey = async () => {
      try {
        setFetchingSurvey(true);
        const response = await api.get<GetSurveyResponse>(`/surveys/${surveyId}`);
        const survey = response.data.data;

        setForm({
          title: survey.title ?? "",
          description: survey.description ?? "",
          slug: survey.slug ?? "",
          schema: {
            questions: survey.schema?.questions ?? [],
          },
        });
      } catch (error) {
        handleApiError(error, "Failed to load survey");
        navigate("/surveys");
      } finally {
        setFetchingSurvey(false);
      }
    };

    fetchSurvey();
  }, [surveyId, navigate]);

  const updateForm = (updates: Partial<BuilderFormData>) => {
    setForm((current) => ({ ...current, ...updates }));
  };

  const handleTitleChange = (title: string) => {
    updateForm({
      title,
      slug: title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<BuilderQuestion>) => {
    setForm((current) => ({
      ...current,
      schema: {
        ...current.schema,
        questions: current.schema.questions.map((question) =>
          question.id === questionId ? { ...question, ...updates } : question
        ),
      },
    }));
  };

  const addQuestion = () => {
    setForm((current) => ({
      ...current,
      schema: {
        ...current.schema,
        questions: [...current.schema.questions, createQuestion()],
      },
    }));
  };

  const removeQuestion = (questionId: string) => {
    setForm((current) => {
      const questions = current.schema.questions
        .filter((q) => q.id !== questionId)
        .map((q) => {
          if (q.condition?.questionId === questionId) {
            return { ...q, condition: undefined };
          }
          return q;
        });

      return {
        ...current,
        schema: { ...current.schema, questions },
      };
    });
  };

  const moveQuestion = (questionId: string, direction: "up" | "down") => {
    setForm((current) => {
      const questions = [...current.schema.questions];
      const index = questions.findIndex((q) => q.id === questionId);

      if (index === -1) return current;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= questions.length) return current;

      [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];

      const validQuestions = questions.map((q, qIndex) => {
        if (!q.condition) return q;
        const sourceIndex = questions.findIndex((s) => s.id === q.condition?.questionId);
        if (sourceIndex === -1 || sourceIndex >= qIndex) {
          return { ...q, condition: undefined };
        }
        return q;
      });

      return {
        ...current,
        schema: { ...current.schema, questions: validQuestions },
      };
    });
  };

  const changeQuestionType = (questionId: string, type: QuestionType) => {
    const question = form.schema.questions.find((q) => q.id === questionId);
    if (!question) return;

    const updates: Partial<BuilderQuestion> = { type };

    if (type === "SINGLE_SELECT" || type === "MULTI_SELECT") {
      updates.options = question.options?.length
        ? question.options
        : [
            { label: "Option 1", value: "option-1" },
            { label: "Option 2", value: "option-2" },
          ];
    } else {
      updates.options = undefined;
    }

    setForm((current) => {
      const questions = current.schema.questions.map((q) => {
        if (q.id === questionId) return { ...q, ...updates };
        if (q.condition?.questionId === questionId) return { ...q, condition: undefined };
        return q;
      });

      return {
        ...current,
        schema: { ...current.schema, questions },
      };
    });
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Survey title is required");
      return;
    }

    if (!form.slug.trim()) {
      toast.error("Survey slug is required");
      return;
    }

    if (form.schema.questions.length === 0) {
      toast.error("Add at least one question");
      return;
    }

    const hasEmptyQuestion = form.schema.questions.some((q) => !q.label.trim());
    if (hasEmptyQuestion) {
      toast.error("Every question must have a label");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: form.title,
        description: form.description || undefined,
        slug: form.slug,
        schema: {
          questions: form.schema.questions.map((q) => ({
            id: q.id,
            type: q.type,
            label: q.label,
            required: q.required,
            options: q.options,
            condition: q.condition,
          })),
        },
      };

      const survey = surveyId
        ? await updateSurvey(surveyId, payload)
        : await createSurvey(payload);

      toast.success(surveyId ? "Survey updated successfully" : "Survey created successfully");
      navigate(`/surveys/${survey.id}/edit`);
    } catch (error) {
      handleApiError(error, "Failed to save survey");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    fetchingSurvey,
    updateForm,
    handleTitleChange,
    updateQuestion,
    addQuestion,
    removeQuestion,
    moveQuestion,
    changeQuestionType,
    handleSave,
  };
};