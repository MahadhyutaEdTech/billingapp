import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoutes = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("authToken"));

  useEffect(() => {
    const handleStorageChange = () => {
      console.log("Storage changed, checking auth token...");
      setToken(localStorage.getItem("authToken"));
      console.log("Checking Auth Token in ProtectedRoutes:", token); 
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  console.log("Checking Auth Token in ProtectedRoutes:", token);
  return token ? children : <Navigate to="/auth" replace />;
};

export default ProtectedRoutes;



