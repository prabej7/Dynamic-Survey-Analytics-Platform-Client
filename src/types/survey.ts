export type QuestionType =
  | "TEXT"
  | "SINGLE_SELECT"
  | "MULTI_SELECT"
  | "RATING";

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "contains";

export interface QuestionOption {
  label: string;
  value: string;
}

export interface QuestionCondition {
  questionId: string;
  operator: ConditionOperator;
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