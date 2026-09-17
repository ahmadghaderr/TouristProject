interface ErrorMessageProps {
  message: string;
  className?: string;
}

const ErrorMessage = ({ message, className = "error-message" }: ErrorMessageProps) => (
  <p className={className}>{message}</p>
);

export default ErrorMessage;
