import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Posts from "./pages/Posts";
import CreateBusiness from "./pages/CreateBusiness";
import Clients from "./pages/Clients";
import Topics from "./pages/Topics";
import Analytics from "./pages/Analytics";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1 overflow-x-hidden">
              <header className="sticky top-0 z-10 flex h-12 sm:h-14 items-center border-b bg-background px-3 sm:px-4">
                <SidebarTrigger />
              </header>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/topics" element={<Topics />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/create-business" element={<CreateBusiness />} />
                <Route path="/connect-social" element={<Index />} />
                <Route path="/help" element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
