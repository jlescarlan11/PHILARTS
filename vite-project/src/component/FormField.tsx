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
  title?: string; // Added optional title prop for inline hints.
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
  title,
}) => {
  const { onBlur: registerOnBlur, ...rest } = register(name, validation);

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    trackEvent("FieldBlur", { field: name });
    if (registerOnBlur) registerOnBlur(e);
  };

  const handleFocus = (
    _e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    trackEvent("FieldFocus", { field: name });
  };

  const commonProps = {
    id: name,
    placeholder,
    title, // Pass title to input for inline hint.
    className: `mt-1 block w-full p-2 border ${
      error
        ? "border-red-500"
        : "text-[var(--color-secondary)] border-[var(--color-secondary-50)]"
    } rounded focus:outline-none focus:ring-2 focus:ring-accent transition-colors duration-300`,
    "aria-invalid": !!error,
    "aria-describedby": `${name}-error`,
    onBlur: handleBlur,
    onFocus: handleFocus,
    ...rest,
  };

  return (
    <div className="mb-6 relative transition-all text-[var(--color-secondary)] duration-300 group">
      <label htmlFor={name} className="block text-sm font-medium">
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
          className="absolute right-2 top-10 text-red-500 flex items-center transition-opacity duration-300"
          role="alert"
          aria-live="assertive"
        >
          <FaExclamationCircle className="mr-1" />
          <span>{error}</span>
        </div>
      ) : (
        <FaCheck className="absolute right-2 top-10 text-green-500 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />
      )}
    </div>
  );
};

export default FormField;
