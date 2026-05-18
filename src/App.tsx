import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Phase 1 pages
import SignIn from "./pages/SignIn";
import PostLogin from "./pages/PostLogin";
import NotYet from "./pages/NotYet";
import Journey from "./pages/Journey";
import ResourcesPlaceholder from "./pages/ResourcesPlaceholder";
import Connect from "./pages/Connect";
import Admin from "./pages/Admin";
import ModulePlaceholder from "./pages/ModulePlaceholder";

// Legacy pages — still reachable at /legacy/* for existing deep links
import Landing from "./pages/Landing";
import SelfAssessment from "./pages/SelfAssessment";
import Training from "./pages/Training";
import Resources from "./pages/Resources";
import Inclusion from "./pages/Inclusion";
import Bookings from "./pages/Bookings";

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
          {/* Phase 1 — authenticated app */}
          <Route path="/" element={<SignIn />} />
          <Route path="/post-login" element={<RequireAuth><PostLogin /></RequireAuth>} />
          <Route path="/not-yet" element={<RequireAuth><NotYet /></RequireAuth>} />
          <Route path="/journey" element={<RequireAuth><Journey /></RequireAuth>} />
          <Route path="/resources" element={<RequireAuth><ResourcesPlaceholder /></RequireAuth>} />
          <Route path="/connect" element={<RequireAuth><Connect /></RequireAuth>} />
          <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />

          {/* Legacy — kept reachable for in-flight deep links */}
          <Route path="/legacy/home" element={<RequireAuth><Landing /></RequireAuth>} />
          <Route path="/legacy/self-assessment" element={<RequireAuth><SelfAssessment /></RequireAuth>} />
          <Route path="/legacy/training" element={<RequireAuth><Training /></RequireAuth>} />
          <Route path="/legacy/resources" element={<RequireAuth><Resources /></RequireAuth>} />
          <Route path="/legacy/inclusion" element={<RequireAuth><Inclusion /></RequireAuth>} />
          <Route path="/legacy/bookings" element={<RequireAuth><Bookings /></RequireAuth>} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
