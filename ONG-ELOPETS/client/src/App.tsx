import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Adocao from "./pages/Adocao";
import AnimalDetalhe from "./pages/AnimalDetalhe";
import Ajuda from "./pages/Ajuda";
import AjudaDetalhe from "./pages/AjudaDetalhe";
import Ongs from "./pages/Ongs";
import OngDetalhe from "./pages/OngDetalhe";
import CadastrarOng from "./pages/CadastrarOng";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/adocao" component={Adocao} />
      <Route path="/adocao/:id" component={AnimalDetalhe} />
      <Route path="/ajuda" component={Ajuda} />
      <Route path="/ajuda/:id" component={AjudaDetalhe} />
      <Route path="/ongs" component={Ongs} />
      {/* essa rota precisa vir antes da /ongs/:id, senão o wouter confunde "cadastrar" com um id */}
      <Route path="/ongs/cadastrar" component={CadastrarOng} />
      <Route path="/ongs/:id" component={OngDetalhe} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
