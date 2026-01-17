import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ActivityDetail from "./pages/ActivityDetail";
import Activities from "./pages/Activities";
import StoriesMusic from "./pages/StoriesMusic";
import Achievements from "./pages/Achievements";
import Development from "./pages/Development";
import Profile from "./pages/Profile";
import Shop from "./pages/Shop";
import Admin from "./pages/Admin";
import Activation from "./pages/Activation";
import Upgrade from "./pages/Upgrade";
import PaymentResult from "./pages/PaymentResult";
import Guide from "./pages/Guide";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/activity/:id" element={<ActivityDetail />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/stories-music" element={<StoriesMusic />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/development" element={<Development />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/activation" element={<Activation />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/payment-result" element={<PaymentResult />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/install" element={<Install />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
