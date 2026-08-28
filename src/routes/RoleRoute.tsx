import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

interface RoleRouteProps {
  allowedRoles: Array<"USER" | "ADMIN">;
}

const RoleRoute = ({
  allowedRoles,
}: RoleRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
};

export default RoleRoute;