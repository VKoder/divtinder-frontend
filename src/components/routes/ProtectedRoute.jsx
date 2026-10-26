import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore";

export default function ProtectedRoute() {
  const user = useUserStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
