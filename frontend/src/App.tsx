import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import AttackSimulator from "./pages/AttackSimulator";
import NotFound from "./pages/NotFound";
import ChatBot from "./components/dashboard/ChatBot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/simulator" element={<AttackSimulator />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ChatBot />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
