import {
    BarChart3,
    CheckCircle2,
    Edit,
    Eye,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Survey {
  id: string;
  title: string;
  description?: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface SurveysApiResponse {
  success: boolean;
  data: {
    data: Survey[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

const Surveys = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const fetchSurveys = async () => {
    try {
      setLoading(true);

      const response = await api.get<SurveysApiResponse>("/surveys");

      setSurveys(response.data.data.data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const filteredSurveys = surveys.filter((survey) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      survey.title.toLowerCase().includes(searchValue) ||
      survey.slug.toLowerCase().includes(searchValue);

    const matchesStatus =
      status === "all" ||
      (status === "published" && survey.isPublished) ||
      (status === "draft" && !survey.isPublished);

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this survey?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/surveys/${id}`);

      setSurveys((current) => current.filter((survey) => survey.id !== id));
    } catch (error) {
      handleApiError(error);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await api.patch(`/surveys/${id}/publish`);

      setSurveys((current) =>
        current.map((survey) =>
          survey.id === id
            ? {
                ...survey,
                isPublished: true,
              }
            : survey,
        ),
      );
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await api.patch(`/surveys/${id}/unpublish`);

      setSurveys((current) =>
        current.map((survey) =>
          survey.id === id
            ? {
                ...survey,
                isPublished: false,
              }
            : survey,
        ),
      );
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Surveys</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Create, manage, and publish your surveys.
          </p>
        </div>
        <Link to="/surveys/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Survey
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>All Surveys</CardTitle>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  placeholder="Search surveys..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9 sm:w-60"
                />
              </div>

              <Select
                value={status}
                onValueChange={(value) => {
                  if (value !== null) {
                    setStatus(value);
                  }
                }}
              >
                <SelectTrigger className="w-full sm:w-37.5">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All</SelectItem>

                  <SelectItem value="published">Published</SelectItem>

                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-55" />
                    <Skeleton className="h-3 w-37.5" />
                  </div>

                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : filteredSurveys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-semibold">No surveys found</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Try changing your search or filter.
              </p>
              <Link to="/surveys/create">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Survey
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Survey</th>

                    <th className="hidden pb-3 font-medium md:table-cell">
                      Slug
                    </th>

                    <th className="pb-3 font-medium">Status</th>

                    <th className="hidden pb-3 font-medium sm:table-cell">
                      Updated
                    </th>

                    <th className="w-15 pb-3" />
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredSurveys.map((survey) => (
                    <tr key={survey.id} className="group">
                      <td className="py-4">
                        <div className="min-w-50">
                          <Link
                            to={`/surveys/${survey.id}/edit`}
                            className="font-medium hover:underline"
                          >
                            {survey.title}
                          </Link>

                          {survey.description && (
                            <p className="mt-1 max-w-100 truncate text-xs text-muted-foreground">
                              {survey.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="hidden py-4 text-sm text-muted-foreground md:table-cell">
                        /{survey.slug}
                      </td>

                      <td className="py-4">
                        {survey.isPublished ? (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Draft
                          </Badge>
                        )}
                      </td>

                      <td className="hidden py-4 text-sm text-muted-foreground sm:table-cell">
                        {new Date(survey.updatedAt).toLocaleDateString()}
                      </td>

                      <td className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => {
                                console.log(survey.id);
                                window.location.href = `/surveys/${survey.id}/edit`;
                              }}
                              onClick={() =>
                                (window.location.href = `/surveys/${survey.id}/edit`)
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>

                            {survey.isPublished && (
                              <DropdownMenuItem
                                onSelect={() => {
                                  window.open(
                                    `/survey/${survey.slug}`,
                                    "_blank",
                                    "noopener,noreferrer",
                                  );
                                }}
                                onClick={() => {
                                  window.open(
                                    `/survey/${survey.slug}`,
                                    "_blank",
                                    "noopener,noreferrer",
                                  );
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Survey
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {survey.isPublished ? (
                              <DropdownMenuItem
                                onSelect={() => handleUnpublish(survey.id)}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Unpublish
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onSelect={() => handlePublish(survey.id)}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Publish
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onSelect={() => {
                                window.location.href = `/surveys/${survey.id}/analytics`;
                              }}
                              onClick={() => {
                                window.location.href = `/surveys/${survey.id}/analytics`;
                              }}
                            >
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Analytics
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => handleDelete(survey.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Surveys;
