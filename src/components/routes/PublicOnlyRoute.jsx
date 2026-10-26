import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore";

export default function PublicOnlyRoute() {
  const user = useUserStore((state) => state.user);

  if (user) {
    return <Navigate to="/feed" replace />;
  }

  return <Outlet />;
}
