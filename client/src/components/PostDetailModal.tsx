// Mundo ONG PostDetailModal — Modal de detalhes de um anúncio (pet ou pedido de ajuda)
// Usado em qualquer lugar do site onde a pessoa clica em "Ver detalhes" / "Quero ajudar",
// para abrir o anúncio diretamente, sem precisar passar pelo perfil da ONG.

import { useState } from 'react';
import {
  MapPin, Mail, Globe, Instagram, Facebook, Link2, Heart, PawPrint, X,
  MessageCircle, ChevronRight, Flag,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { getReporterKey } from '@/lib/reporterKey';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errorMessage';

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('55') ? digits : `55${digits}`;
}

// ── Report button — denunciar anúncio (máx. 1 denúncia por pessoa) ─────────────
// Confirmação inline (não usa window.confirm) para funcionar em qualquer navegador/webview.
function ReportButton({ postId }: { postId: string }) {
  const [reported, setReported] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const reportMutation = trpc.ongs.reportPost.useMutation();

  if (reported) {
    return (
      <p className="text-center text-xs text-gray-400 mt-3">
        ✅ Denúncia enviada. Obrigado por ajudar a manter o Mundo ONG seguro.
      </p>
    );
  }

  const handleConfirmReport = async () => {
    try {
      await reportMutation.mutateAsync({ postId, reporterKey: getReporterKey() });
      setReported(true);
      toast.success('Denúncia enviada. Nossa equipe vai analisar este anúncio.');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center justify-center gap-3 mt-3 text-xs">
        <span className="text-gray-500">Denunciar este anúncio?</span>
        <button
          type="button"
          onClick={handleConfirmReport}
          disabled={reportMutation.isPending}
          className="font-semibold text-red-500 hover:text-red-600"
        >
          {reportMutation.isPending ? 'Enviando...' : 'Sim, denunciar'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={reportMutation.isPending}
          className="text-gray-400 hover:text-gray-600"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-red-500 mt-3 transition-colors"
    >
      <Flag className="w-3.5 h-3.5" />
      Denunciar anúncio
    </button>
  );
}

// ── Contact Panel ─────────────────────────────────────────────────────────────
const CONTACT_METHOD_STYLE: Record<string, { icon: any; bg: string; iconBg: string; border: string; text: string }> = {
  whatsapp: { icon: MessageCircle, bg: 'bg-green-50 hover:bg-green-100', iconBg: 'bg-green-500', border: 'border-green-100', text: 'text-green-400' },
  email: { icon: Mail, bg: 'bg-orange-50 hover:bg-orange-100', iconBg: 'bg-orange-500', border: 'border-orange-100', text: 'text-orange-400' },
  instagram: { icon: Instagram, bg: 'bg-pink-50 hover:bg-pink-100', iconBg: 'bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888]', border: 'border-pink-100', text: 'text-pink-400' },
  facebook: { icon: Facebook, bg: 'bg-blue-50 hover:bg-blue-100', iconBg: 'bg-blue-600', border: 'border-blue-100', text: 'text-blue-400' },
  website: { icon: Globe, bg: 'bg-sky-50 hover:bg-sky-100', iconBg: 'bg-sky-500', border: 'border-sky-100', text: 'text-sky-400' },
  other: { icon: Link2, bg: 'bg-gray-50 hover:bg-gray-100', iconBg: 'bg-gray-500', border: 'border-gray-100', text: 'text-gray-400' },
};

const CONTACT_METHOD_LABEL: Record<string, string> = {
  whatsapp: 'WhatsApp', email: 'E-mail', instagram: 'Instagram', facebook: 'Facebook', website: 'Site oficial', other: 'Outro',
};

function contactMethodHref(type: string, value: string): string {
  switch (type) {
    case 'whatsapp': return `https://wa.me/${formatPhone(value)}`;
    case 'email': return `mailto:${value}`;
    case 'instagram': return `https://instagram.com/${value.replace('@', '')}`;
    case 'website': return value;
    case 'facebook': return value;
    default: return value.startsWith('http') ? value : `https://${value}`;
  }
}

export function ContactPanel({ ong, onClose }: { ong: any; onClose: () => void }) {
  const { data: contactMethods } = trpc.ongs.listContactMethods.useQuery(ong?.id, { enabled: !!ong?.id });
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}>
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
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6 bg-gray-50 rounded-2xl p-4">
            {ong?.avatar_url && (
              <img src={ong.avatar_url} alt={ong.name} className="w-12 h-12 rounded-xl object-cover" />
            )}
            <div>
              <p className="font-bold text-gray-900">{ong?.name}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {ong?.city}, {ong?.state}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {(contactMethods || []).map((method: any) => {
              const style = CONTACT_METHOD_STYLE[method.type] || CONTACT_METHOD_STYLE.other;
              const Icon = style.icon;
              const label = method.label || CONTACT_METHOD_LABEL[method.type] || method.type;
              const isExternal = method.type !== 'email';
              return (
                <a
                  key={method.id}
                  href={contactMethodHref(method.type, method.value)}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noreferrer' : undefined}
                  className={`flex items-center gap-4 p-4 rounded-2xl border ${style.bg} ${style.border} transition-colors group`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{label}</p>
                    <p className="text-xs text-gray-500 truncate">{method.value}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${style.text} group-hover:translate-x-1 transition-transform`} />
                </a>
              );
            })}
            {(!contactMethods || contactMethods.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum meio de contato disponível no momento.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Pet Detail Panel ──────────────────────────────────────────────────────────
function PetDetailPanel({ post, ong, onClose, onContact }: { post: any; ong: any; onClose: () => void; onContact: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {post.image_url ? (
          <div className="relative h-56 overflow-hidden sm:rounded-t-3xl">
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
            {post.is_urgent && (
              <div className="absolute top-4 left-4">
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">🚨 Urgente</span>
              </div>
            )}
            <button onClick={onClose} className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="h-40 bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center sm:rounded-t-3xl relative">
            <PawPrint className="w-20 h-20 text-orange-200" />
            <button onClick={onClose} className="absolute top-4 right-4 hover:bg-black/10 rounded-full p-2 transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}

        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-black text-gray-900 mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {post.pet_name || post.title}
            </h2>
            {post.pet_breed && <p className="text-gray-500 text-sm">{post.pet_breed}</p>}
          </div>

          {(post.type === 'donation') && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.pet_age && <span className="bg-orange-50 text-orange-600 text-xs px-3 py-1 rounded-full font-medium">🎂 {post.pet_age}</span>}
              {post.pet_gender && <span className="bg-pink-50 text-pink-600 text-xs px-3 py-1 rounded-full font-medium">
                {post.pet_gender === 'Macho' ? '♂' : '♀'} {post.pet_gender}
              </span>}
              {post.pet_size && <span className="bg-amber-50 text-amber-600 text-xs px-3 py-1 rounded-full font-medium">📏 {post.pet_size}</span>}
              {post.pet_color && <span className="bg-gray-50 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">🎨 {post.pet_color}</span>}
              {post.pet_vaccinated && <span className="bg-green-50 text-green-600 text-xs px-3 py-1 rounded-full font-medium">✅ Vacinado</span>}
              {post.pet_castrated && <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full font-medium">✅ Castrado</span>}
            </div>
          )}

          {post.description && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-1">Sobre</p>
              <p className="text-gray-600 text-sm leading-relaxed">{post.description}</p>
            </div>
          )}

          {post.items && (
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 mb-5">
              <p className="text-xs font-bold text-sky-700 mb-1">Itens necessários</p>
              <p className="text-sm text-gray-600">{post.items}</p>
            </div>
          )}

          {ong && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-5">
              {ong.avatar_url && <img src={ong.avatar_url} alt={ong.name} className="w-9 h-9 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium">ONG responsável</p>
                <p className="font-semibold text-gray-800 text-sm truncate">{ong.name}</p>
              </div>
              <span className="text-xs text-gray-400">{ong.city}/{ong.state}</span>
            </div>
          )}

          <button
            onClick={onContact}
            className="w-full ep-btn-orange py-3.5 text-base font-bold flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Entrar em contato
          </button>

          <ReportButton postId={post.id} />
        </div>
      </div>
    </div>
  );
}

// ── Request Detail Panel ──────────────────────────────────────────────────────
function RequestDetailPanel({ post, ong, onClose, onContact }: { post: any; ong: any; onClose: () => void; onContact: () => void }) {
  const TYPE_DETAILS: Record<string, { label: string; emoji: string; color: string; bg: string; desc: string }> = {
    request_food:     { label: 'Ração', emoji: '🥣', color: 'text-green-700', bg: 'bg-green-50 border-green-100', desc: 'Esta ONG precisa de ração para alimentar os animais sob seus cuidados.' },
    request_medicine: { label: 'Remédios', emoji: '💊', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-100', desc: 'Medicamentos são urgentes para o tratamento dos animais desta ONG.' },
    request_other:    { label: 'Ajuda', emoji: '📦', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-100', desc: 'Esta ONG precisa de apoio para continuar seu trabalho.' },
  };
  const cfg = TYPE_DETAILS[post.type] ?? TYPE_DETAILS.request_other;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {post.image_url ? (
          <div className="relative h-52 overflow-hidden sm:rounded-t-3xl">
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
            {post.is_urgent && <div className="absolute top-4 left-4"><span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">🚨 Urgente</span></div>}
            <button onClick={onClose} className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-br from-sky-50 to-orange-50 flex items-center justify-center sm:rounded-t-3xl relative">
            <span className="text-5xl">{cfg.emoji}</span>
            <button onClick={onClose} className="absolute top-4 right-4 hover:bg-black/10 rounded-full p-2 transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
          </div>
        )}

        <div className="p-6">
          <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border mb-3 ${cfg.bg} ${cfg.color}`}>
            {cfg.emoji} Pedido de {cfg.label}
            {post.is_urgent && <span className="text-red-600">· Urgente</span>}
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>{post.title}</h2>

          <p className="text-gray-600 text-sm leading-relaxed mb-4">{post.description}</p>

          <div className={`border rounded-xl p-4 mb-5 ${cfg.bg}`}>
            <p className={`text-xs font-bold mb-1 ${cfg.color}`}>{cfg.desc}</p>
            {post.items && (
              <p className="text-sm text-gray-700 mt-2">📋 <span className="font-semibold">Itens:</span> {post.items}</p>
            )}
          </div>

          {ong && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-5">
              {ong.avatar_url && <img src={ong.avatar_url} alt={ong.name} className="w-9 h-9 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium">ONG responsável</p>
                <p className="font-semibold text-gray-800 text-sm truncate">{ong.name}</p>
              </div>
            </div>
          )}

          <button
            onClick={onContact}
            className="w-full ep-btn-orange py-3.5 text-base font-bold flex items-center justify-center gap-2"
          >
            <Heart className="w-5 h-5" /> Quero ajudar esta ONG
          </button>

          <ReportButton postId={post.id} />
        </div>
      </div>
    </div>
  );
}

// ── PostDetailModal: ponto único de entrada ────────────────────────────────────
// Abre direto o anúncio (pet ou pedido de ajuda) e, a partir dele, o painel de contato.
export default function PostDetailModal({ post, ong, onClose }: { post: any; ong: any; onClose: () => void }) {
  const [showContact, setShowContact] = useState(false);
  const isDonation = post.type === 'donation';

  return (
    <>
      {!showContact && (
        isDonation
          ? <PetDetailPanel post={post} ong={ong} onClose={onClose} onContact={() => setShowContact(true)} />
          : <RequestDetailPanel post={post} ong={ong} onClose={onClose} onContact={() => setShowContact(true)} />
      )}
      {showContact && (
        <ContactPanel ong={ong} onClose={() => { setShowContact(false); onClose(); }} />
      )}
    </>
  );
}
