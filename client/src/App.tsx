// Mundo ONG App — "Warm Companion" design system
// Routes: Home, Adoção, Detalhe Animal, Ajuda, Detalhe Ajuda, ONGs, Detalhe ONG, Cadastrar ONG, Admin, ONG Login

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import FloatingChat from "@/components/FloatingChat";
import ScrollToTop from "@/components/ScrollToTop";
import GerenciarSenhas from "./pages/GerenciarSenhas";
import TermosDeUso from "./pages/TermosDeUso";
import PoliticaDePrivacidade from "./pages/PoliticaDePrivacidade";
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
import Admin from "./pages/Admin";
import OngLogin from "./pages/OngLogin";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/adocao" component={Adocao} />
      <Route path="/adocao/:id" component={AnimalDetalhe} />
      <Route path="/ajuda" component={Ajuda} />
      <Route path="/ajuda/:id" component={AjudaDetalhe} />
      <Route path="/ongs" component={Ongs} />
      <Route path="/admin" component={Admin} />
      <Route path="/ssenhas" component={GerenciarSenhas} />
      <Route path="/termos-de-uso" component={TermosDeUso} />
      <Route path="/politica-de-privacidade" component={PoliticaDePrivacidade} />
      <Route path="/ong-login" component={OngLogin} />
      <Route path="/ong-dashboard" component={OngLogin} />
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
          <Toaster
            position="top-right"
            closeButton
            toastOptions={{
              duration: 4000,
            }}
          />
          <ScrollToTop />
          <Router />
          <FloatingChat />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
