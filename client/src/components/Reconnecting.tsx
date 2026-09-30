import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import { useAuth } from "../utils/auth";

const Reconnecting = () => {
  const { refreshUser } = useAuth();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    await refreshUser();
    setRetrying(false);
  };

  if (retrying) return <LoadingSpinner />;

  return (
    <div className="loading-container">
      <ErrorMessage message="Can't reach the server right now. It may be waking up." />
      <button type="button" onClick={handleRetry}>
        Retry
      </button>
    </div>
  );
};

export default Reconnecting;
