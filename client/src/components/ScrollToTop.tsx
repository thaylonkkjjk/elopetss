// Mundo ONG ScrollToTop — garante que toda navegação abre a página no topo,
// em vez de manter a posição de scroll da página anterior.
import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}
