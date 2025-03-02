// File: useAutoSave.ts
import { useEffect } from "react";

export function useAutoSave(
  formData: any,
  storageKey: string = "contactFormData"
) {
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(formData));
  }, [formData, storageKey]);
}
