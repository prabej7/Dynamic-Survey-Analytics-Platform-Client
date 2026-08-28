import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

import {
  createSurvey,
  updateSurvey,
} from "@/services/surveyApi";

import api from "@/services/api";
import { handleApiError } from "@/utils/apiError";

import type {
  QuestionType,
  SurveyFormData,
  SurveyQuestion,
} from "@/types/survey";

/* =========================================================
 * Types
 * ========================================================= */

interface SurveyResponse {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  isPublished: boolean;
  schema: {
    questions: SurveyQuestion[];
  };
}

interface GetSurveyResponse {
  success: boolean;
  data: SurveyResponse;
}

/* =========================================================
 * Helpers
 * ========================================================= */

const createQuestion = (): SurveyQuestion => ({
  id: crypto.randomUUID(),
  type: "TEXT",
  label: "",
  required: false,
});

/* =========================================================
 * Component
 * ========================================================= */

const SurveyBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [fetchingSurvey, setFetchingSurvey] = useState(false);

  const [form, setForm] = useState<SurveyFormData>({
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

        const response = await api.get<GetSurveyResponse>(
          `/surveys/${id}`,
        );

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
        handleApiError(
          error,
          "Failed to load survey",
        );

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

  const updateForm = (
    updates: Partial<SurveyFormData>,
  ) => {
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
   * Questions
   * ======================================================= */

  const updateQuestion = (
    questionId: string,
    updates: Partial<SurveyQuestion>,
  ) => {
    setForm((current) => ({
      ...current,
      schema: {
        ...current.schema,
        questions:
          current.schema.questions.map(
            (question) =>
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
        questions: [
          ...current.schema.questions,
          createQuestion(),
        ],
      },
    }));
  };

  const removeQuestion = (
    questionId: string,
  ) => {
    setForm((current) => ({
      ...current,
      schema: {
        ...current.schema,
        questions:
          current.schema.questions.filter(
            (question) =>
              question.id !== questionId,
          ),
      },
    }));
  };

  const moveQuestion = (
    questionId: string,
    direction: "up" | "down",
  ) => {
    setForm((current) => {
      const questions = [
        ...current.schema.questions,
      ];

      const index = questions.findIndex(
        (question) =>
          question.id === questionId,
      );

      if (index === -1) {
        return current;
      }

      const newIndex =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        newIndex < 0 ||
        newIndex >= questions.length
      ) {
        return current;
      }

      [
        questions[index],
        questions[newIndex],
      ] = [
        questions[newIndex],
        questions[index],
      ];

      return {
        ...current,
        schema: {
          ...current.schema,
          questions,
        },
      };
    });
  };

  const changeQuestionType = (
    questionId: string,
    type: QuestionType,
  ) => {
    const question =
      form.schema.questions.find(
        (q) => q.id === questionId,
      );

    if (!question) return;

    const updates: Partial<SurveyQuestion> = {
      type,
    };

    if (
      type === "SINGLE_SELECT" ||
      type === "MULTI_SELECT"
    ) {
      updates.options =
        question.options?.length
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

    updateQuestion(
      questionId,
      updates,
    );
  };

  /* =======================================================
   * Options
   * ======================================================= */

  const addOption = (
    questionId: string,
  ) => {
    const question =
      form.schema.questions.find(
        (q) => q.id === questionId,
      );

    if (!question) return;

    const options =
      question.options ?? [];

    const number =
      options.length + 1;

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

  const updateOption = (
    questionId: string,
    index: number,
    label: string,
  ) => {
    const question =
      form.schema.questions.find(
        (q) => q.id === questionId,
      );

    if (!question?.options) return;

    const options = [
      ...question.options,
    ];

    options[index] = {
      label,
      value: label
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-"),
    };

    updateQuestion(questionId, {
      options,
    });
  };

  const removeOption = (
    questionId: string,
    index: number,
  ) => {
    const question =
      form.schema.questions.find(
        (q) => q.id === questionId,
      );

    if (!question?.options) return;

    updateQuestion(questionId, {
      options:
        question.options.filter(
          (_, i) => i !== index,
        ),
    });
  };

  /* =======================================================
   * Save
   * ======================================================= */

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error(
        "Survey title is required",
      );
      return;
    }

    if (!form.slug.trim()) {
      toast.error(
        "Survey slug is required",
      );
      return;
    }

    if (
      form.schema.questions.length === 0
    ) {
      toast.error(
        "Add at least one question",
      );
      return;
    }

    const hasEmptyQuestion =
      form.schema.questions.some(
        (question) =>
          !question.label.trim(),
      );

    if (hasEmptyQuestion) {
      toast.error(
        "Every question must have a label",
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: form.title,
        description:
          form.description || undefined,
        slug: form.slug,
        schema: form.schema,
      };

      const survey = id
        ? await updateSurvey(
            id,
            payload,
          )
        : await createSurvey(payload);

      toast.success(
        id
          ? "Survey updated successfully"
          : "Survey created successfully",
      );

      navigate(
        `/surveys/${survey.id}/edit`,
      );
    } catch (error) {
      handleApiError(
        error,
        "Failed to save survey",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
   * Loading Existing Survey
   * ======================================================= */

  if (fetchingSurvey) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="sticky top-0 z-20 border-b bg-background">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-semibold">
                Edit Survey
              </h1>

              <p className="text-sm text-muted-foreground">
                Loading survey...
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() =>
                navigate("/surveys")
              }
            >
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
              {id
                ? "Edit Survey"
                : "Create Survey"}
            </h1>

            <p className="text-sm text-muted-foreground">
              Build your survey and configure
              its questions.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                navigate("/surveys")
              }
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : id
                  ? "Update Survey"
                  : "Create Survey"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* =================================================
              Builder
          ================================================= */}

          <div className="space-y-6">
            {/* Survey Details */}

            <Card>
              <CardHeader>
                <CardTitle>
                  Survey Details
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>
                    Title
                  </Label>

                  <Input
                    placeholder="Customer Satisfaction Survey"
                    value={form.title}
                    onChange={(e) =>
                      handleTitleChange(
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Description
                  </Label>

                  <Textarea
                    placeholder="Tell users what this survey is about..."
                    value={
                      form.description
                    }
                    onChange={(e) =>
                      updateForm({
                        description:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Slug
                  </Label>

                  <Input
                    value={form.slug}
                    onChange={(e) =>
                      updateForm({
                        slug:
                          e.target.value,
                      })
                    }
                  />

                  <p className="text-xs text-muted-foreground">
                    /survey/
                    {form.slug ||
                      "your-survey"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Questions Header */}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Questions
                </h2>

                <p className="text-sm text-muted-foreground">
                  {
                    form.schema.questions
                      .length
                  }{" "}
                  question
                  {form.schema.questions
                    .length !== 1 &&
                    "s"}
                </p>
              </div>

              <Button
                onClick={addQuestion}
              >
                + Add Question
              </Button>
            </div>

            {/* Empty */}

            {form.schema.questions
              .length === 0 && (
              <Card>
                <CardContent className="flex min-h-48 items-center justify-center">
                  <div className="text-center">
                    <h3 className="font-medium">
                      No questions yet
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Add your first question
                      to start building the
                      survey.
                    </p>

                    <Button
                      className="mt-4"
                      onClick={
                        addQuestion
                      }
                    >
                      Add Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Question Cards */}

            {form.schema.questions.map(
              (
                question,
                index,
              ) => (
                <Card
                  key={
                    question.id
                  }
                >
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">
                      Question{" "}
                      {index + 1}
                    </CardTitle>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={
                          index === 0
                        }
                        onClick={() =>
                          moveQuestion(
                            question.id,
                            "up",
                          )
                        }
                      >
                        ↑
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={
                          index ===
                          form.schema
                            .questions
                            .length -
                            1
                        }
                        onClick={() =>
                          moveQuestion(
                            question.id,
                            "down",
                          )
                        }
                      >
                        ↓
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeQuestion(
                            question.id,
                          )
                        }
                      >
                        ×
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    {/* Question */}

                    <div className="space-y-2">
                      <Label>
                        Question
                      </Label>

                      <Input
                        placeholder="Enter your question..."
                        value={
                          question.label
                        }
                        onChange={(e) =>
                          updateQuestion(
                            question.id,
                            {
                              label:
                                e.target
                                  .value,
                            },
                          )
                        }
                      />
                    </div>

                    {/* Type */}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>
                          Type
                        </Label>

                        <Select
                          value={
                            question.type
                          }
                          onValueChange={(
                            value,
                          ) => {
                            if (
                              value ===
                              null
                            ) {
                              return;
                            }

                            changeQuestionType(
                              question.id,
                              value as QuestionType,
                            );
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="TEXT">
                              Text
                            </SelectItem>

                            <SelectItem value="SINGLE_SELECT">
                              Single Select
                            </SelectItem>

                            <SelectItem value="MULTI_SELECT">
                              Multiple Select
                            </SelectItem>

                            <SelectItem value="RATING">
                              Rating
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Required */}

                      <div className="flex items-center justify-between rounded-lg border px-4">
                        <div>
                          <p className="text-sm font-medium">
                            Required
                          </p>

                          <p className="text-xs text-muted-foreground">
                            Must be answered
                          </p>
                        </div>

                        <Switch
                          checked={
                            question.required
                          }
                          onCheckedChange={(
                            checked,
                          ) =>
                            updateQuestion(
                              question.id,
                              {
                                required:
                                  checked,
                              },
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Options */}

                    {(question.type ===
                      "SINGLE_SELECT" ||
                      question.type ===
                        "MULTI_SELECT") && (
                      <div className="space-y-3">
                        <Label>
                          Options
                        </Label>

                        {question.options?.map(
                          (
                            option,
                            optionIndex,
                          ) => (
                            <div
                              key={
                                optionIndex
                              }
                              className="flex gap-2"
                            >
                              <Input
                                value={
                                  option.label
                                }
                                onChange={(
                                  e,
                                ) =>
                                  updateOption(
                                    question.id,
                                    optionIndex,
                                    e.target
                                      .value,
                                  )
                                }
                              />

                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  removeOption(
                                    question.id,
                                    optionIndex,
                                  )
                                }
                              >
                                ×
                              </Button>
                            </div>
                          ),
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            addOption(
                              question.id,
                            )
                          }
                        >
                          + Add Option
                        </Button>
                      </div>
                    )}

                    {/* Rating */}

                    {question.type ===
                      "RATING" && (
                      <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
                        Users will rate this
                        question from 1 to 5.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ),
            )}
          </div>

          {/* =================================================
              Preview
          ================================================= */}

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Live Preview
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {form.title ||
                        "Untitled Survey"}
                    </h2>

                    {form.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {
                          form.description
                        }
                      </p>
                    )}
                  </div>

                  {form.schema.questions.map(
                    (
                      question,
                      index,
                    ) => (
                      <div
                        key={
                          question.id
                        }
                        className="space-y-2"
                      >
                        <Label>
                          {index + 1}.{" "}
                          {question.label ||
                            "Untitled question"}

                          {question.required && (
                            <span className="text-destructive">
                              {" "}
                              *
                            </span>
                          )}
                        </Label>

                        {question.type ===
                          "TEXT" && (
                          <Input
                            placeholder="Your answer..."
                            disabled
                          />
                        )}

                        {question.type ===
                          "SINGLE_SELECT" && (
                          <div className="space-y-2">
                            {question.options?.map(
                              (
                                option,
                              ) => (
                                <label
                                  key={
                                    option.value
                                  }
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <input
                                    type="radio"
                                    disabled
                                  />

                                  {
                                    option.label
                                  }
                                </label>
                              ),
                            )}
                          </div>
                        )}

                        {question.type ===
                          "MULTI_SELECT" && (
                          <div className="space-y-2">
                            {question.options?.map(
                              (
                                option,
                              ) => (
                                <label
                                  key={
                                    option.value
                                  }
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <input
                                    type="checkbox"
                                    disabled
                                  />

                                  {
                                    option.label
                                  }
                                </label>
                              ),
                            )}
                          </div>
                        )}

                        {question.type ===
                          "RATING" && (
                          <div className="flex gap-2">
                            {[
                              1,
                              2,
                              3,
                              4,
                              5,
                            ].map(
                              (
                                rating,
                              ) => (
                                <Button
                                  key={
                                    rating
                                  }
                                  size="icon"
                                  variant="outline"
                                  disabled
                                >
                                  {
                                    rating
                                  }
                                </Button>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    ),
                  )}

                  {form.schema.questions
                    .length > 0 && (
                    <Button
                      className="w-full"
                      disabled
                    >
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