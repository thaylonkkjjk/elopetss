// Mundo ONG Navbar — "Warm Companion" design
// Sticky top nav with orange/blue palette, Nunito font, mobile hamburger menu

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Heart, LogIn, LogOut, User, ChevronDown } from 'lucide-react';
import LoginModal from './LoginModal';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

const navLinks = [
  { href: '/', label: 'Início' },
  { href: '/adocao', label: 'Adoção' },
  { href: '/ajuda', label: 'Pedidos de Ajuda' },
  { href: '/ongs', label: 'ONGs' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();
  const { data: currentOng } = trpc.ongAuth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const { data: currentAdmin } = trpc.adminAuth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const ongLogoutMutation = trpc.ongAuth.logout.useMutation();
  const adminLogoutMutation = trpc.adminAuth.logout.useMutation();

  const isLoggedIn = !!currentOng || !!currentAdmin;
  const userName = (currentOng as any)?.name || currentAdmin?.email?.split('@')[0] || '';
  const userAvatar = (currentOng as any)?.avatar_url || null;
  const isAdmin = !!currentAdmin;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    try {
      if (currentOng) {
        await ongLogoutMutation.mutateAsync();
        utils.ongAuth.me.setData(undefined, null);
        await utils.ongAuth.me.invalidate();
      } else {
        await adminLogoutMutation.mutateAsync();
        utils.adminAuth.me.setData(undefined, null);
        await utils.adminAuth.me.invalidate();
      }
      toast.success('Até logo!');
      setDropdownOpen(false);
      setLocation('/');
    } catch {
      toast.error('Erro ao sair. Tente novamente.');
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
        }`}
      >
        <div className="container">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" onClick={handleLogoClick}>
              <div className="flex items-center gap-2 group cursor-pointer">
                <img
                  src="/mundo-ong-logo.png"
                  alt="Mundo ONG Logo"
                  className="h-16 w-auto group-hover:scale-110 transition-transform"
                />
              </div>
            </Link>

            {/* Desktop Nav */}
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

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                /* ── Logged in: user menu ── */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all"
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-orange-100 shrink-0 flex items-center justify-center">
                      {userAvatar ? (
                        <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-orange-500">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 max-w-[120px] truncate">
                      {userName}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 overflow-hidden">
                      <Link href={isAdmin ? '/admin' : '/ong-login'}>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                          <User className="w-4 h-4" />
                          {isAdmin ? 'Painel Admin' : 'Meu Painel'}
                        </button>
                      </Link>

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sair da conta
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Not logged in ── */
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="text-gray-600 hover:text-orange-500 text-sm font-semibold py-2 px-4 flex items-center gap-1.5 transition-colors rounded-full hover:bg-orange-50"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </button>
              )}

              {!isLoggedIn && (
                <>
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
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white border-t border-gray-100 px-4 py-4 space-y-2">
            {isLoggedIn ? (
              /* ── Mobile: logged in ── */
              <>
                {/* User info */}
                <div className="flex items-center gap-3 px-4 py-3 bg-orange-50 rounded-xl mb-1">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-orange-200 shrink-0 flex items-center justify-center">
                    {userAvatar ? (
                      <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-orange-600">{userName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                    <p className="text-xs text-gray-500">{isAdmin ? 'Administrador' : 'ONG'}</p>
                  </div>
                </div>

                <Link href={isAdmin ? '/admin' : '/ong-login'}>
                  <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors">
                    <User className="w-4 h-4" />
                    {isAdmin ? 'Painel Admin' : 'Meu Painel'}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair da conta
                </button>
              </>
            ) : (
              /* ── Mobile: not logged in ── */
              <button
                onClick={() => { setLoginModalOpen(true); setIsOpen(false); }}
                className="w-full text-left px-4 py-2 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-500 text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Entrar
              </button>
            )}

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

            {!isLoggedIn && (
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
            )}
          </div>
        </div>
      </nav>

      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  );
}
