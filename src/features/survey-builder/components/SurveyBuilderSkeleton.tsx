// components/survey-builder/SurveyBuilderSkeleton.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const SurveyBuilderSkeleton = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-20 border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Edit Survey</h1>
            <p className="text-sm text-muted-foreground">Loading survey...</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/surveys")}>
            Cancel
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-5 p-6">
                <div className="h-10 animate-pulse rounded-md bg-muted" />
                <div className="h-24 animate-pulse rounded-md bg-muted" />
                <div className="h-10 animate-pulse rounded-md bg-muted" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-6 p-6">
                <div className="h-20 animate-pulse rounded-md bg-muted" />
                <div className="h-20 animate-pulse rounded-md bg-muted" />
                <div className="h-20 animate-pulse rounded-md bg-muted" />
              </CardContent>
            </Card>
          </div>

          <aside className="hidden lg:block">
            <Card>
              <CardContent className="p-6">
                <div className="h-80 animate-pulse rounded-md bg-muted" />
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
};