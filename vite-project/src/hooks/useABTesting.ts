import { useState, useEffect } from "react";

const useABTesting = (testName: string) => {
  const [variant, setVariant] = useState<"A" | "B">("A");

  useEffect(() => {
    const randomVariant = Math.random() > 0.5 ? "A" : "B";
    setVariant(randomVariant);
  }, [testName]);

  return { variant };
};

export default useABTesting;
