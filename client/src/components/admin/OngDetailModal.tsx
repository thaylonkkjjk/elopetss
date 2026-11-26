import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { getErrorMessage } from '@/lib/errorMessage';
import { toast } from 'sonner';
import {
  Building2, Trash2, Clock, FileText, History, LogIn,
  CheckCircle2, PencilLine, XCircle, RotateCcw,
} from 'lucide-react';
import PostDetailDialog from './PostDetailDialog';

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

type SubTab = 'overview' | 'posts' | 'history' | 'logins';

const HISTORY_ACTION: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  created:     { label: 'Criado',    color: 'bg-blue-100 text-blue-700',   icon: <FileText className="w-3.5 h-3.5" /> },
  updated:     { label: 'Editado',   color: 'bg-amber-100 text-amber-700', icon: <PencilLine className="w-3.5 h-3.5" /> },
  deleted:     { label: 'Apagado',   color: 'bg-red-100 text-red-700',     icon: <XCircle className="w-3.5 h-3.5" /> },
  reactivated: { label: 'Reativado', color: 'bg-green-100 text-green-700', icon: <RotateCcw className="w-3.5 h-3.5" /> },
};

interface OngDetailModalProps {
  ong: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteOng: (ongId: string) => Promise<void> | void;
  deletingOng?: boolean;
}

