// File: ErrorSummary.tsx
import React from "react";

interface ErrorSummaryProps {
  errors: { [key: string]: any };
}

const ErrorSummary: React.FC<ErrorSummaryProps> = ({ errors }) => {
  const errorMessages = Object.values(errors).map(
    (error: any) => error.message
  );

  if (errorMessages.length === 0) return null;

  return (
    <div
      className="mb-4 p-4 bg-red-100 border border-red-400 rounded"
      role="alert"
      aria-live="assertive"
    >
      <p className="font-bold">Please fix the following errors:</p>
      <ul className="list-disc pl-5">
        {errorMessages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default ErrorSummary;
