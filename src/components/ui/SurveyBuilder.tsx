// SurveyBuilder.tsx
import { Copy, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createSurvey, updateSurvey } from "@/services/surveyApi";

import api from "@/services/api";
import { handleApiError } from "@/utils/apiError";

import type {
  BuilderFormData,
  BuilderQuestion,
  ConditionalOperator,
  QuestionType,
  Survey
} from "@/types/survey";


interface GetSurveyResponse {
  success: boolean;
  data: Survey;
}

/* =========================================================
 * Helpers
 * ========================================================= */

const createQuestion = (): BuilderQuestion => ({
  id: crypto.randomUUID(),
  type: "TEXT",
  label: "",
  required: false,
});

const getQuestionAnswerOptions = (
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

/* =========================================================
 * Component
 * ========================================================= */

const SurveyBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [fetchingSurvey, setFetchingSurvey] = useState(false);

  // State for preview answers
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, unknown>>(
    {},
  );

  const [form, setForm] = useState<BuilderFormData>({
    title: "",
    description: "",
    slug: "",
    schema: {
      questions: [],
    },
  });

  /* =======================================================
   * Fetch Existing Survey
   * ======================================================= */

  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchSurvey = async () => {
      try {
        setFetchingSurvey(true);

        const response = await api.get<GetSurveyResponse>(`/surveys/${id}`);

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
  }, [id, navigate]);

  /* =======================================================
   * Survey Details
   * ======================================================= */

  const updateForm = (updates: Partial<BuilderFormData>) => {
    setForm((current) => ({
      ...current,
      ...updates,
    }));
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

  /* =======================================================
   * Copy Survey Link
   * ======================================================= */

  const handleCopyLink = async () => {
    if (!form.slug) {
      toast.error("Survey link is not available");
      return;
    }

    const surveyUrl = `${window.location.origin}/survey/${form.slug}`;

    try {
      await navigator.clipboard.writeText(surveyUrl);

      toast.success("Survey link copied to clipboard");
    } catch (error) {
      console.error("Failed to copy survey link:", error);

      toast.error("Failed to copy survey link");
    }
  };

  /* =======================================================
   * Questions
   * ======================================================= */

  const updateQuestion = (
    questionId: string,
    updates: Partial<BuilderQuestion>,
  ) => {
    setForm((current) => ({
      ...current,
      schema: {
        ...current.schema,
        questions: current.schema.questions.map((question) =>
          question.id === questionId
            ? {
                ...question,
                ...updates,
              }
            : question,
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
        .filter((question) => question.id !== questionId)
        .map((question) => {
          if (question.condition?.questionId === questionId) {
            return {
              ...question,
              condition: undefined,
            };
          }

          return question;
        });

      return {
        ...current,
        schema: {
          ...current.schema,
          questions,
        },
      };
    });
  };

  const moveQuestion = (questionId: string, direction: "up" | "down") => {
    setForm((current) => {
      const questions = [...current.schema.questions];

      const index = questions.findIndex(
        (question) => question.id === questionId,
      );

      if (index === -1) {
        return current;
      }

      const newIndex = direction === "up" ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= questions.length) {
        return current;
      }

      [questions[index], questions[newIndex]] = [
        questions[newIndex],
        questions[index],
      ];

      const validQuestions = questions.map((question, questionIndex) => {
        if (!question.condition) {
          return question;
        }

        const sourceIndex = questions.findIndex(
          (source) => source.id === question.condition?.questionId,
        );

        if (sourceIndex === -1 || sourceIndex >= questionIndex) {
          return {
            ...question,
            condition: undefined,
          };
        }

        return question;
      });

      return {
        ...current,
        schema: {
          ...current.schema,
          questions: validQuestions,
        },
      };
    });
  };

  const changeQuestionType = (questionId: string, type: QuestionType) => {
    const question = form.schema.questions.find((q) => q.id === questionId);

    if (!question) {
      return;
    }

    const updates: Partial<BuilderQuestion> = {
      type,
    };

    if (type === "SINGLE_SELECT" || type === "MULTI_SELECT") {
      updates.options = question.options?.length
        ? question.options
        : [
            {
              label: "Option 1",
              value: "option-1",
            },
            {
              label: "Option 2",
              value: "option-2",
            },
          ];
    } else {
      updates.options = undefined;
    }

    setForm((current) => {
      const questions = current.schema.questions.map((currentQuestion) => {
        if (currentQuestion.id === questionId) {
          return {
            ...currentQuestion,
            ...updates,
          };
        }

        if (currentQuestion.condition?.questionId === questionId) {
          return {
            ...currentQuestion,
            condition: undefined,
          };
        }

        return currentQuestion;
      });

      return {
        ...current,
        schema: {
          ...current.schema,
          questions,
        },
      };
    });
  };

  /* =======================================================
   * Options
   * ======================================================= */

  const addOption = (questionId: string) => {
    const question = form.schema.questions.find((q) => q.id === questionId);

    if (!question) {
      return;
    }

    const options = question.options ?? [];

    const number = options.length + 1;

    updateQuestion(questionId, {
      options: [
        ...options,
        {
          label: `Option ${number}`,
          value: `option-${number}`,
        },
      ],
    });
  };

  const updateOption = (questionId: string, index: number, label: string) => {
    const question = form.schema.questions.find((q) => q.id === questionId);

    if (!question?.options) {
      return;
    }

    const oldValue = question.options[index]?.value;

    const newValue = label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const options = [...question.options];

    options[index] = {
      label,
      value: newValue,
    };

    setForm((current) => ({
      ...current,
      schema: {
        ...current.schema,
        questions: current.schema.questions.map((currentQuestion) => {
          if (currentQuestion.id === questionId) {
            return {
              ...currentQuestion,
              options,
            };
          }

          if (
            currentQuestion.condition?.questionId === questionId &&
            currentQuestion.condition.value === oldValue
          ) {
            return {
              ...currentQuestion,
              condition: {
                ...currentQuestion.condition,
                value: newValue,
              },
            };
          }

          return currentQuestion;
        }),
      },
    }));
  };

  const removeOption = (questionId: string, index: number) => {
    const question = form.schema.questions.find((q) => q.id === questionId);

    if (!question?.options) {
      return;
    }

    const removedValue = question.options[index]?.value;

    const options = question.options.filter((_, i) => i !== index);

    setForm((current) => ({
      ...current,
      schema: {
        ...current.schema,
        questions: current.schema.questions.map((currentQuestion) => {
          if (currentQuestion.id === questionId) {
            return {
              ...currentQuestion,
              options,
            };
          }

          if (
            currentQuestion.condition?.questionId === questionId &&
            currentQuestion.condition.value === removedValue
          ) {
            return {
              ...currentQuestion,
              condition: undefined,
            };
          }

          return currentQuestion;
        }),
      },
    }));
  };

  /* =======================================================
   * Conditional Logic
   * ======================================================= */

  const getAvailableConditionQuestions = (questionIndex: number) => {
    return form.schema.questions.slice(0, questionIndex).filter((question) => {
      return (
        question.type === "SINGLE_SELECT" ||
        question.type === "MULTI_SELECT" ||
        question.type === "RATING"
      );
    });
  };

  const setQuestionCondition = (
    questionId: string,
    sourceQuestionId: string | null,
  ) => {
    if (!sourceQuestionId) {
      updateQuestion(questionId, {
        condition: undefined,
      });

      return;
    }

    const sourceQuestion = form.schema.questions.find(
      (question) => question.id === sourceQuestionId,
    );

    if (!sourceQuestion) {
      return;
    }

    const options = getQuestionAnswerOptions(sourceQuestion);

    if (options.length === 0) {
      updateQuestion(questionId, {
        condition: undefined,
      });

      return;
    }

    updateQuestion(questionId, {
      condition: {
        questionId: sourceQuestionId,
        operator: "equals",
        value: options[0].value,
      },
    });
  };

  const updateConditionValue = (questionId: string, value: string | null) => {
    if (!value) {
      return;
    }

    const question = form.schema.questions.find((q) => q.id === questionId);

    if (!question?.condition) {
      return;
    }

    updateQuestion(questionId, {
      condition: {
        ...question.condition,
        value,
      },
    });
  };

  const updateConditionOperator = (
    questionId: string,
    operator: string | null,
  ) => {
    // Only allow operators that the API supports
    if (
      !operator ||
      (operator !== "equals" &&
        operator !== "not_equals" &&
        operator !== "contains")
    ) {
      return;
    }

    const question = form.schema.questions.find((q) => q.id === questionId);

    if (!question?.condition) {
      return;
    }

    updateQuestion(questionId, {
      condition: {
        ...question.condition,
        operator: operator as ConditionalOperator,
      },
    });
  };

  /* =======================================================
   * Condition Validation
   * ======================================================= */

  const validateConditions = () => {
    for (let index = 0; index < form.schema.questions.length; index++) {
      const question = form.schema.questions[index];

      if (!question.condition) {
        continue;
      }

      const sourceIndex = form.schema.questions.findIndex(
        (source) => source.id === question.condition?.questionId,
      );

      if (sourceIndex === -1 || sourceIndex >= index) {
        toast.error(`Invalid condition on Question ${index + 1}`);

        return false;
      }

      const sourceQuestion = form.schema.questions[sourceIndex];

      const options = getQuestionAnswerOptions(sourceQuestion);

      const validValue = options.some(
        (option) => option.value === question.condition?.value,
      );

      if (!validValue) {
        toast.error(`Invalid condition value on Question ${index + 1}`);

        return false;
      }
    }

    return true;
  };

  /* =======================================================
   * Save
   * ======================================================= */

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

    const hasEmptyQuestion = form.schema.questions.some(
      (question) => !question.label.trim(),
    );

    if (hasEmptyQuestion) {
      toast.error("Every question must have a label");
      return;
    }

    if (!validateConditions()) {
      return;
    }

    try {
      setLoading(true);

      // Create a clean payload with proper types
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

      const survey = id
        ? await updateSurvey(id, payload)
        : await createSurvey(payload);

      toast.success(
        id ? "Survey updated successfully" : "Survey created successfully",
      );

      navigate(`/surveys/${survey.id}/edit`);
    } catch (error) {
      handleApiError(error, "Failed to save survey");
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
   * Conditional Preview Helper
   * ======================================================= */

  const shouldShowQuestion = (question: BuilderQuestion) => {
    if (!question.condition) {
      return true;
    }

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

    const answerValue =
      answer === undefined || answer === null ? "" : String(answer);

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

  const updatePreviewAnswer = (questionId: string, value: unknown) => {
    setPreviewAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Reset preview answers when questions change
  useEffect(() => {
    setPreviewAnswers({});
  }, [form.schema.questions]);

  /* =======================================================
   * Loading Existing Survey
   * ======================================================= */

  if (fetchingSurvey) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="sticky top-0 z-20 border-b bg-background">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-semibold">Edit Survey</h1>

              <p className="text-sm text-muted-foreground">Loading survey...</p>
            </div>

            <Button variant="outline" onClick={() => navigate("/surveys")}>
              Cancel
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <Card>
                <CardContent className="space-y-5 p-6">
                  <div className="h-10 animate-pulse rounded-md bg-muted" />
                  <div className="h-24 animate-pulse rounded-md bg-muted" />
                  <div className="h-10 animate-pulse rounded-md bg-muted" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-6 p-6">
                  <div className="h-20 animate-pulse rounded-md bg-muted" />
                  <div className="h-20 animate-pulse rounded-md bg-muted" />
                  <div className="h-20 animate-pulse rounded-md bg-muted" />
                </CardContent>
              </Card>
            </div>

            <aside className="hidden lg:block">
              <Card>
                <CardContent className="p-6">
                  <div className="h-80 animate-pulse rounded-md bg-muted" />
                </CardContent>
              </Card>
            </aside>
          </div>
        </main>
      </div>
    );
  }

  /* =======================================================
   * Render
   * ======================================================= */

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}

      <header className="sticky top-0 z-20 border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">
              {id ? "Edit Survey" : "Create Survey"}
            </h1>

            <p className="text-sm text-muted-foreground">
              Build your survey and configure its questions.
            </p>
          </div>

          <div className="flex gap-2">
            {/* Copy Link */}

            {id && form.slug && (
              <Button variant="outline" onClick={handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
            )}

            {/* Cancel */}

            <Button variant="outline" onClick={() => navigate("/surveys")}>
              Cancel
            </Button>

            {/* Save */}

            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : id ? "Update Survey" : "Create Survey"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* =================================================
              Builder
          ================================================= */}

          <div className="space-y-6">
            {/* Survey Details */}

            <Card>
              <CardHeader>
                <CardTitle>Survey Details</CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Title</Label>

                  <Input
                    placeholder="Customer Satisfaction Survey"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>

                  <Textarea
                    placeholder="Tell users what this survey is about..."
                    value={form.description}
                    onChange={(e) =>
                      updateForm({
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Slug</Label>

                  <Input
                    value={form.slug}
                    onChange={(e) =>
                      updateForm({
                        slug: e.target.value,
                      })
                    }
                  />

                  <p className="text-xs text-muted-foreground">
                    /survey/
                    {form.slug || "your-survey"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Questions Header */}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Questions</h2>

                <p className="text-sm text-muted-foreground">
                  {form.schema.questions.length} question
                  {form.schema.questions.length !== 1 && "s"}
                </p>
              </div>

              <Button onClick={addQuestion}>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>

            {/* Empty */}

            {form.schema.questions.length === 0 && (
              <Card>
                <CardContent className="flex min-h-48 items-center justify-center">
                  <div className="text-center">
                    <h3 className="font-medium">No questions yet</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Add your first question to start building the survey.
                    </p>

                    <Button className="mt-4" onClick={addQuestion}>
                      Add Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Question Cards */}

            {form.schema.questions.map((question, index) => {
              const availableConditionQuestions =
                getAvailableConditionQuestions(index);

              const conditionSource = question.condition
                ? form.schema.questions.find(
                    (source) => source.id === question.condition?.questionId,
                  )
                : undefined;

              const conditionOptions = conditionSource
                ? getQuestionAnswerOptions(conditionSource)
                : [];

              return (
                <Card key={question.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">
                      Question {index + 1}
                    </CardTitle>

                    <div className="flex gap-1">
                      {/* Move Up */}

                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={index === 0}
                        onClick={() => moveQuestion(question.id, "up")}
                      >
                        ↑
                      </Button>

                      {/* Move Down */}

                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={index === form.schema.questions.length - 1}
                        onClick={() => moveQuestion(question.id, "down")}
                      >
                        ↓
                      </Button>

                      {/* Delete */}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    {/* Question */}

                    <div className="space-y-2">
                      <Label>Question</Label>

                      <Input
                        placeholder="Enter your question..."
                        value={question.label}
                        onChange={(e) =>
                          updateQuestion(question.id, {
                            label: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Type */}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Type</Label>

                        <Select
                          value={question.type}
                          onValueChange={(value) => {
                            if (value === null) return;
                            changeQuestionType(
                              question.id,
                              value as QuestionType,
                            );
                            setPreviewAnswers({});
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="TEXT">Text</SelectItem>

                            <SelectItem value="SINGLE_SELECT">
                              Single Select
                            </SelectItem>

                            <SelectItem value="MULTI_SELECT">
                              Multiple Select
                            </SelectItem>

                            <SelectItem value="RATING">Rating</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Required */}

                      <div className="flex items-center justify-between rounded-lg border px-4">
                        <div>
                          <p className="text-sm font-medium">Required</p>

                          <p className="text-xs text-muted-foreground">
                            Must be answered
                          </p>
                        </div>

                        <Switch
                          checked={question.required}
                          onCheckedChange={(checked) =>
                            updateQuestion(question.id, {
                              required: checked,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* =================================================
                        Conditional Logic
                    ================================================= */}

                    {availableConditionQuestions.length > 0 && (
                      <div className="rounded-lg border bg-muted/30 p-4">
                        <div className="mb-4">
                          <h3 className="text-sm font-medium">
                            Conditional Logic
                          </h3>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Show this question only when a previous question
                            matches a specific answer.
                          </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          {/* Source Question */}

                          <div className="space-y-2 sm:col-span-1">
                            <Label className="text-xs">Show when</Label>

                            <Select
                              value={question.condition?.value ?? "none"}
                              onValueChange={(value) => {
                                if (value === null) return;
                                if (value === "none") {
                                  setQuestionCondition(question.id, null);
                                  setPreviewAnswers({});
                                  return;
                                }
                                setQuestionCondition(question.id, value);
                                setPreviewAnswers({});
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Always show" />
                              </SelectTrigger>

                              <SelectContent>
                                <SelectItem value="none">
                                  Always show
                                </SelectItem>

                                {availableConditionQuestions.map(
                                  (sourceQuestion, sourceIndex) => (
                                    <SelectItem
                                      key={sourceQuestion.id}
                                      value={sourceQuestion.id}
                                    >
                                      Question {sourceIndex + 1} —{" "}
                                      {sourceQuestion.label || "Untitled"}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Operator */}
                          {question.condition && (
                            <div className="space-y-2">
                              <Label className="text-xs">Condition</Label>

                              <Select
                                value={question.condition.operator}
                                onValueChange={(value) =>
                                  updateConditionOperator(question.id, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                  <SelectItem value="equals">is</SelectItem>
                                  <SelectItem value="not_equals">
                                    is not
                                  </SelectItem>
                                  <SelectItem value="contains">
                                    contains
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Value */}

                          {question.condition &&
                            conditionOptions.length > 0 && (
                              <div className="space-y-2">
                                <Label className="text-xs">Answer</Label>

                                <Select
                                  value={question.condition.value}
                                  onValueChange={(value) =>
                                    updateConditionValue(question.id, value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select answer" />
                                  </SelectTrigger>

                                  <SelectContent>
                                    {conditionOptions.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                        </div>
                        {/* Human readable condition */}
                        {question.condition && conditionSource && (
                          <div className="mt-4 rounded-md bg-background px-3 py-2 text-xs">
                            <span className="text-muted-foreground">
                              This question will be shown when{" "}
                            </span>

                            <span className="font-medium">
                              Question{" "}
                              {form.schema.questions.findIndex(
                                (q) => q.id === conditionSource.id,
                              ) + 1}
                            </span>

                            <span className="text-muted-foreground">
                              {" "}
                              "{conditionSource.label ||
                                "Untitled question"}"{" "}
                              {question.condition.operator === "equals"
                                ? "is"
                                : question.condition.operator === "not_equals"
                                  ? "is not"
                                  : "contains"}{" "}
                            </span>

                            <span className="font-medium">
                              {conditionOptions.find(
                                (option) =>
                                  option.value === question.condition?.value,
                              )?.label ?? question.condition.value}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Options */}

                    {(question.type === "SINGLE_SELECT" ||
                      question.type === "MULTI_SELECT") && (
                      <div className="space-y-3">
                        <Label>Options</Label>

                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2">
                            <Input
                              value={option.label}
                              onChange={(e) =>
                                updateOption(
                                  question.id,
                                  optionIndex,
                                  e.target.value,
                                )
                              }
                            />

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                removeOption(question.id, optionIndex)
                              }
                            >
                              ×
                            </Button>
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(question.id)}
                        >
                          + Add Option
                        </Button>
                      </div>
                    )}

                    {/* Rating */}

                    {question.type === "RATING" && (
                      <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
                        Users will rate this question from 1 to 5.
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* =================================================
              Preview - WITH WORKING CONDITIONAL LOGIC
          ================================================= */}

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Try answering questions to see conditional logic in action
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Survey Header */}

                  <div>
                    <h2 className="text-xl font-semibold">
                      {form.title || "Untitled Survey"}
                    </h2>

                    {form.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {form.description}
                      </p>
                    )}
                  </div>

                  {/* Preview note */}

                  <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                    Conditional questions are shown or hidden based on the
                    selected answers.
                  </div>

                  {/* Questions - WITH WORKING CONDITIONAL LOGIC */}

                  {form.schema.questions.map((question, index) => {
                    const isVisible = shouldShowQuestion(question);
                    const hasCondition = !!question.condition;

                    // If question has a condition and is NOT visible, show a placeholder
                    if (hasCondition && !isVisible) {
                      return (
                        <div
                          key={question.id}
                          className="space-y-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10 p-4"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              Question {index + 1}
                            </span>
                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60">
                              Conditional - Hidden
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground/60">
                            {question.label || "Untitled question"}
                          </p>
                          <p className="text-xs text-muted-foreground/50">
                            This question is hidden because the condition is not
                            met.
                          </p>
                        </div>
                      );
                    }

                    // Render visible question
                    return (
                      <div key={question.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>
                            {index + 1}. {question.label || "Untitled question"}
                            {question.required && (
                              <span className="text-destructive"> *</span>
                            )}
                          </Label>
                          {hasCondition && isVisible && (
                            <span className="text-[10px] font-medium uppercase tracking-wide text-green-600 bg-green-50 px-2 py-0.5 rounded">
                              ✓ Visible
                            </span>
                          )}
                        </div>

                        {/* Text */}

                        {question.type === "TEXT" && (
                          <Input
                            placeholder="Your answer..."
                            value={
                              (previewAnswers[question.id] as string) || ""
                            }
                            onChange={(e) => {
                              updatePreviewAnswer(question.id, e.target.value);
                            }}
                          />
                        )}

                        {/* Single Select */}

                        {question.type === "SINGLE_SELECT" && (
                          <div className="space-y-2">
                            {question.options?.map((option) => (
                              <label
                                key={option.value}
                                className={`flex items-center gap-2 text-sm p-2 rounded-md border transition-colors ${
                                  previewAnswers[question.id] === option.value
                                    ? "border-primary bg-primary/5"
                                    : "border-transparent hover:bg-muted/50"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`preview-${question.id}`}
                                  value={option.value}
                                  checked={
                                    previewAnswers[question.id] === option.value
                                  }
                                  onChange={(e) => {
                                    updatePreviewAnswer(
                                      question.id,
                                      e.target.value,
                                    );
                                  }}
                                />
                                {option.label}
                              </label>
                            ))}
                          </div>
                        )}

                        {/* Multiple Select */}

                        {question.type === "MULTI_SELECT" && (
                          <div className="space-y-2">
                            {question.options?.map((option) => {
                              const currentAnswers =
                                (previewAnswers[question.id] as string[]) || [];
                              const checked = currentAnswers.includes(
                                option.value,
                              );

                              return (
                                <label
                                  key={option.value}
                                  className={`flex items-center gap-2 text-sm p-2 rounded-md border transition-colors ${
                                    checked
                                      ? "border-primary bg-primary/5"
                                      : "border-transparent hover:bg-muted/50"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                      const newAnswers = e.target.checked
                                        ? [...currentAnswers, option.value]
                                        : currentAnswers.filter(
                                            (v) => v !== option.value,
                                          );
                                      updatePreviewAnswer(
                                        question.id,
                                        newAnswers,
                                      );
                                    }}
                                  />
                                  {option.label}
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* Rating */}

                        {question.type === "RATING" && (
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <Button
                                key={rating}
                                size="icon"
                                variant={
                                  previewAnswers[question.id] === rating
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => {
                                  updatePreviewAnswer(question.id, rating);
                                }}
                              >
                                {rating}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Show count of visible vs total questions */}

                  {form.schema.questions.length > 0 && (
                    <div className="text-xs text-muted-foreground border-t pt-4">
                      Showing
                      {
                        form.schema.questions.filter((q) =>
                          shouldShowQuestion(q),
                        ).length
                      }
                      of {form.schema.questions.length} questions
                      {form.schema.questions.some((q) => q.condition) && (
                        <span className="ml-2">
                          (
                          {
                            form.schema.questions.filter((q) => q.condition)
                              .length
                          }{" "}
                          conditional question
                          {form.schema.questions.filter((q) => q.condition)
                            .length !== 1 && "s"}
                          )
                        </span>
                      )}
                    </div>
                  )}

                  {/* Reset Preview Button */}

                  {form.schema.questions.length > 0 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setPreviewAnswers({})}
                    >
                      Reset Preview
                    </Button>
                  )}

                  {/* Submit */}

                  {form.schema.questions.length > 0 && (
                    <Button className="w-full" disabled>
                      Submit
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default SurveyBuilder;
