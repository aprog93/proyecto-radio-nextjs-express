import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "@/context/PlayerContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import NowPlaying from "./pages/NowPlaying";
import Schedule from "./pages/Schedule";
import Participate from "./pages/Participate";
import Community from "./pages/Community";
import Donate from "./pages/Donate";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Programs from "./pages/Programs";
import Events from "./pages/Events";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Blog from "./pages/Blog";
import History from "./pages/History";
import HowToParticipate from "./pages/HowToParticipate";
import Support from "./pages/Support";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Portal from "./pages/Portal";
import ProfileSettings from "./pages/ProfileSettings";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { Dashboard, NowPlayingPage as NowPlayingPageModule, PlaylistsPage } from "@/modules/azuracast";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <PlayerProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/now-playing" element={<NowPlaying />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/programacion" element={<Schedule />} />
                  <Route path="/participate" element={<Participate />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/donate" element={<Donate />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/programas" element={<Programs />} />
                  <Route path="/event" element={<Events />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/shop/cart" element={<Cart />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/historia" element={<History />} />
                  <Route path="/como-participar" element={<HowToParticipate />} />
                  <Route path="/apoyanos" element={<Support />} />
                  <Route path="/about-us" element={<Team />} />
                  <Route path="/contactus" element={<Contact />} />
                  <Route path="/web/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                   <Route path="/portal" element={<Portal />} />
                   <Route path="/portal/settings" element={<ProfileSettings />} />
                   <Route path="/reset-password" element={<ResetPassword />} />
                   <Route path="/stream-dashboard" element={<Dashboard />} />
                   <Route path="/stream-now-playing" element={<NowPlayingPageModule />} />
                   <Route path="/playlists" element={<PlaylistsPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </PlayerProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
