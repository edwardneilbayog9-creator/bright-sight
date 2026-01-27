import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { DatabaseProvider, useDatabase } from "@/lib/db";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import ReviewQueue from "./pages/ReviewQueue";
import History from "./pages/History";
import DetectionDetail from "./pages/DetectionDetail";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function DatabaseLoader({ children }: { children: React.ReactNode }) {
  const { isReady, isError, error } = useDatabase();

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6">
          <div className="text-destructive text-lg font-semibold mb-2">Database Error</div>
          <p className="text-muted-foreground">{error?.message || 'Failed to initialize database'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-pulse text-primary text-lg">Initializing database...</div>
          <p className="text-muted-foreground text-sm mt-2">Loading SQLite engine</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/analyze"
        element={
          <ProtectedRoute>
            <Analyze />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/reviews"
        element={
          <ProtectedRoute>
            <ReviewQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/detection/:id"
        element={
          <ProtectedRoute>
            <DetectionDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <DatabaseProvider>
          <DatabaseLoader>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </DatabaseLoader>
        </DatabaseProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
