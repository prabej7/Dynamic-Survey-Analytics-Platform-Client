import api from "./api";

export interface SubmitResponseInput {
  surveyId: string;
  answers: Record<string, unknown>;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: Record<string, unknown>;
  submittedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const submitResponse = async (
  data: SubmitResponseInput
): Promise<SurveyResponse> => {
  const response = await api.post<
    ApiResponse<SurveyResponse>
  >(`/responses/${data.surveyId}`, data);

  return response.data.data;
};