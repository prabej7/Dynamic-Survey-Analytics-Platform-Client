import api from "./api";

export type QuestionType = "TEXT" | "SINGLE_SELECT" | "MULTI_SELECT" | "RATING";

export interface QuestionOption {
  label: string;
  value: string;
}

export interface QuestionCondition {
  questionId: string;
  operator: "equals" | "not_equals" | "contains";
  value: string;
}

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  label: string;
  required: boolean;
  options?: QuestionOption[];
  condition?: QuestionCondition;
}

export interface SurveySchema {
  questions: SurveyQuestion[];
}

export interface CreateSurveyInput {
  title: string;
  description?: string;
  slug: string;
  schema: SurveySchema;
}

export interface UpdateSurveyInput {
  title?: string;
  description?: string;
  slug?: string;
  schema?: SurveySchema;
  isPublished?: boolean;
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  slug: string;
  schema: SurveySchema;
  isPublished: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const createSurvey = async (
  data: CreateSurveyInput,
): Promise<Survey> => {
  const response = await api.post<ApiResponse<Survey>>("/surveys", data);

  return response.data.data;
};

export const getSurveyById = async (id: string): Promise<Survey> => {
  const response = await api.get<ApiResponse<Survey>>(`/surveys/${id}`);

  return response.data.data;
};

export const updateSurvey = async (
  id: string,
  data: UpdateSurveyInput,
): Promise<Survey> => {
  const response = await api.patch<ApiResponse<Survey>>(`/surveys/${id}`, data);

  return response.data.data;
};

export const deleteSurvey = async (id: string): Promise<void> => {
  await api.delete(`/surveys/${id}`);
};

export const publishSurvey = async (id: string): Promise<Survey> => {
  const response = await api.patch<ApiResponse<Survey>>(
    `/surveys/${id}/publish`,
  );

  return response.data.data;
};

export const getPublicSurvey = async (slug: string): Promise<Survey> => {
  const response = await api.get<ApiResponse<Survey>>(`/surveys/slug/${slug}`);

  return response.data.data;
};
