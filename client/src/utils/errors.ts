import axios from "axios";

export const getErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    if (err.response) {
      return (err.response.data as { msg?: string } | undefined)?.msg ?? fallback;
    }
    return "Could not reach the server. Check your connection and try again.";
  }
  return fallback;
};