export default function OngDetailModal({ ong, open, onOpenChange, onDeleteOng, deletingOng }: OngDetailModalProps) {
  const [subTab, setSubTab] = useState<SubTab>('overview');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  const ongId = ong?.id;

  const { data: posts, isLoading: loadingPosts, refetch: refetchPosts } =
    trpc.ongs.getOngPostsAdminAll.useQuery(ongId, { enabled: !!ongId && open });
  const { data: postHistory, isLoading: loadingHistory } =
    trpc.ongs.getOngPostHistory.useQuery(ongId, { enabled: !!ongId && open });
  const { data: logins, isLoading: loadingLogins } =
    trpc.ongs.getOngLoginHistory.useQuery(ongId, { enabled: !!ongId && open });

  const deletePostMutation = trpc.ongs.deletePost.useMutation();

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePostMutation.mutateAsync(postId);
      toast.success('Post removido com sucesso.');
      setSelectedPost(null);
      refetchPosts();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  if (!ong) return null;

  const activePosts = (posts || []).filter((p: any) => p.is_active);
  const subTabs: { id: SubTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Visão geral', icon: <Building2 className="w-4 h-4" /> },
    { id: 'posts', label: 'Posts ativos', icon: <FileText className="w-4 h-4" />, count: activePosts.length },
    { id: 'history', label: 'Histórico de posts', icon: <History className="w-4 h-4" />, count: postHistory?.length },
    { id: 'logins', label: 'Logins', icon: <LogIn className="w-4 h-4" />, count: logins?.length },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setSubTab('overview'); setConfirmDelete(false); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 pr-6">
              {ong.avatar_url ? (
                <img src={ong.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
              ) : (
                <div className="bg-orange-100 p-2 rounded-lg shrink-0">
                  <Building2 className="w-5 h-5 text-orange-500" />
                </div>
              )}
              <span className="truncate">{ong.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${ong.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                {ong.is_active ? 'Ativa' : 'Desativada'}
              </span>
            </DialogTitle>
          </DialogHeader>

          {/* Sub-tabs */}
          <div className="flex flex-wrap gap-1 border-b border-gray-100 -mt-2">
            {subTabs.map(t => (
              <button
                key={t.id}
                onClick={() => setSubTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                  subTab === t.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.icon}
                {t.label}
                {t.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${subTab === t.id ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Visão geral ── */}
          {subTab === 'overview' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">{ong.description}</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-gray-700">
                <span>📧 {ong.email}</span>
                <span>📍 {ong.city}/{ong.state}</span>
                {ong.phone && <span>📞 {ong.phone}</span>}
                {ong.website && <span>🌐 {ong.website}</span>}
                {ong.instagram && <span>📸 {ong.instagram}</span>}
                <span>🕐 Cadastrada em {formatDate(ong.created_at)}</span>
                <span>
                  <LogIn className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                  Último login: {ong.last_login_at ? formatDate(ong.last_login_at) : 'Nunca logou'}
                </span>
              </div>
              {(ong.cnpj || ong.responsible_name) && (
                <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-gray-600">
                  <p className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wide">Dados administrativos</p>
                  {ong.cnpj && <span>🏢 CNPJ: {ong.cnpj}</span>}
                  {ong.responsible_name && <span>👤 Responsável: {ong.responsible_name}</span>}
                  {ong.responsible_cpf && <span>🪪 CPF: {ong.responsible_cpf}</span>}
                </div>
              )}

              <div className="pt-3 border-t border-gray-100">
                {confirmDelete ? (
                  <div className="flex gap-2">
                    <Button className="bg-red-500 hover:bg-red-600 text-white" disabled={deletingOng}
                      onClick={async () => { await onDeleteOng(ong.id); setConfirmDelete(false); }}>
                      Confirmar exclusão da ONG
                    </Button>
                    <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
                  </div>
                ) : (
                  <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-2"
                    onClick={() => setConfirmDelete(true)}>
                    <Trash2 className="w-4 h-4" /> Apagar ONG e todos os posts
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* ── Posts ativos ── */}
          {subTab === 'posts' && (
            <div className="space-y-2">
              {loadingPosts ? (
                <p className="text-sm text-gray-400">Carregando...</p>
              ) : !activePosts.length ? (
                <p className="text-sm text-gray-400">Nenhum anúncio ativo no momento.</p>
              ) : (
                activePosts.map((post: any) => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="w-full flex items-center justify-between gap-3 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100 rounded-lg px-3 py-2.5 text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{post.pet_name || post.title}</p>
                      <p className="text-xs text-gray-400">Criado em {formatDate(post.created_at)}</p>
                    </div>
                    {post.is_urgent && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium shrink-0">🚨</span>}
                  </button>
                ))
              )}
            </div>
          )}

          {/* ── Histórico de posts ── */}
          {subTab === 'history' && (
            <div className="space-y-2">
              {loadingHistory ? (
                <p className="text-sm text-gray-400">Carregando...</p>
              ) : !postHistory?.length ? (
                <p className="text-sm text-gray-400">Nenhum evento registrado ainda.</p>
              ) : (
                postHistory.map((h: any) => {
                  const a = HISTORY_ACTION[h.action] || { label: h.action, color: 'bg-gray-100 text-gray-700', icon: <Clock className="w-3.5 h-3.5" /> };
                  const snap = h.snapshot || {};
                  return (
                    <div key={h.id} className="flex items-center justify-between gap-3 bg-white border border-gray-100 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`shrink-0 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${a.color}`}>
                          {a.icon} {a.label}
                        </span>
                        <p className="text-sm text-gray-700 truncate">{snap.pet_name || snap.title}</p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{formatDate(h.changed_at)}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── Logins ── */}
          {subTab === 'logins' && (
            <div className="space-y-2">
              {loadingLogins ? (
                <p className="text-sm text-gray-400">Carregando...</p>
              ) : !logins?.length ? (
                <p className="text-sm text-gray-400">Esta ONG ainda não fez login.</p>
              ) : (
                logins.map((l: any) => (
                  <div key={l.id} className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <p className="text-sm text-gray-700">Login em {formatDate(l.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PostDetailDialog
        post={selectedPost}
        ongName={ong.name}
        open={!!selectedPost}
        onOpenChange={(v) => { if (!v) setSelectedPost(null); }}
        onDelete={handleDeletePost}
        deleting={deletePostMutation.isPending}
      />
    </>
  );
}
