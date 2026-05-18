import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SelfAssessment from "./pages/SelfAssessment";
import Training from "./pages/Training";
import Resources from "./pages/Resources";
import Inclusion from "./pages/Inclusion";
import Bookings from "./pages/Bookings";
import NotFound from "./pages/NotFound";
import RequireAuth from "./components/RequireAuth";
import BookTrainingButton from "./components/BookTrainingButton";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <BookTrainingButton />
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/home" element={<RequireAuth><Landing /></RequireAuth>} />
          <Route path="/self-assessment" element={<RequireAuth><SelfAssessment /></RequireAuth>} />
          <Route path="/training" element={<RequireAuth><Training /></RequireAuth>} />
          <Route path="/resources" element={<RequireAuth><Resources /></RequireAuth>} />
          <Route path="/inclusion" element={<RequireAuth><Inclusion /></RequireAuth>} />
          <Route path="/bookings" element={<RequireAuth><Bookings /></RequireAuth>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;