import { Link } from 'wouter';
import { Home, PawPrint } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container pt-32 pb-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-[120px] leading-none select-none mb-2">🐾</div>
          <div className="text-8xl font-black text-orange-100 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>404</div>
          <h1 className="text-2xl font-black text-gray-800 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Página não encontrada
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Parece que este pet fugiu! A página que você está procurando não existe ou foi movida.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <button className="ep-btn-orange px-6 py-3 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Voltar ao Início
              </button>
            </Link>
            <Link href="/adocao">
              <button className="ep-btn-blue px-6 py-3 flex items-center gap-2">
                <PawPrint className="w-4 h-4" />
                Ver Adoções
              </button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
