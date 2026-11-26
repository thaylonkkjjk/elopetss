import { useState } from 'react';
import { getErrorMessage } from '@/lib/errorMessage';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle, CheckCircle, XCircle, LogOut, Users,
  FileText, ClipboardList, ChevronRight,
  Trash2, Clock, Building2,
  PawPrint, ScrollText, Flag
} from 'lucide-react';
import { useLocation } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import OngDetailModal from '@/components/admin/OngDetailModal';
import PostDetailDialog from '@/components/admin/PostDetailDialog';

type Tab = 'pending' | 'ongs' | 'posts' | 'applications' | 'reports' | 'logs';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Pendente',  color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Aprovada',  color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejeitada', color: 'bg-red-100 text-red-800' },
};

export default function Admin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [selectedOngId, setSelectedOngId] = useState<string | null>(null);
  const [confirmDeleteOng, setConfirmDeleteOng] = useState<string | null>(null);
  const [confirmDeletePost, setConfirmDeletePost] = useState<string | null>(null);
  const [detailOng, setDetailOng] = useState<any | null>(null);
  const [detailPost, setDetailPost] = useState<any | null>(null);

  const utils = trpc.useUtils();

  // Queries
  const { data: currentAdmin } = trpc.adminAuth.me.useQuery(undefined, {
    retry: false, refetchOnWindowFocus: false,
  });
  const { data: pendingOngs, refetch: refetchPending } = trpc.ongs.listPending.useQuery(
    { status: 'pending' }, { enabled: !!currentAdmin }
  );
  const { data: allOngs, refetch: refetchOngs } = trpc.ongs.getAllOngsAdmin.useQuery(
    undefined, { enabled: !!currentAdmin }
  );
  const { data: allPosts, refetch: refetchPosts } = trpc.ongs.getAllPostsAdmin.useQuery(
    undefined, { enabled: !!currentAdmin }
  );
  const { data: allApplications } = trpc.ongs.getAllApplications.useQuery(
    undefined, { enabled: !!currentAdmin }
  );
  const { data: adminLogs } = trpc.ongs.getLogs.useQuery(
    undefined, { enabled: !!currentAdmin && activeTab === 'logs' }
  );
  const { data: reportedPosts, refetch: refetchReportedPosts } = trpc.ongs.getReportedPosts.useQuery(
    undefined, { enabled: !!currentAdmin && activeTab === 'reports' }
  );

  // Mutations
  const loginMutation = trpc.adminAuth.login.useMutation();
  const logoutMutation = trpc.adminAuth.logout.useMutation();
  const approveMutation = trpc.ongs.approve.useMutation();
  const rejectMutation = trpc.ongs.reject.useMutation();
  const deleteOngMutation = trpc.ongs.deleteOng.useMutation();
  const deletePostMutation = trpc.ongs.deletePost.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      setPassword('');
      utils.adminAuth.me.setData(undefined, result.admin);
      await utils.adminAuth.me.invalidate();
      toast.success('Login realizado com sucesso!');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    utils.adminAuth.me.setData(undefined, null);
    await utils.adminAuth.me.invalidate();
    toast.success('Logout realizado!');
    setLocation('/');
  };

  const handleApprove = async (ongId: string) => {
    try {
      await approveMutation.mutateAsync({ ongId });
      setSelectedOngId(null);
      toast.success('ONG aprovada com sucesso!');
      refetchPending();
      refetchOngs();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleReject = async (ongId: string) => {
    try {
      await rejectMutation.mutateAsync({ ongId });
      toast.success('ONG rejeitada.');
      refetchPending();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteOng = async (ongId: string) => {
    try {
      await deleteOngMutation.mutateAsync({ ongId });
      setConfirmDeleteOng(null);
      if (detailOng?.id === ongId) setDetailOng(null);
      toast.success('ONG e todos os seus posts foram removidos.');
      refetchOngs();
      refetchPosts();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePostMutation.mutateAsync(postId);
      setConfirmDeletePost(null);
      if (detailPost?.id === postId) setDetailPost(null);
      toast.success('Post removido com sucesso.');
      refetchPosts();
      refetchReportedPosts();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  // ─── LOGIN ─────────────────────────────────────────────────────────────────
  if (!currentAdmin) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-100 p-3 rounded-xl">
                <PawPrint className="w-7 h-7 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel Admin</h1>
                <p className="text-sm text-gray-500">Mundo ONG — Área Restrita</p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="admin@mundoong.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  // ─── DASHBOARD ─────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'pending',      label: 'Pendentes',     icon: <Clock className="w-4 h-4" />,        count: pendingOngs?.length },
    { id: 'ongs',         label: 'ONGs Ativas',   icon: <Building2 className="w-4 h-4" />,    count: allOngs?.filter(o => o.is_active).length },
    { id: 'posts',        label: 'Posts',         icon: <FileText className="w-4 h-4" />,     count: allPosts?.length },
    { id: 'applications', label: 'Candidaturas',  icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'reports',      label: 'Denúncias',     icon: <Flag className="w-4 h-4" />,         count: reportedPosts?.length },
    { id: 'logs',         label: 'Logs',          icon: <ScrollText className="w-4 h-4" /> },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <PawPrint className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Painel Admin</h1>
                <p className="text-xs text-gray-500">{currentAdmin.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50">
              <LogOut className="w-4 h-4" /> Sair
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-0">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600 bg-orange-50/50 sm:bg-transparent'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 sm:hover:bg-transparent'
                  }`}
                >
                  {tab.icon}
                  <span className="truncate">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                      activeTab === tab.id ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                    }`}>{tab.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">

          {/* ── TAB: PENDENTES ── */}
          {activeTab === 'pending' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">ONGs aguardando aprovação</h2>
              {!pendingOngs?.length ? (
                <div className="text-center py-16 text-gray-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                  <p className="font-medium">Nenhuma ONG pendente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingOngs.map(ong => (
                    <Card key={ong.id} className="p-5">
                      <div className="flex flex-col md:flex-row md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-lg">{ong.name}</h3>
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pendente</Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{ong.description}</p>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                            <span>📧 {ong.email}</span>
                            <span>📍 {ong.city} – {ong.state}</span>
                            {ong.phone && <span>📞 {ong.phone}</span>}
                            {ong.website && <span>🌐 {ong.website}</span>}
                            {ong.instagram && <span>📸 {ong.instagram}</span>}
                            <span>🕐 Enviado em {formatDate(ong.created_at)}</span>
                          </div>
                          {(ong.cnpj || ong.responsible_name) && (
                            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                              {ong.cnpj && <span>🏢 CNPJ: {ong.cnpj}</span>}
                              {ong.responsible_name && <span>👤 Responsável: {ong.responsible_name}</span>}
                              {ong.responsible_cpf && <span>🪪 CPF: {ong.responsible_cpf}</span>}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 min-w-[160px]">
                          {selectedOngId === ong.id ? (
                            <>
                              <Button
                                onClick={() => handleApprove(ong.id)}
                                className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4" />
                                {approveMutation.isPending ? 'Aprovando...' : 'Confirmar'}
                              </Button>
                              <Button variant="outline" onClick={() => setSelectedOngId(null)}>
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button onClick={() => setSelectedOngId(ong.id)} className="bg-green-500 hover:bg-green-600 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Aprovar
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleReject(ong.id)}
                                className="border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-2"
                                disabled={rejectMutation.isPending}
                              >
                                <XCircle className="w-4 h-4" /> Rejeitar
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: ONGs ATIVAS ── */}
          {activeTab === 'ongs' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">ONGs aprovadas</h2>
              {!allOngs?.filter(o => o.is_active).length ? (
                <div className="text-center py-16 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3" />
                  <p>Nenhuma ONG aprovada ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allOngs?.filter(o => o.is_active).map(ong => (
                    <Card key={ong.id} className="overflow-hidden">
                      <div
                        className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                        onClick={() => setDetailOng(ong)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-100 p-2 rounded-lg">
                            <Building2 className="w-5 h-5 text-orange-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{ong.name}</p>
                            <p className="text-sm text-gray-500">{ong.email} · {ong.city}/{ong.state}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Último login: {(ong as any).last_login_at ? formatDate((ong as any).last_login_at) : 'Nunca logou'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {confirmDeleteOng === ong.id ? (
                            <>
                              <Button
                                size="sm"
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={e => { e.stopPropagation(); handleDeleteOng(ong.id); }}
                                disabled={deleteOngMutation.isPending}
                              >
                                Confirmar exclusão
                              </Button>
                              <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); setConfirmDeleteOng(null); }}>
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              onClick={e => { e.stopPropagation(); setConfirmDeleteOng(ong.id); }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: POSTS ── */}
          {activeTab === 'posts' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Posts das ONGs</h2>
              {!allPosts?.length ? (
                <div className="text-center py-16 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3" />
                  <p>Nenhum post publicado ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allPosts.map((post: any) => (
                    <Card key={post.id} className="p-4 flex justify-between items-start gap-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => setDetailPost(post)}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            post.type === 'donation' ? 'bg-blue-100 text-blue-700' :
                            post.type === 'request_food' ? 'bg-green-100 text-green-700' :
                            post.type === 'request_medicine' ? 'bg-purple-100 text-purple-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {post.type === 'donation' ? 'Doação' :
                             post.type === 'request_food' ? 'Pedido: Alimento' :
                             post.type === 'request_medicine' ? 'Pedido: Remédio' : 'Pedido: Outro'}
                          </span>
                          {post.is_urgent && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">🚨 Urgente</span>}
                        </div>
                        <p className="font-semibold text-gray-900">{post.title}</p>
                        <p className="text-sm text-gray-500 mt-1">{post.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          ONG: <span className="font-medium">{post.ong_name || post.ong_id}</span> · {formatDate(post.created_at)}
                        </p>
                      </div>
                      <div onClick={e => e.stopPropagation()}>
                        {confirmDeletePost === post.id ? (
                          <div className="flex flex-col gap-1">
                            <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white text-xs"
                              onClick={() => handleDeletePost(post.id)} disabled={deletePostMutation.isPending}>
                              Confirmar
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => setConfirmDeletePost(null)}>
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => setConfirmDeletePost(post.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: CANDIDATURAS ── */}
          {activeTab === 'applications' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Histórico de candidaturas</h2>
              {!allApplications?.length ? (
                <div className="text-center py-16 text-gray-400">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3" />
                  <p>Nenhuma candidatura registrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allApplications.map(app => {
                    const st = STATUS_LABELS[app.status] ?? { label: app.status, color: 'bg-gray-100 text-gray-700' };
                    return (
                      <Card key={app.id} className="p-5">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-gray-900">{app.name}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${st.color}`}>{st.label}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{app.description}</p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                              <span>📧 {app.email}</span>
                              <span>📍 {app.city} – {app.state}</span>
                              {app.phone && <span>📞 {app.phone}</span>}
                              {app.website && <span>🌐 {app.website}</span>}
                              {app.instagram && <span>📸 {app.instagram}</span>}
                              <span className="text-gray-400 text-xs">Enviado em {formatDate(app.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: DENÚNCIAS ── */}
          {activeTab === 'reports' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Posts denunciados</h2>
              {!reportedPosts?.length ? (
                <div className="text-center py-16 text-gray-400">
                  <Flag className="w-12 h-12 mx-auto mb-3" />
                  <p>Nenhum post denunciado até agora</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reportedPosts.map((post: any) => (
                    <Card
                      key={post.id}
                      className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => setDetailPost(post)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="bg-red-100 p-2 rounded-lg shrink-0">
                          <Flag className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{post.pet_name || post.title}</p>
                          <p className="text-sm text-gray-500 truncate">
                            ONG: <span className="font-medium">{post.ong_name || post.ong_id}</span>
                            {!post.is_active && <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Desativado</span>}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full bg-red-500 text-white whitespace-nowrap">
                        {post.report_count} denúncia{post.report_count !== 1 ? 's' : ''}
                      </span>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: LOGS ── */}
          {activeTab === 'logs' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Logs de ações do admin</h2>
              {!adminLogs?.length ? (
                <div className="text-center py-16 text-gray-400">
                  <ScrollText className="w-12 h-12 mx-auto mb-3" />
                  <p>Nenhum log registrado ainda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {adminLogs.map(log => {
                    const ACTION_LABELS: Record<string, { label: string; color: string }> = {
                      approve:     { label: 'Aprovou ONG',  color: 'bg-green-100 text-green-700' },
                      reject:      { label: 'Rejeitou ONG', color: 'bg-red-100 text-red-700' },
                      delete_ong:  { label: 'Apagou ONG',   color: 'bg-red-100 text-red-700' },
                      delete_post: { label: 'Apagou post',  color: 'bg-orange-100 text-orange-700' },
                    };
                    const a = ACTION_LABELS[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-700' };
                    return (
                      <Card key={log.id} className="p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${a.color}`}>{a.label}</span>
                          <p className="text-sm text-gray-700 truncate">{log.target_name}</p>
                        </div>
                        <div className="text-xs text-gray-400 text-right shrink-0">
                          <p>{log.admin_email}</p>
                          <p>{formatDate(log.created_at)}</p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      <Footer />

      <OngDetailModal
        ong={detailOng}
        open={!!detailOng}
        onOpenChange={(v) => { if (!v) setDetailOng(null); }}
        onDeleteOng={handleDeleteOng}
        deletingOng={deleteOngMutation.isPending}
      />
      <PostDetailDialog
        post={detailPost}
        ongName={detailPost?.ong_name}
        open={!!detailPost}
        onOpenChange={(v) => { if (!v) setDetailPost(null); }}
        onDelete={handleDeletePost}
        deleting={deletePostMutation.isPending}
      />
    </>
  );
}
