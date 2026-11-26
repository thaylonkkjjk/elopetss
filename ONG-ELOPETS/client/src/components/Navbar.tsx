import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Heart } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Início' },
  { href: '/adocao', label: 'Adoção' },
  { href: '/ajuda', label: 'Pedidos de Ajuda' },
  { href: '/ongs', label: 'ONGs' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-20">
          {/* logo, clica e volta pra home */}
          <Link href="/">
            <div className="flex items-center gap-2 group">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663509286533/ALSGtEaicPFzf5G3RQ9za7/ONG_elo_pets-removebg-preview_f50c376a.png"
                alt="EloPets Logo"
                className="h-16 w-auto group-hover:scale-110 transition-transform"
              />
            </div>
          </Link>

          {/* menu no desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    location === link.href
                      ? 'bg-orange-50 text-orange-500'
                      : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
                  }`}
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* botões de ação no desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/ongs/cadastrar">
              <button className="ep-btn-outline-orange text-sm py-2 px-4">
                Cadastrar ONG
              </button>
            </Link>
            <Link href="/adocao">
              <button className="ep-btn-orange text-sm py-2 px-4 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" />
                Adotar
              </button>
            </Link>
          </div>

          {/* botão do menu no celular */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* menu que abre no celular quando clica no hamburguer */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  location === link.href
                    ? 'bg-orange-50 text-orange-500'
                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
                }`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {link.label}
              </span>
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link href="/ongs/cadastrar">
              <button className="w-full ep-btn-outline-orange text-sm py-2.5">
                Cadastrar ONG
              </button>
            </Link>
            <Link href="/adocao">
              <button className="w-full ep-btn-orange text-sm py-2.5 flex items-center justify-center gap-1.5">
                <Heart className="w-3.5 h-3.5" />
                Adotar um Pet
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
