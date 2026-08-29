// components/survey-builder/QuestionOptions.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { QuestionOptionsProps } from "../types/types";

export const QuestionOptions: React.FC<QuestionOptionsProps> = ({
  questionId,
  options,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
}) => {
  return (
    <div className="space-y-3">
      <Label>Options</Label>

      {options.map((option, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={option.label}
            onChange={(e) => onUpdateOption(index, e.target.value)}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => onRemoveOption(index)}
          >
            ×
          </Button>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={onAddOption}>
        + Add Option
      </Button>
    </div>
  );
};
