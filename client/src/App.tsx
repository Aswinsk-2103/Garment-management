import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function App() { return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster theme="dark" position="top-right" /><Switch><Route path="/" component={Home} /><Route path="/:rest*" component={Home} /></Switch></TooltipProvider></ThemeProvider></ErrorBoundary>; }
export default App;
