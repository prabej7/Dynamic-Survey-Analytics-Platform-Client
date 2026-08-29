// components/survey-builder/PreviewQuestion.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PreviewQuestionProps } from "../types/types";

export const PreviewQuestion: React.FC<PreviewQuestionProps> = ({
  question,
  index,
  isVisible,
  previewAnswers,
  onUpdatePreviewAnswer,
}) => {
  if (!isVisible) {
    return (
      <div className="space-y-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10 p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Question {index + 1}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60">
            Conditional - Hidden
          </span>
        </div>
        <p className="text-sm text-muted-foreground/60">
          {question.label || "Untitled question"}
        </p>
        <p className="text-xs text-muted-foreground/50">
          This question is hidden because the condition is not met.
        </p>
      </div>
    );
  }

  const hasCondition = !!question.condition;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>
          {index + 1}. {question.label || "Untitled question"}
          {question.required && <span className="text-destructive"> *</span>}
        </Label>
        {hasCondition && (
          <span className="text-[10px] font-medium uppercase tracking-wide text-green-600 bg-green-50 px-2 py-0.5 rounded">
            ✓ Visible
          </span>
        )}
      </div>

      {/* Text */}
      {question.type === "TEXT" && (
        <Input
          placeholder="Your answer..."
          value={(previewAnswers[question.id] as string) || ""}
          onChange={(e) => onUpdatePreviewAnswer(question.id, e.target.value)}
        />
      )}

      {/* Single Select */}
      {question.type === "SINGLE_SELECT" && (
        <div className="space-y-2">
          {question.options?.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-2 text-sm p-2 rounded-md border transition-colors ${
                previewAnswers[question.id] === option.value
                  ? "border-primary bg-primary/5"
                  : "border-transparent hover:bg-muted/50"
              }`}
            >
              <input
                type="radio"
                name={`preview-${question.id}`}
                value={option.value}
                checked={previewAnswers[question.id] === option.value}
                onChange={(e) =>
                  onUpdatePreviewAnswer(question.id, e.target.value)
                }
              />
              {option.label}
            </label>
          ))}
        </div>
      )}

      {/* Multiple Select */}
      {question.type === "MULTI_SELECT" && (
        <div className="space-y-2">
          {question.options?.map((option) => {
            const currentAnswers =
              (previewAnswers[question.id] as string[]) || [];
            const checked = currentAnswers.includes(option.value);

            return (
              <label
                key={option.value}
                className={`flex items-center gap-2 text-sm p-2 rounded-md border transition-colors ${
                  checked
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:bg-muted/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const newAnswers = e.target.checked
                      ? [...currentAnswers, option.value]
                      : currentAnswers.filter((v) => v !== option.value);
                    onUpdatePreviewAnswer(question.id, newAnswers);
                  }}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      )}

      {/* Rating */}
      {question.type === "RATING" && (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <Button
              key={rating}
              size="icon"
              variant={
                previewAnswers[question.id] === rating ? "default" : "outline"
              }
              onClick={() => onUpdatePreviewAnswer(question.id, rating)}
            >
              {rating}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
