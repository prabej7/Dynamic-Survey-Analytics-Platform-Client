import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  FileText,
  Plus,
  Send,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { getDashboardAnalytics } from "@/services/dashboardApi";
import { handleApiError } from "@/utils/apiError";

interface AnalyticsOverview {
  totalSurveys: number;
  publishedSurveys: number;
  totalResponses: number;
  responsesToday: number;
  responsesThisWeek: number;
  responsesThisMonth: number;
}

interface ResponseBySurvey {
  surveyId: string;
  title: string;
  responses: number;
}

interface RecentResponse {
  id: string;
  surveyId: string;
  surveyTitle: string;
  submittedAt: string;
}

interface AnalyticsData {
  overview: AnalyticsOverview;
  responsesBySurvey: ResponseBySurvey[];
  recentResponses: RecentResponse[];
}

interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsData;
}

const Dashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const response = await getDashboardAnalytics();

      setAnalytics(response);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const overview = analytics?.overview;

  const stats = [
    {
      title: "Total Surveys",
      value: overview?.totalSurveys ?? 0,
      description: "All surveys created",
      icon: FileText,
    },
    {
      title: "Published Surveys",
      value: overview?.publishedSurveys ?? 0,
      description: "Currently accepting responses",
      icon: Send,
    },
    {
      title: "Total Responses",
      value: overview?.totalResponses ?? 0,
      description: "Responses collected",
      icon: Users,
    },
    {
      title: "Responses Today",
      value: overview?.responsesToday ?? 0,
      description: "Responses received today",
      icon: BarChart3,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
 
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-72" />
          </div>

          <Skeleton className="h-10 w-32" />
        </div>

  
  
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-32" />
                  </div>

                  <Skeleton className="h-11 w-11 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

     
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="mt-2 h-4 w-64" />
            </CardHeader>

            <CardContent className="space-y-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>

                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-28" />
              <Skeleton className="mt-2 h-4 w-40" />
            </CardHeader>

            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening with your surveys.
          </p>
        </div>
        <Link to="/surveys/create">
          <Button className="justify-start p-4">
            <Plus />
            Create Survey
          </Button>
        </Link>
      </div>


      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>

                    <p className="text-2xl font-semibold tracking-tight">
                      {stat.value.toLocaleString()}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted p-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>


      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-muted p-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Responses Today</p>

                <p className="text-2xl font-semibold">
                  {overview?.responsesToday ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-muted p-3">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">This Week</p>

                <p className="text-2xl font-semibold">
                  {overview?.responsesThisWeek ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-muted p-3">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">This Month</p>

                <p className="text-2xl font-semibold">
                  {overview?.responsesThisMonth ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

 
      <div className="grid gap-6 lg:grid-cols-3">
       
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Responses by Survey</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Response distribution across your surveys.
              </p>
            </div>

            <Button variant="ghost" size="sm">
              <Link to="/surveys">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent>
            {analytics?.responsesBySurvey.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>

                <h3 className="mt-4 font-semibold">No survey responses yet</h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Responses will appear here once people submit your surveys.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {analytics?.responsesBySurvey.map((survey) => {
                  const totalResponses = overview?.totalResponses || 0;

                  const percentage =
                    totalResponses > 0
                      ? Math.round((survey.responses / totalResponses) * 100)
                      : 0;

                  return (
                    <div key={survey.surveyId} className="space-y-3 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <Link
                          to={`/surveys/${survey.surveyId}/edit`}
                          className="truncate text-sm font-medium hover:underline"
                        >
                          {survey.title}
                        </Link>

                        <span className="shrink-0 text-sm font-medium">
                          {survey.responses}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        <span className="w-10 text-right text-xs text-muted-foreground">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

   
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Responses</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Latest submissions.
              </p>
            </div>

            <Button variant="ghost" size="sm">
              <Link to="/responses">View all</Link>
            </Button>
          </CardHeader>

          <CardContent>
            {analytics?.recentResponses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>

                <h3 className="mt-4 font-semibold">No responses yet</h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  New responses will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {analytics?.recentResponses.map((response) => (
                  <Link
                    key={response.id}
                    to={`/responses/${response.id}`}
                    className="block py-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-muted p-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {response.surveyTitle}
                        </p>

                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5" />

                          {new Date(response.submittedAt).toLocaleDateString()}

                          <span>•</span>

                          {new Date(response.submittedAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>

          <p className="text-sm text-muted-foreground">Get started quickly.</p>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button className="h-auto justify-start p-4" variant="outline">
              <Link to="/surveys/create">
                <div className="mr-3 rounded-md bg-muted p-2">
                  <Plus className="h-4 w-4" />
                </div>

                <div className="text-left">
                  <p className="text-sm font-medium">Create Survey</p>

                  <p className="text-xs text-muted-foreground">
                    Build a new survey
                  </p>
                </div>
              </Link>
            </Button>

            <Button className="h-auto justify-start p-4" variant="outline">
              <Link to="/surveys">
                <div className="mr-3 rounded-md bg-muted p-2">
                  <FileText className="h-4 w-4" />
                </div>

                <div className="text-left">
                  <p className="text-sm font-medium">Manage Surveys</p>

                  <p className="text-xs text-muted-foreground">
                    View and edit surveys
                  </p>
                </div>
              </Link>
            </Button>

            <Button className="h-auto justify-start p-4" variant="outline">
              <Link to="/responses">
                <div className="mr-3 rounded-md bg-muted p-2">
                  <BarChart3 className="h-4 w-4" />
                </div>

                <div className="text-left">
                  <p className="text-sm font-medium">View Responses</p>

                  <p className="text-xs text-muted-foreground">
                    Analyze survey responses
                  </p>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
