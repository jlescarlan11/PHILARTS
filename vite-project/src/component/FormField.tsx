// File: FormField.tsx
import React from "react";
import { UseFormRegister } from "react-hook-form";
import { FaCheck, FaExclamationCircle } from "react-icons/fa";
import { trackEvent } from "../utils/analytics";

interface FormFieldProps {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  error?: string;
  register: UseFormRegister<any>;
  validation?: any;
  isTextArea?: boolean;
  rows?: number;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  placeholder,
  type = "text",
  error,
  register,
  validation,
  isTextArea = false,
  rows = 3,
}) => {
  // Extract onBlur from the register return value (no onFocus here).
  const { onBlur: registerOnBlur, ...rest } = register(name, validation);

  // Custom event handlers.
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    trackEvent("FieldBlur", { field: name });
    if (registerOnBlur) registerOnBlur(e);
  };

  const handleFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    trackEvent("FieldFocus", { field: name });
  };

  const commonProps = {
    id: name,
    placeholder,
    className: `mt-1 block w-full p-2 border ${
      error ? "border-red-500" : "border-gray-300"
    } rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition`,
    "aria-invalid": !!error,
    "aria-describedby": `${name}-error`,
    onBlur: handleBlur,
    onFocus: handleFocus,
    ...rest,
  };

  return (
    <div className="mb-6 relative transition-all duration-200 group">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {isTextArea ? (
        <textarea {...commonProps} rows={rows} />
      ) : (
        <input type={type} {...commonProps} />
      )}
      {error ? (
        <div
          id={`${name}-error`}
          className="absolute right-2 top-10 text-red-500 flex items-center transition-opacity duration-200"
          role="alert"
          aria-live="assertive"
        >
          <FaExclamationCircle className="mr-1" />
          <span>{error}</span>
        </div>
      ) : (
        <FaCheck className="absolute right-2 top-10 text-green-500 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100" />
      )}
    </div>
  );
};

export default FormField;
