// components/survey-builder/LivePreview.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LivePreviewProps } from "../types/types";
import { PreviewQuestion } from "./PreviewQuestion";

export const LivePreview: React.FC<LivePreviewProps> = ({
  title,
  description,
  questions,
  previewAnswers,
  onUpdatePreviewAnswer,
  onResetPreview,
}) => {
  return (
    <div className="sticky top-24">
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <p className="text-xs text-muted-foreground">
            Try answering questions to see conditional logic in action
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Survey Header */}
          <div>
            <h2 className="text-xl font-semibold">
              {title || "Untitled Survey"}
            </h2>
            {description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          {/* Preview note */}
          <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
            Conditional questions are shown or hidden based on the selected
            answers.
          </div>

          {/* Questions */}
          {questions.map((question, index) => {
            const isVisible = true; // This should be determined by a shouldShowQuestion function
            return (
              <PreviewQuestion
                key={question.id}
                question={question}
                index={index}
                isVisible={isVisible}
                previewAnswers={previewAnswers}
                onUpdatePreviewAnswer={onUpdatePreviewAnswer}
              />
            );
          })}

          {/* Count */}
          {questions.length > 0 && (
            <div className="text-xs text-muted-foreground border-t pt-4">
              Showing {questions.length} of {questions.length} questions
            </div>
          )}

          {/* Reset */}
          {questions.length > 0 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={onResetPreview}
            >
              Reset Preview
            </Button>
          )}

          {/* Submit */}
          {questions.length > 0 && (
            <Button className="w-full" disabled>
              Submit
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
