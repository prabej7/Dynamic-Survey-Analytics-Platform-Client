// components/survey-builder/QuestionList.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import type { QuestionListProps } from "../types/types";
import { QuestionCard } from "./QuestionCard";

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
  onMoveQuestion,
  onChangeQuestionType,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  onSetCondition,
  onUpdateConditionValue,
  onUpdateConditionOperator,
  getAvailableConditionQuestions,
  getQuestionAnswerOptions,
}) => {
  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-48 items-center justify-center">
          <div className="text-center">
            <h3 className="font-medium">No questions yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first question to start building the survey.
            </p>
            <Button className="mt-4" onClick={onAddQuestion}>
              Add Question
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Questions</h2>
          <p className="text-sm text-muted-foreground">
            {questions.length} question{questions.length !== 1 && "s"}
          </p>
        </div>
        <Button onClick={onAddQuestion}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      {questions.map((question, index) => {
        const availableQuestions = getAvailableConditionQuestions(index);
        const conditionSource = question.condition
          ? questions.find((q) => q.id === question.condition?.questionId)
          : undefined;
        const conditionOptions = conditionSource
          ? getQuestionAnswerOptions(conditionSource)
          : [];

        return (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            totalQuestions={questions.length}
            availableConditionQuestions={availableQuestions}
            conditionSource={conditionSource}
            conditionOptions={conditionOptions}
            onUpdate={(updates) => onUpdateQuestion(question.id, updates)}
            onRemove={() => onRemoveQuestion(question.id)}
            onMove={(direction) => onMoveQuestion(question.id, direction)}
            onTypeChange={(type) => onChangeQuestionType(question.id, type)}
            onAddOption={() => onAddOption(question.id)}
            onUpdateOption={(idx, label) =>
              onUpdateOption(question.id, idx, label)
            }
            onRemoveOption={(idx) => onRemoveOption(question.id, idx)}
            onSetCondition={(sourceId) => onSetCondition(question.id, sourceId)}
            onUpdateConditionValue={(value) =>
              onUpdateConditionValue(question.id, value)
            }
            onUpdateConditionOperator={(operator) =>
              onUpdateConditionOperator(question.id, operator)
            }
          />
        );
      })}
    </div>
  );
};
