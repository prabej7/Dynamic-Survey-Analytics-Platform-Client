import axios from "axios";
import { toast } from "sonner";

export const handleApiError = (
  error: unknown,
  fallback = "Something went wrong",
) => {
  if (axios.isAxiosError(error)) {
    const response = error.response?.data;

    if (response?.errors?.length) {
      response.errors.forEach((item: { field: string; message: string }) => {
        toast.error(item.message, {
          description: item.field,
        });
      });

      return;
    }

    if (response?.message) {
      toast.error(response.message);
      return;
    }
  }

  toast.error(fallback);
};
