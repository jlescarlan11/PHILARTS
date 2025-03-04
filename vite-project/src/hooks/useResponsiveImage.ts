import { useState } from "react";

export const useResponsiveImage = (imageUrl: string) => {
  const [src] = useState(imageUrl);
  const [error, setError] = useState(false);

  const handleError = () => {
    if (!error) {
      setError(true);
    }
  };

  return { src, error, handleError };
};
