import { ArrowLeft, Home, SearchX } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
          <SearchX className="h-10 w-10 text-muted-foreground" />
        </div>

        {/* Error Code */}
        <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Error 404
        </p>

        {/* Title */}
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          Page not found
        </h1>

        {/* Description */}
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Sorry, we couldn't find the page you're looking for.
          It may have been moved, deleted, or the link may be incorrect.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          <Button
            onClick={() => navigate("/")}
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>

        {/* Small footer text */}
        <p className="mt-10 text-xs text-muted-foreground">
          If you believe this is an error, please check the URL
          and try again.
        </p>
      </div>
    </div>
  );
};

export default NotFound;