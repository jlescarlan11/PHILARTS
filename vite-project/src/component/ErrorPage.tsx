import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();
  return (
    <div className="text-center text[var(--color-secondary)] flex flex-col gap-4">
      It is not available in the meantime. Please come back later.
      <button
        onClick={() => navigate("/")}
        className="text-[var(--color-primary)] bg-[var(--color-accent)] py-2 px-4 rounded hover:bg-[var(--color-accent-90)] transition duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
      >
        Go Home
      </button>
    </div>
  );
};

export default ErrorPage;
