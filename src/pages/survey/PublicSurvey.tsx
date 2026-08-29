import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

import { Checkbox } from "@/components/ui/checkbox";

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import {
  getPublicSurvey,
} from "@/services/surveyApi";

import {
  submitResponse,
} from "@/services/responseApi";

import {
  handleApiError,
} from "@/utils/apiError";

import type {
  Survey,
  SurveyQuestion,
} from "@/types/survey";

const PublicSurvey = () => {
  const { slug } = useParams<{ slug: string }>();

  const [survey, setSurvey] =
    useState<Survey | null>(null);

  const [answers, setAnswers] =
    useState<Record<string, unknown>>({});

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  useEffect(() => {
    const loadSurvey = async () => {
      if (!slug) return;

      try {
        setLoading(true);

        const result =
          await getPublicSurvey(slug);

        setSurvey(result);
      } catch (error) {
        handleApiError(
          error,
          "Unable to load survey"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSurvey();
  }, [slug]);

  const setAnswer = (
    questionId: string,
    value: unknown
  ) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
  };

  const toggleMultiSelect = (
    questionId: string,
    value: string
  ) => {
    const current =
      (answers[questionId] as string[]) || [];

    const exists = current.includes(value);

    setAnswer(
      questionId,
      exists
        ? current.filter(
            (item) => item !== value
          )
        : [...current, value]
    );
  };

  // FIXED: shouldShowQuestion function
  const shouldShowQuestion = (
    question: SurveyQuestion
  ) => {
    if (!question.condition) {
      return true;
    }

    const {
      questionId,
      operator,
      value,
    } = question.condition;

    const answer = answers[questionId];

    // If the source question hasn't been answered yet, show the question
    // This allows the question to be visible initially
    if (answer === undefined || answer === null) {
      return false;
    }

    // Handle multi-select answers
    if (Array.isArray(answer)) {
      switch (operator) {
        case "equals":
          return answer.includes(value);
        case "not_equals":
          return !answer.includes(value);
        case "contains":
          return answer.some((v: string) => 
            v.toLowerCase().includes(value.toLowerCase())
          );
        default:
          return false;
      }
    }

    // Handle single value answers
    const answerString = String(answer);

    switch (operator) {
      case "equals":
        return answerString === value;

      case "not_equals":
        return answerString !== value;

      case "contains":
        return answerString
          .toLowerCase()
          .includes(value.toLowerCase());

      default:
        return true;
    }
  };

  const validateAnswers = () => {
    if (!survey) {
      return false;
    }

    for (const question of survey.schema
      .questions) {
      if (!shouldShowQuestion(question)) {
        continue;
      }

      if (!question.required) {
        continue;
      }

      const answer = answers[question.id];

      if (
        answer === undefined ||
        answer === null ||
        answer === "" ||
        (Array.isArray(answer) &&
          answer.length === 0)
      ) {
        toast.error(
          `"${question.label}" is required`
        );

        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!survey) return;

    if (!validateAnswers()) {
      return;
    }

    try {
      setSubmitting(true);

      await submitResponse({
        surveyId: survey.id,
        answers,
      });

      setSubmitted(true);

      toast.success(
        "Response submitted successfully!"
      );
    } catch (error) {
      handleApiError(
        error,
        "Failed to submit response"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />

          <p className="mt-4 text-sm text-muted-foreground">
            Loading survey...
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="py-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
              ✓
            </div>

            <h1 className="mt-6 text-2xl font-semibold">
              Thank you!
            </h1>

            <p className="mt-2 text-muted-foreground">
              Your response has been submitted
              successfully.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            Survey not found
          </h1>

          <p className="mt-2 text-muted-foreground">
            This survey may no longer be available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-2xl">
              {survey.title}
            </CardTitle>

            {survey.description && (
              <p className="text-sm leading-6 text-muted-foreground">
                {survey.description}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-8 pt-8">
            {survey.schema.questions.map(
              (question, index) => {
                if (
                  !shouldShowQuestion(question)
                ) {
                  return null;
                }

                return (
                  <Question
                    key={question.id}
                    question={question}
                    index={index}
                    answer={answers[question.id]}
                    onChange={(value) =>
                      setAnswer(
                        question.id,
                        value
                      )
                    }
                    onToggleMultiSelect={
                      toggleMultiSelect
                    }
                  />
                );
              }
            )}

            <div className="border-t pt-6">
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Response"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Your response is securely stored.
        </p>
      </div>
    </div>
  );
};

export default PublicSurvey;

interface QuestionProps {
  question: SurveyQuestion;
  index: number;
  answer: unknown;
  onChange: (value: unknown) => void;
  onToggleMultiSelect: (
    questionId: string,
    value: string
  ) => void;
}

const Question = ({
  question,
  index,
  answer,
  onChange,
  onToggleMultiSelect,
}: QuestionProps) => {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-medium">
          {index + 1}. {question.label}

          {question.required && (
            <span className="ml-1 text-destructive">
              *
            </span>
          )}
        </Label>
      </div>

      {question.type === "TEXT" && (
        <Input
          value={(answer as string) || ""}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder="Your answer..."
        />
      )}

      {question.type ===
        "SINGLE_SELECT" && (
        <RadioGroup
          value={(answer as string) || ""}
          onValueChange={onChange}
          className="space-y-3"
        >
          {question.options?.map(
            (option) => (
              <div
                key={option.value}
                className="flex items-center space-x-3"
              >
                <RadioGroupItem
                  value={option.value}
                  id={`${question.id}-${option.value}`}
                />

                <Label
                  htmlFor={`${question.id}-${option.value}`}
                  className="cursor-pointer font-normal"
                >
                  {option.label}
                </Label>
              </div>
            )
          )}
        </RadioGroup>
      )}

      {question.type ===
        "MULTI_SELECT" && (
        <div className="space-y-3">
          {question.options?.map(
            (option) => {
              const selected =
                Array.isArray(answer) &&
                answer.includes(
                  option.value
                );

              return (
                <div
                  key={option.value}
                  className="flex items-center space-x-3"
                >
                  <Checkbox
                    id={`${question.id}-${option.value}`}
                    checked={selected}
                    onCheckedChange={() =>
                      onToggleMultiSelect(
                        question.id,
                        option.value
                      )
                    }
                  />

                  <Label
                    htmlFor={`${question.id}-${option.value}`}
                    className="cursor-pointer font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              );
            }
          )}
        </div>
      )}

      {question.type === "RATING" && (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(
            (rating) => (
              <Button
                key={rating}
                type="button"
                variant={
                  answer === rating
                    ? "default"
                    : "outline"
                }
                className="h-11 w-11"
                onClick={() =>
                  onChange(rating)
                }
              >
                {rating}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
};