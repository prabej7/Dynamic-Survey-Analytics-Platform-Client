// types/survey.ts

export type QuestionType = "TEXT" | "SINGLE_SELECT" | "MULTI_SELECT" | "RATING";

// Match the API exactly - only these three operators are supported
export type ConditionalOperator = "equals" | "not_equals" | "contains";

export interface QuestionOption {
  label: string;
  value: string;
}

export interface QuestionCondition {
  questionId: string;
  operator: ConditionalOperator;
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

export interface SurveyFormData {
  title: string;
  description: string;
  slug: string;
  schema: SurveySchema;
}

export interface Survey {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  schema: SurveySchema;
  isPublished: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// API Request/Response Types
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

export interface SurveyResponse {
  success: boolean;
  data: Survey;
}

export interface SurveysResponse {
  success: boolean;
  data: Survey[];
}

export interface GetSurveyResponse {
  success: boolean;
  data: Survey;
}

// For the builder component
export type BuilderQuestion = SurveyQuestion & {
  condition?: QuestionCondition;
};

export interface BuilderFormData extends Omit<SurveyFormData, "schema"> {
  schema: {
    questions: BuilderQuestion[];
  };
}