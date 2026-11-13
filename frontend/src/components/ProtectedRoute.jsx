
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  if (
    !user ||
    !user.id ||
    !["patient", "healthcare"].includes(user.role)
  ) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={
          user.role === "healthcare"
            ? "/healthcare-dashboard"
            : "/patient-dashboard"
        }
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
