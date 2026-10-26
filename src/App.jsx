import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import ConnectionsPage from "./pages/ConnectionsPage.jsx";
import FeedPage from "./pages/FeedPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PendingRequestsPage from "./pages/PendingRequestsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ProtectedRoute from "./components/routes/ProtectedRoute.jsx";
import PublicOnlyRoute from "./components/routes/PublicOnlyRoute.jsx";
import { Toaster } from "@/components/ui/sonner.jsx";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        {/* Public only routes: If already logged in, redirects to /feed */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
          </Route>
        </Route>

        {/* Protected routes: If not logged in, redirects to /login */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/matches" element={<Navigate to="/connections" replace />} />
            <Route path="/requests" element={<PendingRequestsPage />} />
            <Route path="/likes" element={<PendingRequestsPage />} />
            <Route path="/user/pending/requests" element={<PendingRequestsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
