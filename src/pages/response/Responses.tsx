import {
  CalendarDays,
  Eye,
  FileText,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Skeleton } from "@/components/ui/skeleton";

import api from "@/services/api";
import { handleApiError } from "@/utils/apiError";

import type { SurveyResponse } from "@/services/responseApi";
import type { Survey } from "@/types/survey";

interface ResponsesApiResponse {
  success: boolean;
  data: SurveyResponse[];
}

interface SurveysApiResponse {
  success: boolean;
  data: {
    data: Survey[];
  };
}

const Responses = () => {
  const navigate = useNavigate();

  const [responses, setResponses] = useState<SurveyResponse[]>([]);

  const [surveys, setSurveys] = useState<Survey[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [surveyFilter, setSurveyFilter] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);

      const [responsesResponse, surveysResponse] = await Promise.all([
        api.get<ResponsesApiResponse>("/responses"),

        api.get<SurveysApiResponse>("/surveys"),
      ]);

      setResponses(responsesResponse.data.data);

      setSurveys(surveysResponse.data.data.data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getSurvey = (surveyId: string) => {
    return surveys.find((survey) => survey.id === surveyId);
  };

  const filteredResponses = responses.filter((response) => {
    const survey = getSurvey(response.surveyId);

    const surveyTitle = survey?.title ?? "";

    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      surveyTitle.toLowerCase().includes(searchValue) ||
      response.id.toLowerCase().includes(searchValue);

    const matchesSurvey =
      surveyFilter === "all" || response.surveyId === surveyFilter;

    return matchesSearch && matchesSurvey;
  });

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this response?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/responses/${id}`);

      setResponses((current) =>
        current.filter((response) => response.id !== id),
      );
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleView = (id: string) => {
    navigate(`/responses/${id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Responses</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          View and manage submitted survey responses.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-muted p-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Responses</p>

              <p className="text-2xl font-semibold">{responses.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-muted p-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Surveys</p>

              <p className="text-2xl font-semibold">{surveys.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-muted p-3">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Latest Response</p>

              <p className="text-sm font-semibold">
                {responses.length > 0
                  ? new Date(responses[0].submittedAt).toLocaleDateString()
                  : "No responses"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>All Responses</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Browse submitted responses.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  placeholder="Search responses..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9 sm:w-[240px]"
                />
              </div>

              <Select
                value={surveyFilter}
                onValueChange={(value) => {
                  if (value !== null) {
                    setSurveyFilter(value);
                  }
                }}
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Survey" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Surveys</SelectItem>

                  {surveys.map((survey) => (
                    <SelectItem key={survey.id} value={survey.id}>
                      {survey.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[220px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>

                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : filteredResponses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-semibold">No responses found</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                No responses match your current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Survey</th>

                    <th className="hidden pb-3 font-medium md:table-cell">
                      Response ID
                    </th>

                    <th className="pb-3 font-medium">Submitted</th>

                    <th className="hidden pb-3 font-medium sm:table-cell">
                      Answers
                    </th>

                    <th className="w-[60px] pb-3" />
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredResponses.map((response) => {
                    const survey = getSurvey(response.surveyId);

                    return (
                      <tr key={response.id} className="hover:bg-muted/50">
                        <td className="py-4">
                          <div>
                            <p className="font-medium">
                              {survey?.title ?? "Unknown Survey"}
                            </p>

                            {survey?.slug && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                /{survey.slug}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="hidden py-4 md:table-cell">
                          <code className="rounded bg-muted px-2 py-1 text-xs">
                            {response.id}
                          </code>
                        </td>

                        <td className="py-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />

                            {new Date(
                              response.submittedAt,
                            ).toLocaleDateString()}
                          </div>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(response.submittedAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </td>

                        <td className="hidden py-4 sm:table-cell">
                          <Badge variant="secondary">
                            {Object.keys(response.answers ?? {}).length} answers
                          </Badge>
                        </td>

                        <td className="py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={<Button variant="ghost" size="icon" />}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleView(response.id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Response
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDelete(response.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Responses;
