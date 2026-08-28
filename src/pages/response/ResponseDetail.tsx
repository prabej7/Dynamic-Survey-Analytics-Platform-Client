import { ArrowLeft, CalendarDays, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import api from "@/services/api";
import { handleApiError } from "@/utils/apiError";

interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: Record<string, unknown>;
  submittedAt: string;
}

interface SurveyOption {
  label: string;
  value: string;
}

interface SurveyQuestion {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  options?: SurveyOption[];
}

interface Survey {
  id: string;
  title: string;
  description?: string;
  slug: string;
  schema: {
    questions: SurveyQuestion[];
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const ResponseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [response, setResponse] = useState<SurveyResponse | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchResponse = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const responseResult = await api.get<ApiResponse<SurveyResponse>>(
        `/responses/${id}`,
      );

      const responseData = responseResult.data.data;

      setResponse(responseData);

      const surveyResult = await api.get<ApiResponse<Survey>>(
        `/surveys/${responseData.surveyId}`,
      );

      setSurvey(surveyResult.data.data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponse();
  }, [id]);

  const formatAnswer = (
    answer: unknown,
    question?: SurveyQuestion,
  ): string => {
    if (answer === null || answer === undefined) {
      return "No answer";
    }


    if (Array.isArray(answer)) {
      if (question?.options) {
        return answer
          .map((value) => {
            const option = question.options?.find(
              (item) => item.value === value,
            );

            return option?.label ?? String(value);
          })
          .join(", ");
      }

      return answer.map(String).join(", ");
    }

    if (
      question?.options &&
      typeof answer === "string"
    ) {
      const option = question.options.find(
        (item) => item.value === answer,
      );

      if (option) {
        return option.label;
      }
    }


    if (typeof answer === "object") {
      return JSON.stringify(answer);
    }

    return String(answer);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-7 w-64" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>

          <CardContent className="space-y-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <div className="rounded-full bg-muted p-4">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>

        <h2 className="mt-4 text-lg font-semibold">
          Response not found
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          The response you're looking for doesn't exist.
        </p>

        <Button
          className="mt-5"
          onClick={() => navigate("/responses")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Responses
        </Button>
      </div>
    );
  }

  const questions = survey?.schema?.questions ?? [];

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/responses")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Response
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              View submitted survey answers.
            </p>
          </div>
        </div>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>
            {survey?.title || "Unknown Survey"}
          </CardTitle>

          {survey?.description && (
            <p className="text-sm text-muted-foreground">
              {survey.description}
            </p>
          )}
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">
                Response ID
              </p>

              <code className="mt-1 block w-fit rounded bg-muted px-2 py-1 text-xs">
                {response.id}
              </code>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Submitted
              </p>

              <div className="mt-1 flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />

                {new Date(
                  response.submittedAt,
                ).toLocaleDateString()}{" "}
                at{" "}
                {new Date(
                  response.submittedAt,
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Answers</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {Object.keys(response.answers).length} answers submitted.
              </p>
            </div>

            <Badge variant="secondary">
              {Object.keys(response.answers).length} answers
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="divide-y">
            {questions.length > 0 ? (
              questions.map((question, index) => {
                const answer = response.answers[question.id];

                return (
                  <div
                    key={question.id}
                    className="space-y-2 py-5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}.
                      </span>

                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {question.label}

                          {question.required && (
                            <span className="ml-1 text-destructive">
                              *
                            </span>
                          )}
                        </p>

                        <Badge
                          variant="outline"
                          className="mt-2"
                        >
                          {question.type}
                        </Badge>
                      </div>
                    </div>

                    <div className="ml-6 rounded-lg bg-muted/50 p-4">
                      <p className="whitespace-pre-wrap text-sm">
                        {formatAnswer(answer, question)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Survey questions could not be loaded.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>


      <div>
        <Button variant="outline"  >
          <Link to="/responses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Responses
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ResponseDetail;