// components/survey-builder/types.ts
import type {
    BuilderQuestion,
    QuestionCondition,
    QuestionType
} from "@/types/survey";

export interface SurveyHeaderProps {
  id?: string;
  slug?: string;
  loading: boolean;
  onCopyLink: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export interface SurveyDetailsProps {
  title: string;
  description: string;
  slug: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSlugChange: (slug: string) => void;
}

export interface QuestionListProps {
  questions: BuilderQuestion[];
  onAddQuestion: () => void;
  onUpdateQuestion: (id: string, updates: Partial<BuilderQuestion>) => void;
  onRemoveQuestion: (id: string) => void;
  onMoveQuestion: (id: string, direction: "up" | "down") => void;
  onChangeQuestionType: (id: string, type: QuestionType) => void;
  onAddOption: (id: string) => void;
  onUpdateOption: (id: string, index: number, label: string) => void;
  onRemoveOption: (id: string, index: number) => void;
  onSetCondition: (id: string, sourceId: string | null) => void;
  onUpdateConditionValue: (id: string, value: string | null) => void;
  onUpdateConditionOperator: (id: string, operator: string | null) => void;
  getAvailableConditionQuestions: (index: number) => BuilderQuestion[];
  getQuestionAnswerOptions: (question: BuilderQuestion) => { label: string; value: string }[];
}

export interface QuestionCardProps {
  question: BuilderQuestion;
  index: number;
  totalQuestions: number;
  availableConditionQuestions: BuilderQuestion[];
  conditionSource?: BuilderQuestion;
  conditionOptions: { label: string; value: string }[];
  onUpdate: (updates: Partial<BuilderQuestion>) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
  onTypeChange: (type: QuestionType) => void;
  onAddOption: () => void;
  onUpdateOption: (index: number, label: string) => void;
  onRemoveOption: (index: number) => void;
  onSetCondition: (sourceId: string | null) => void;
  onUpdateConditionValue: (value: string | null) => void;
  onUpdateConditionOperator: (operator: string | null) => void;
}

export interface ConditionalLogicProps {
  questionId: string;
  condition?: QuestionCondition;
  availableQuestions: BuilderQuestion[];
  conditionOptions: { label: string; value: string }[];
  conditionSource?: BuilderQuestion;
  onSetCondition: (sourceId: string | null) => void;
  onUpdateValue: (value: string | null) => void;
  onUpdateOperator: (operator: string | null) => void;
}

export interface QuestionOptionsProps {
  questionId: string;
  options: { label: string; value: string }[];
  onAddOption: () => void;
  onUpdateOption: (index: number, label: string) => void;
  onRemoveOption: (index: number) => void;
}

export interface LivePreviewProps {
  title: string;
  description?: string;
  questions: BuilderQuestion[];
  previewAnswers: Record<string, unknown>;
  onUpdatePreviewAnswer: (questionId: string, value: unknown) => void;
  onResetPreview: () => void;
}

export interface PreviewQuestionProps {
  question: BuilderQuestion;
  index: number;
  isVisible: boolean;
  previewAnswers: Record<string, unknown>;
  onUpdatePreviewAnswer: (questionId: string, value: unknown) => void;
}