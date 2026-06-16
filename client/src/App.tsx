import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import QuizGate from "./pages/QuizGate";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CreatePool from "./pages/CreatePool";
import PoolDetail from "./pages/PoolDetail";
import Upgrade from "./pages/Upgrade";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

function Router() {
  


  return (
    <Switch>
      <Route path="/" component={QuizGate} />
      <Route path="/home" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/create" component={CreatePool} />
      <Route path="/pool/:slug" component={PoolDetail} />
      <Route path="/upgrade" component={Upgrade} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
