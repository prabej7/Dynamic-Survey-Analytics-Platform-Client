// components/survey-builder/SurveyDetails.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SurveyDetailsProps } from "../types/types";

export const SurveyDetails: React.FC<SurveyDetailsProps> = ({
  title,
  description,
  slug,
  onTitleChange,
  onDescriptionChange,
  onSlugChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Survey Details</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            placeholder="Customer Satisfaction Survey"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            placeholder="Tell users what this survey is about..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Slug</Label>
          <Input value={slug} onChange={(e) => onSlugChange(e.target.value)} />
          <p className="text-xs text-muted-foreground">
            /survey/{slug || "your-survey"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
