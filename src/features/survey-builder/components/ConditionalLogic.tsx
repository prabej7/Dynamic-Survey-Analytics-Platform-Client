// components/survey-builder/ConditionalLogic.tsx
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ConditionalLogicProps } from "../types/types";

export const ConditionalLogic: React.FC<ConditionalLogicProps> = ({
  condition,
  availableQuestions,
  conditionOptions,
  conditionSource,
  onSetCondition,
  onUpdateValue,
  onUpdateOperator,
}) => {
  if (availableQuestions.length === 0) return null;
  const [selectedCondition] = availableQuestions.filter((q) => q.id === condition?.questionId);
  
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium">Conditional Logic</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Show this question only when a previous question matches a specific
          answer.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {/* Source Question */}
        <div className="space-y-2 sm:col-span-1">
          <Label className="text-xs">Show when</Label>
          <Select
            value={selectedCondition.label ?? "none"}
            onValueChange={(value) => {
              if (value === "none") {
                onSetCondition(null);
                return;
              }
              onSetCondition(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Always show" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Always show</SelectItem>
              {availableQuestions.map((q, idx) => (
                <SelectItem key={q.id} value={q.id}>
                  Question {idx + 1} — {q.label || "Untitled"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Operator */}
        {condition && (
          <div className="space-y-2">
            <Label className="text-xs">Condition</Label>
            <Select
              value={condition.operator}
              onValueChange={(value) => onUpdateOperator(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">is</SelectItem>
                <SelectItem value="not_equals">is not</SelectItem>
                <SelectItem value="contains">contains</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Value */}
        {condition && conditionOptions.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Answer</Label>
            <Select
              value={condition.value}
              onValueChange={(value) => onUpdateValue(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select answer" />
              </SelectTrigger>
              <SelectContent>
                {conditionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Human readable condition */}
      {condition && conditionSource && (
        <div className="mt-4 rounded-md bg-background px-3 py-2 text-xs">
          <span className="text-muted-foreground">
            This question will be shown when{" "}
          </span>
          <span className="font-medium">
            "{conditionSource.label || "Untitled question"}"
          </span>
          <span className="text-muted-foreground">
            {" "}
            {condition.operator === "equals"
              ? "is"
              : condition.operator === "not_equals"
                ? "is not"
                : "contains"}{" "}
          </span>
          <span className="font-medium">
            {conditionOptions.find((o) => o.value === condition.value)?.label ??
              condition.value}
          </span>
        </div>
      )}
    </div>
  );
};
