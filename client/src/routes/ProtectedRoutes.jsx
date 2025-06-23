import { Navigate } from "react-router-dom";

const ProtectedRoutes = ({ children }) => {
  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");
  const isAuthenticated = !!(token && userId);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoutes;



