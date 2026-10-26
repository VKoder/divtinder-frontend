import { Outlet } from "react-router-dom";
import BottomNav from "@/components/navigation/BottomNav";

export default function AppLayout() {
  return (
    <div className="relative min-h-screen">
      <Outlet />
      <BottomNav />
    </div>
  );
}
