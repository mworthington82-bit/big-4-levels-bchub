import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth + entry
import SignIn from "./pages/SignIn";
import PostLogin from "./pages/PostLogin";
import NotYet from "./pages/NotYet";
import Admin from "./pages/Admin";

// New (Phase 1+) pages — kept reachable under /new/* in the background
import Journey from "./pages/Journey";
import ResourcesHub from "./pages/ResourcesHub";
import Module from "./pages/Module";
import Leader from "./pages/Leader";
import Connect from "./pages/Connect";
import BestPractice from "./pages/BestPractice";

// Legacy pages — now the primary experience
import Landing from "./pages/Landing";
import SelfAssessment from "./pages/SelfAssessment";
import Training from "./pages/Training";
import Resources from "./pages/Resources";
import Inclusion from "./pages/Inclusion";
import Bookings from "./pages/Bookings";
import Planner from "./pages/Planner";

import NotFound from "./pages/NotFound";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Entry */}
          <Route path="/" element={<SignIn />} />
          <Route path="/post-login" element={<RequireAuth><PostLogin /></RequireAuth>} />
          <Route path="/not-yet" element={<RequireAuth><NotYet /></RequireAuth>} />
          <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />

          {/* Legacy — primary experience */}
          <Route path="/home" element={<RequireAuth><Landing /></RequireAuth>} />
          <Route path="/self-assessment" element={<RequireAuth><SelfAssessment /></RequireAuth>} />
          <Route path="/training" element={<RequireAuth><Training /></RequireAuth>} />
          <Route path="/resources" element={<RequireAuth><Resources /></RequireAuth>} />
          <Route path="/planner" element={<RequireAuth><Planner /></RequireAuth>} />
          <Route path="/inclusion" element={<RequireAuth><Inclusion /></RequireAuth>} />
          <Route path="/bookings" element={<RequireAuth><Bookings /></RequireAuth>} />

          {/* New pages — kept in background under /new/* */}
          <Route path="/new/journey" element={<RequireAuth><Journey /></RequireAuth>} />
          <Route path="/new/module/:moduleId" element={<RequireAuth><Module /></RequireAuth>} />
          <Route path="/new/resources" element={<RequireAuth><ResourcesHub /></RequireAuth>} />
          <Route path="/new/leader" element={<RequireAuth><Leader /></RequireAuth>} />
          <Route path="/connect" element={<RequireAuth><Connect /></RequireAuth>} />

          {/* Back-compat redirects from old new-paths */}
          <Route path="/journey" element={<Navigate to="/new/journey" replace />} />
          <Route path="/module/:moduleId" element={<Navigate to="/new/journey" replace />} />
          <Route path="/leader" element={<Navigate to="/new/leader" replace />} />

          {/* Legacy back-compat: old /legacy/* deep links */}
          <Route path="/legacy/home" element={<Navigate to="/home" replace />} />
          <Route path="/legacy/self-assessment" element={<Navigate to="/self-assessment" replace />} />
          <Route path="/legacy/training" element={<Navigate to="/training" replace />} />
          <Route path="/legacy/resources" element={<Navigate to="/resources" replace />} />
          <Route path="/legacy/inclusion" element={<Navigate to="/inclusion" replace />} />
          <Route path="/legacy/bookings" element={<Navigate to="/bookings" replace />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
