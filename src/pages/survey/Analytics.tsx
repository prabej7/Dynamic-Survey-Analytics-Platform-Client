import { ArrowLeft, BarChart3, CalendarDays, FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import api from "@/services/api";
import { handleApiError } from "@/utils/apiError";

interface SelectOption {
  value: string;
  label: string;
  count: number;
  percentage: number;
}

interface RatingDistribution {
  value: number;
  count: number;
  percentage: number;
}

interface QuestionAnalytics {
  questionId: string;
  label: string;
  type: string;
  totalAnswers: number;

  answers?: unknown[];


  options?: SelectOption[];

  average?: number;
  distribution?: RatingDistribution[];
}

interface SurveyAnalytics {
  survey: {
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
  };

  overview: {
    totalResponses: number;
    responsesToday: number;
    responsesThisWeek: number;
    responsesThisMonth: number;
  };

  questions: QuestionAnalytics[];

  responseTrend: {
    date: string;
    responses: number;
  }[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const SurveyAnalytics = () => {
  const { id } = useParams<{ id: string }>();

  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);

  const [loading, setLoading] = useState(true);


  const fetchAnalytics = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const response = await api.get<ApiResponse<SurveyAnalytics>>(
        `/surveys/${id}/analytics`,
      );

      setAnalytics(response.data.data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [id]);



  const maxTrendResponses = useMemo(() => {
    if (!analytics?.responseTrend?.length) {
      return 1;
    }

    return Math.max(
      ...analytics.responseTrend.map((item) => item.responses),
      1,
    );
  }, [analytics]);

  

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-3 h-8 w-20" />
                <Skeleton className="mt-2 h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>

          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>

              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  

  if (!analytics) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <div className="rounded-full bg-muted p-4">
          <BarChart3 className="h-6 w-6 text-muted-foreground" />
        </div>

        <h2 className="mt-4 text-lg font-semibold">Analytics not available</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          We couldn't load analytics for this survey.
        </p>

        <Button className="mt-5">
          <Link to="/surveys">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Surveys
          </Link>
        </Button>
      </div>
    );
  }

  const { survey, overview, questions, responseTrend } = analytics;

  return (
    <div className="space-y-8">


      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon">
            <Link to="/surveys">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {survey.title}
              </h1>

              <Badge variant={survey.isPublished ? "default" : "secondary"}>
                {survey.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Survey analytics and response insights
            </p>

            <p className="mt-2 text-xs text-muted-foreground">/{survey.slug}</p>
          </div>
        </div>

        <Button variant="outline">
          <Link to={`/surveys/${survey.id}/edit`}>
            <FileText className="mr-2 h-4 w-4" />
            Edit Survey
          </Link>
        </Button>
      </div>


      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Responses</p>

                <p className="mt-1 text-2xl font-semibold">
                  {overview.totalResponses}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  All submitted responses
                </p>
              </div>

              <div className="rounded-lg bg-muted p-3">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Responses Today</p>

                <p className="mt-1 text-2xl font-semibold">
                  {overview.responsesToday}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Submitted today
                </p>
              </div>

              <div className="rounded-lg bg-muted p-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>

                <p className="mt-1 text-2xl font-semibold">
                  {overview.responsesThisWeek}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Responses this week
                </p>
              </div>

              <div className="rounded-lg bg-muted p-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>

                <p className="mt-1 text-2xl font-semibold">
                  {overview.responsesThisMonth}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Responses this month
                </p>
              </div>

              <div className="rounded-lg bg-muted p-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>



      <Card>
        <CardHeader>
          <CardTitle>Response Trend</CardTitle>

          <p className="text-sm text-muted-foreground">
            Number of responses received over time.
          </p>
        </CardHeader>

        <CardContent>
          {responseTrend.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No response data available.
            </div>
          ) : (
            <div className="space-y-4">
              {responseTrend.map((item) => {
                const percentage = (item.responses / maxTrendResponses) * 100;

                return (
                  <div key={item.date} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {new Date(`${item.date}T00:00:00`).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>

                      <span className="font-medium">
                        {item.responses}{" "}
                        {item.responses === 1 ? "response" : "responses"}
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${Math.max(percentage, 3)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>



      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Question Insights</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Response breakdown for each question.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {questions.map((question) => (
            <Card key={question.questionId}>
              <CardHeader>
                <CardTitle className="text-base">{question.label}</CardTitle>

                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">
                    {question.type.replace("_", " ")}
                  </Badge>

                  <span className="text-xs text-muted-foreground">
                    {question.totalAnswers}{" "}
                    {question.totalAnswers === 1 ? "answer" : "answers"}
                  </span>
                </div>
              </CardHeader>

              <CardContent>


                {question.totalAnswers === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No answers yet.
                  </div>
                ) : question.type === "TEXT" ? (
      

                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {(question.answers ?? []).map((answer, index) => (
                      <div
                        key={index}
                        className="rounded-lg border bg-muted/30 p-3 text-sm"
                      >
                        {String(answer)}
                      </div>
                    ))}
                  </div>
                ) : question.type === "RATING" ? (


                  <div className="space-y-6">
                    <div className="rounded-lg bg-muted/40 p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Average Rating
                      </p>

                      <p className="mt-2 text-4xl font-semibold">
                        {question.average?.toFixed(1) ?? "0.0"}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Based on {question.totalAnswers}{" "}
                        {question.totalAnswers === 1 ? "response" : "responses"}
                      </p>
                    </div>

              

                    {question.distribution &&
                      question.distribution.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium">
                            Rating Distribution
                          </p>

                          {question.distribution.map((item) => (
                            <div key={item.value} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>{item.value} / 5</span>

                                <span className="text-muted-foreground">
                                  {item.count} ({item.percentage}
                                  %)
                                </span>
                              </div>

                              <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{
                                    width: `${item.percentage}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ) : (
           

                  <div className="space-y-4">
                    {question.options && question.options.length > 0 ? (
                      question.options.map((option) => (
                        <div key={option.value} className="space-y-2">
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="truncate font-medium">
                              {option.label}
                            </span>

                            <span className="shrink-0 text-muted-foreground">
                              {option.count} ({option.percentage}
                              %)
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{
                                width: `${Math.max(
                                  option.percentage,
                                  option.count > 0 ? 3 : 0,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                        No option data available.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>


      {questions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>

            <h3 className="mt-4 font-semibold">No question data</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              This survey doesn't have any question analytics yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SurveyAnalytics;
