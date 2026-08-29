
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import type { SurveyHeaderProps } from "../types/types";

export const SurveyHeader: React.FC<SurveyHeaderProps> = ({
  id,
  slug,
  loading,
  onCopyLink,
  onCancel,
  onSave,
}) => {
  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold">
            {id ? "Edit Survey" : "Create Survey"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Build your survey and configure its questions.
          </p>
        </div>

        <div className="flex gap-2">
          {id && slug && (
            <Button variant="outline" onClick={onCopyLink}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          )}

          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>

          <Button onClick={onSave} disabled={loading}>
            {loading ? "Saving..." : id ? "Update Survey" : "Create Survey"}
          </Button>
        </div>
      </div>
    </header>
  );
};
