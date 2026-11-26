// Mundo ONG Footer — Dark navy blue background matching reference image
// Nunito font, orange/blue accent colors

import { Link } from 'wouter';
import { Mail, Phone, MapPin, Heart, Facebook, Instagram } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function Footer() {
  const { data: currentOng } = trpc.ongAuth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const { data: currentAdmin } = trpc.adminAuth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const isLoggedIn = !!currentOng || !!currentAdmin;

  return (
    <footer className="bg-slate-800 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/mundo-ong-logo.png"
                alt="Mundo ONG Logo"
                className="h-20 w-auto hover:scale-105 transition-transform"
              />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Conectando corações a patinhas. Ajudamos ONGs a cuidar dos animais e encontramos lares amorosos para quem precisa.
            </p>
            <div className="flex items-center gap-1 text-slate-400 text-sm">
              <span>Feito com</span>
              <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 mx-0.5" />
              <span>pelos animais</span>
            </div>
          </div>

          {/* Links rápidos */}
          <div>
            <h4 className="font-bold text-white mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Links Rápidos
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '/', label: 'Início' },
                { href: '/adocao', label: 'Adoção' },
                { href: '/ajuda', label: 'Pedidos de Ajuda' },
                { href: '/ongs', label: 'ONGs Parceiras' },
                ...(isLoggedIn ? [] : [{ href: '/ongs/cadastrar', label: 'Cadastrar ONG' }]),
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-slate-400 hover:text-orange-400 text-sm transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Como ajudar */}
          <div>
            <h4 className="font-bold text-white mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Como Ajudar
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '/adocao', label: 'Adotar um Pet' },
                { href: '/ajuda', label: 'Fazer Doação' },
                { href: '/ajuda', label: 'Ser Voluntário' },
                { href: '/ongs', label: 'Apoiar uma ONG' },
                ...(isLoggedIn ? [] : [{ href: '/ongs/cadastrar', label: 'Registrar sua ONG' }]),
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href}>
                    <span className="text-slate-400 hover:text-orange-400 text-sm transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-bold text-white mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Entre em Contato
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <span className="text-slate-400 text-sm">mundoongprojetos@gmail.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <span className="text-slate-400 text-sm">+55 (11) 99786-1921</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <span className="text-slate-400 text-sm">Brasil — Atendemos todo o território nacional</span>
              </li>
            </ul>

            {/* Social */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://www.facebook.com/share/1Mh8u3crzM/"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-slate-700 hover:bg-[#1877F2] rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/pjmundo_ong"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-slate-700 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-700">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-slate-500 text-xs">
            © 2026 Mundo ONG. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a href="/termos-de-uso" className="text-slate-500 hover:text-orange-400 text-xs transition-colors">Termos de Uso</a>
            <a href="/politica-de-privacidade" className="text-slate-500 hover:text-sky-400 text-xs transition-colors">Política de Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
