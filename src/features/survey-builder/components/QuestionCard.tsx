// components/survey-builder/QuestionCard.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import type { QuestionCardProps } from "../types/types";
import { ConditionalLogic } from "./ConditionalLogic";
import { QuestionOptions } from "./QuestionOptions";

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  totalQuestions,
  availableConditionQuestions,
  conditionSource,
  conditionOptions,
  onUpdate,
  onRemove,
  onMove,
  onTypeChange,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  onSetCondition,
  onUpdateConditionValue,
  onUpdateConditionOperator,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Question {index + 1}</CardTitle>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            disabled={index === 0}
            onClick={() => onMove("up")}
          >
            ↑
          </Button>

          <Button
            variant="ghost"
            size="icon"
            disabled={index === totalQuestions - 1}
            onClick={() => onMove("down")}
          >
            ↓
          </Button>

          <Button variant="ghost" size="icon" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Question */}
        <div className="space-y-2">
          <Label>Question</Label>
          <Input
            placeholder="Enter your question..."
            value={question.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
          />
        </div>

        {/* Type & Required */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={question.type}
              onValueChange={(value) => {
                if (value) onTypeChange(value as any);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEXT">Text</SelectItem>
                <SelectItem value="SINGLE_SELECT">Single Select</SelectItem>
                <SelectItem value="MULTI_SELECT">Multiple Select</SelectItem>
                <SelectItem value="RATING">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border px-4">
            <div>
              <p className="text-sm font-medium">Required</p>
              <p className="text-xs text-muted-foreground">Must be answered</p>
            </div>
            <Switch
              checked={question.required}
              onCheckedChange={(checked) => onUpdate({ required: checked })}
            />
          </div>
        </div>

        {/* Conditional Logic */}
        <ConditionalLogic
          questionId={question.id}
          condition={question.condition}
          availableQuestions={availableConditionQuestions}
          conditionOptions={conditionOptions}
          conditionSource={conditionSource}
          onSetCondition={onSetCondition}
          onUpdateValue={onUpdateConditionValue}
          onUpdateOperator={onUpdateConditionOperator}
        />

        {/* Options */}
        {(question.type === "SINGLE_SELECT" ||
          question.type === "MULTI_SELECT") &&
          question.options && (
            <QuestionOptions
              questionId={question.id}
              options={question.options}
              onAddOption={onAddOption}
              onUpdateOption={onUpdateOption}
              onRemoveOption={onRemoveOption}
            />
          )}

        {/* Rating */}
        {question.type === "RATING" && (
          <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
            Users will rate this question from 1 to 5.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
