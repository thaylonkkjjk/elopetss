import { useState } from 'react';
import { useParams, Link } from 'wouter';
import {
  ArrowLeft, MapPin, Clock, AlertCircle, Heart, Package,
  Mail, CheckCircle, Loader2, PawPrint, Globe, Instagram,
  Users, MessageCircle, ChevronRight, X
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { trpc } from '@/lib/trpc';

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any; description: string }> = {
  request_food: {
    label: 'Pedido de Ração', icon: Package,
    color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100',
    description: 'Esta ONG precisa de ração para alimentar os animais sob seus cuidados.',
  },
  request_medicine: {
    label: 'Pedido de Remédios', icon: Heart,
    color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100',
    description: 'Medicamentos são urgentes para o tratamento dos animais desta ONG.',
  },
  request_other: {
    label: 'Pedido de Ajuda', icon: Users,
    color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100',
    description: 'Esta ONG precisa de apoio para continuar seu trabalho.',
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('55') ? digits : `55${digits}`;
}

export default function AjudaDetalhe() {
  const { id } = useParams<{ id: string }>();

  // ── TODOS os hooks ANTES de qualquer return ──────────────────────────────
  const { data: post, isLoading: loadingPost } = trpc.ongs.getPostById.useQuery(id || '', { enabled: !!id });
  const { data: allOngs, isLoading: loadingOngs } = trpc.ongs.getAllApproved.useQuery();
  const [showContact, setShowContact] = useState(false);
  // ─────────────────────────────────────────────────────────────────────────

  const isLoading = loadingPost || loadingOngs;
  const ong = post ? (allOngs?.find(o => o.id === (post as any).ong_id) as any) : null;
  const p = post as any;
  const config = p ? (TYPE_CONFIG[p.type] ?? TYPE_CONFIG.request_other) : TYPE_CONFIG.request_other;
  const Icon = config.icon;

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
        </div>
        <Footer />
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (!post || p.type === 'donation') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="container pt-32 pb-20 text-center flex-1">
          <div className="text-6xl mb-4">🤝</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Pedido não encontrado
          </h2>
          <p className="text-gray-400 mb-6 text-sm">Este pedido pode ter sido removido ou não existe.</p>
          <Link href="/ajuda">
            <button className="ep-btn-orange px-6 py-2.5">Ver outros pedidos</button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="pt-20 pb-16 flex-1">
        <div className="container">
          <div className="flex items-center gap-2 mb-6 mt-4">
            <Link href="/ajuda">
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-orange-500 text-sm font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" /> Voltar para Pedidos de Ajuda
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Image */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-lg bg-gradient-to-br from-orange-50 to-amber-100">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon className="w-24 h-24 text-orange-200" />
                  </div>
                )}
              </div>
              {p.is_urgent && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Urgente
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <div className={`inline-flex items-center gap-2 ${config.bg} ${config.color} text-sm font-semibold px-3 py-1.5 rounded-full mb-3 self-start border ${config.border}`}>
                <Icon className="w-4 h-4" />
                {config.label}
              </div>

              <h1 className="text-3xl font-black text-gray-800 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {p.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 flex-wrap">
                {ong && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{ong.city}, {ong.state}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(p.created_at)}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-2">Sobre este pedido</h3>
                <p className="text-gray-600 leading-relaxed">{p.description}</p>
              </div>

              <div className={`${config.bg} border ${config.border} rounded-2xl p-4 mb-6`}>
                <p className={`text-sm font-semibold ${config.color} mb-2`}>{config.description}</p>
                {p.items && (
                  <div className="flex items-start gap-2 text-sm text-gray-700 mt-2">
                    <CheckCircle className={`w-4 h-4 ${config.color} shrink-0 mt-0.5`} />
                    <span><span className="font-semibold">Itens necessários:</span> {p.items}</span>
                  </div>
                )}
              </div>

              {ong && (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    {ong.avatar_url && (
                      <img src={ong.avatar_url} alt={ong.name} className="w-12 h-12 rounded-xl object-cover border border-gray-200" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">ONG Responsável</p>
                      <p className="font-bold text-gray-800 text-lg" style={{ fontFamily: 'Nunito, sans-serif' }}>{ong.name}</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">{ong.description}</p>
                  <Link href={`/ongs/${ong.id}`}>
                    <button className="text-sm text-orange-500 font-semibold hover:underline flex items-center gap-1">
                      <PawPrint className="w-3.5 h-3.5" /> Ver página da ONG
                    </button>
                  </Link>
                </div>
              )}

              <button
                onClick={() => setShowContact(true)}
                className="ep-btn-orange text-base py-4 flex items-center justify-center gap-2 w-full"
              >
                <MessageCircle className="w-5 h-5" /> Entrar em contato
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Panel */}
      {showContact && ong && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowContact(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-gray-900" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Entrar em contato
                </h3>
                <button onClick={() => setShowContact(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6 bg-gray-50 rounded-2xl p-4">
                {ong.avatar_url && (
                  <img src={ong.avatar_url} alt={ong.name} className="w-12 h-12 rounded-xl object-cover" />
                )}
                <div>
                  <p className="font-bold text-gray-900">{ong.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {ong.city}, {ong.state}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {ong.phone && (
                  <a href={`https://wa.me/${formatPhone(ong.phone)}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-4 p-4 rounded-2xl bg-green-50 border border-green-100 hover:bg-green-100 transition-colors group">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">WhatsApp</p>
                      <p className="text-xs text-gray-500">{ong.phone}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-green-400 group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
                {ong.instagram && (
                  <a href={`https://instagram.com/${ong.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-4 p-4 rounded-2xl bg-pink-50 border border-pink-100 hover:bg-pink-100 transition-colors group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
                      <Instagram className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">Instagram</p>
                      <p className="text-xs text-gray-500">{ong.instagram}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-pink-400 group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
                {ong.website && (
                  <a href={ong.website} target="_blank" rel="noreferrer"
                    className="flex items-center gap-4 p-4 rounded-2xl bg-sky-50 border border-sky-100 hover:bg-sky-100 transition-colors group">
                    <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">Site oficial</p>
                      <p className="text-xs text-gray-500 truncate">{ong.website}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
                {ong.email && (
                  <a href={`mailto:${ong.email}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50 border border-orange-100 hover:bg-orange-100 transition-colors group">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">E-mail</p>
                      <p className="text-xs text-gray-500">{ong.email}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
