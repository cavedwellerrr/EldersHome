import { useAuth } from "../context/AuthContext";

const SomeComponent = () => {
  const { user } = useAuth();

  if (user?.role === "operator") {
  }

  return <div>Common UI</div>;
};
