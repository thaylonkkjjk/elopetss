import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { getErrorMessage } from '@/lib/errorMessage';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  AlertCircle, LogOut, Plus, Trash2, Pencil, PawPrint, Settings,
  ImagePlus, FileText, ChevronDown, ChevronUp, Upload, X,
  MessageCircle, Mail, Instagram, Facebook, Globe, Link2, Check, Loader2, KeyRound,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import Navbar from '@/components/Navbar';
import ImageCropPicker from '@/components/ImageCropPicker';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

type Tab = 'posts' | 'create' | 'profile';

// Redimensiona imagem e converte para base64 comprimido
// Mantém tamanho pequeno para carregamento rápido sem depender de Storage externo
function imgToBase64(file: File, maxW = 600, maxH = 400, quality = 0.6): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const ratio = Math.min(maxW / width, maxH / height, 1);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      res(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = rej;
    img.src = url;
  });
}

// Simple image preview picker
function ImagePicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        className="border-2 border-dashed border-gray-200 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-orange-300 transition-colors"
        onClick={() => ref.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt="" className="h-14 w-14 rounded-lg object-cover shrink-0" />
            <div className="flex-1 text-sm text-gray-500">Imagem selecionada</div>
            <button type="button" className="text-red-400 hover:text-red-600" onClick={e => { e.stopPropagation(); onChange(''); }}>
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <Upload className="w-6 h-6 text-gray-300" />
            <span className="text-sm text-gray-400">Clique para escolher uma imagem</span>
          </>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={async e => {
        const file = e.target.files?.[0];
        if (file) { const b64 = await imgToBase64(file); onChange(b64); }
      }} />
    </div>
  );
}

export default function OngLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  // Post form
  const [postType, setPostType] = useState<'donation' | 'request_food' | 'request_medicine' | 'request_other'>('donation');
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postItems, setPostItems] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [postImage, setPostImage] = useState('');
  // Pet fields (donation only)
  const [petName, setPetName] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petGender, setPetGender] = useState('');
  const [petSize, setPetSize] = useState('');
  const [petColor, setPetColor] = useState('');
  const [petVaccinated, setPetVaccinated] = useState(false);
  const [petCastrated, setPetCastrated] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Profile form
  const [profileName, setProfileName] = useState('');
  const [profileDescription, setProfileDescription] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [profileState, setProfileState] = useState('');
  const [profileWebsite, setProfileWebsite] = useState('');
  const [profileInstagram, setProfileInstagram] = useState('');
  const [profileBanner, setProfileBanner] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [savingContactInfo, setSavingContactInfo] = useState(false);
  const [profileChangeCodeOpen, setProfileChangeCodeOpen] = useState(false);
  const [profileChangeCode, setProfileChangeCode] = useState('');
  const [confirmingCode, setConfirmingCode] = useState(false);

  // Meios de contato (Entrar em contato)
  const CONTACT_TYPE_OPTIONS: { value: string; label: string }[] = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'email', label: 'E-mail' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'website', label: 'Site' },
    { value: 'other', label: 'Outro' },
  ];
  const [showAddMethodForm, setShowAddMethodForm] = useState(false);
  const [newMethodType, setNewMethodType] = useState('whatsapp');
  const [newMethodLabel, setNewMethodLabel] = useState('');
  const [newMethodValue, setNewMethodValue] = useState('');
  const [addingMethodLoading, setAddingMethodLoading] = useState(false);
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [editingMethodValue, setEditingMethodValue] = useState('');

  const utils = trpc.useUtils();

  const { data: currentOng } = trpc.ongAuth.me.useQuery(undefined, {
    retry: false, refetchOnWindowFocus: false,
  });

  // Populate profile form when ONG data loads
  useEffect(() => {
    if (currentOng && !profileLoaded) {
      setProfileName((currentOng as any).name || '');
      setProfileDescription((currentOng as any).description || '');
      setProfilePhone((currentOng as any).phone || '');
      setProfileCity((currentOng as any).city || '');
      setProfileState((currentOng as any).state || '');
      setProfileWebsite((currentOng as any).website || '');
      setProfileInstagram((currentOng as any).instagram || '');
      setProfileBanner((currentOng as any).banner_url || '');
      setProfileAvatar((currentOng as any).avatar_url || '');
      setProfileLoaded(true);
    }
  }, [currentOng, profileLoaded]);

  const { data: ongPosts, refetch: refetchPosts } = trpc.ongs.getPostsByOng.useQuery(
    currentOng?.id || '', { enabled: !!currentOng?.id }
  );

  const loginMutation = trpc.ongAuth.login.useMutation();
  const logoutMutation = trpc.ongAuth.logout.useMutation();
  const createPostMutation = trpc.ongs.createPost.useMutation();
  const updatePostMutation = trpc.ongs.updatePost.useMutation();
  const deletePostMutation = trpc.ongs.deletePost.useMutation();
  const updateProfileMutation = trpc.ongs.updateProfile.useMutation();
  const requestProfileChangeMutation = trpc.ongs.requestProfileChange.useMutation();
  const confirmProfileChangeMutation = trpc.ongs.confirmProfileChange.useMutation();

  const { data: contactMethods, refetch: refetchContactMethods } = trpc.ongs.listMyContactMethods.useQuery(
    undefined, { enabled: !!currentOng }
  );
  const addContactMethodMutation = trpc.ongs.addContactMethod.useMutation();
  const updateContactMethodMutation = trpc.ongs.updateContactMethod.useMutation();
  const deleteContactMethodMutation = trpc.ongs.deleteContactMethod.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      setPassword('');
      utils.ongAuth.me.setData(undefined, result.ong);
      await utils.ongAuth.me.invalidate();
      toast.success('Login realizado com sucesso!');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    toast.success('Logout realizado!');
    setLocation('/');
  };

  const resetPostForm = () => {
    setPostTitle(''); setPostDescription(''); setPostItems('');
    setIsUrgent(false); setPostImage(''); setPostType('donation');
    setPetName(''); setPetAge(''); setPetBreed(''); setPetGender('');
    setPetSize(''); setPetColor(''); setPetVaccinated(false); setPetCastrated(false);
    setEditingPostId(null);
  };

  const handleStartEditPost = (post: any) => {
    setEditingPostId(post.id);
    setPostType(post.type);
    setPostTitle(post.title || '');
    setPostDescription(post.description || '');
    setPostItems(post.items || '');
    setIsUrgent(!!post.is_urgent);
    setPostImage(post.image_url || '');
    setPetName(post.pet_name || '');
    setPetAge(post.pet_age || '');
    setPetBreed(post.pet_breed || '');
    setPetGender(post.pet_gender || '');
    setPetSize(post.pet_size || '');
    setPetColor(post.pet_color || '');
    setPetVaccinated(!!post.pet_vaccinated);
    setPetCastrated(!!post.pet_castrated);
    setActiveTab('create');
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postDescription.trim()) { toast.error('Preencha título e descrição'); return; }
    setIsCreatingPost(true);
    try {
      const petFields = {
        pet_name: postType === 'donation' ? petName || undefined : undefined,
        pet_age: postType === 'donation' ? petAge || undefined : undefined,
        pet_breed: postType === 'donation' ? petBreed || undefined : undefined,
        pet_gender: postType === 'donation' ? petGender || undefined : undefined,
        pet_size: postType === 'donation' ? petSize || undefined : undefined,
        pet_color: postType === 'donation' ? petColor || undefined : undefined,
        pet_vaccinated: postType === 'donation' ? petVaccinated : undefined,
        pet_castrated: postType === 'donation' ? petCastrated : undefined,
      };

      if (editingPostId) {
        await updatePostMutation.mutateAsync({
          postId: editingPostId,
          type: postType,
          title: postTitle,
          description: postDescription,
          items: postItems || undefined,
          isUrgent,
          image_url: postImage || undefined,
          ...petFields,
        });
        toast.success('Post atualizado com sucesso!');
      } else {
        await createPostMutation.mutateAsync({
          ongId: currentOng!.id,
          type: postType,
          title: postTitle,
          description: postDescription,
          items: postItems || undefined,
          isUrgent,
          image_url: postImage || undefined,
          ...petFields,
        });
        toast.success('Post criado com sucesso!');
      }
      resetPostForm();
      refetchPosts();
      setActiveTab('posts');
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este post?')) return;
    try {
      await deletePostMutation.mutateAsync(postId);
      toast.success('Post deletado!');
      refetchPosts();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOng) return;
    setIsSavingProfile(true);
    try {
      const result = await updateProfileMutation.mutateAsync({
        ongId: currentOng.id,
        name: profileName,
        description: profileDescription,
        state: profileState,
        banner_url: profileBanner,
        avatar_url: profileAvatar,
      });
      utils.ongAuth.me.setData(undefined, result.ong);
      await utils.ongAuth.me.invalidate();
      toast.success('Perfil atualizado com sucesso!');
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Telefone/site/cidade/instagram exigem confirmação por código enviado ao email
  const handleRequestContactChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContactInfo(true);
    try {
      const result = await requestProfileChangeMutation.mutateAsync({
        phone: profilePhone,
        city: profileCity,
        website: profileWebsite,
        instagram: profileInstagram,
      });
      if (result.changed) {
        setProfileChangeCodeOpen(true);
        toast.success('Enviamos um código de confirmação para o seu email.');
      } else {
        toast.message('Nenhuma alteração para confirmar.');
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingContactInfo(false);
    }
  };

  const handleConfirmProfileChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileChangeCode.length !== 6) {
      toast.error('Digite o código de 6 dígitos enviado para o seu email.');
      return;
    }
    setConfirmingCode(true);
    try {
      const result = await confirmProfileChangeMutation.mutateAsync({ code: profileChangeCode });
      utils.ongAuth.me.setData(undefined, result.ong);
      await utils.ongAuth.me.invalidate();
      setProfilePhone((result.ong as any).phone || '');
      setProfileCity((result.ong as any).city || '');
      setProfileWebsite((result.ong as any).website || '');
      setProfileInstagram((result.ong as any).instagram || '');
      setProfileChangeCodeOpen(false);
      setProfileChangeCode('');
      toast.success('Informações atualizadas com sucesso!');
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setConfirmingCode(false);
    }
  };

  const handleAddContactMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethodValue.trim()) {
      toast.error('Preencha o valor do meio de contato.');
      return;
    }
    setAddingMethodLoading(true);
    try {
      await addContactMethodMutation.mutateAsync({
        type: newMethodType as any,
        label: newMethodLabel.trim() || undefined,
        value: newMethodValue.trim(),
      });
      await refetchContactMethods();
      setNewMethodValue('');
      setNewMethodLabel('');
      setShowAddMethodForm(false);
      toast.success('Meio de contato adicionado!');
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setAddingMethodLoading(false);
    }
  };

  const handleToggleContactMethod = async (id: string, enabled: boolean) => {
    try {
      await updateContactMethodMutation.mutateAsync({ id, enabled });
      await refetchContactMethods();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSaveEditedMethod = async (id: string) => {
    if (!editingMethodValue.trim()) {
      toast.error('O valor não pode ficar vazio.');
      return;
    }
    try {
      await updateContactMethodMutation.mutateAsync({ id, value: editingMethodValue.trim() });
      await refetchContactMethods();
      setEditingMethodId(null);
      toast.success('Meio de contato atualizado!');
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteContactMethod = async (id: string) => {
    if (!window.confirm('Remover este meio de contato?')) return;
    try {
      await deleteContactMethodMutation.mutateAsync({ id });
      await refetchContactMethods();
      toast.success('Meio de contato removido!');
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const CONTACT_TYPE_ICON: Record<string, any> = {
    whatsapp: MessageCircle, email: Mail, instagram: Instagram,
    facebook: Facebook, website: Globe, other: Link2,
  };
  const CONTACT_TYPE_STYLE: Record<string, string> = {
    whatsapp: 'bg-green-50 text-green-600', email: 'bg-orange-50 text-orange-600',
    instagram: 'bg-pink-50 text-pink-600', facebook: 'bg-blue-50 text-blue-600',
    website: 'bg-sky-50 text-sky-600', other: 'bg-gray-100 text-gray-600',
  };

  // ─── LOGIN ──────────────────────────────────────────────────────────
  if (!currentOng) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4 py-20">
          <Card className="w-full max-w-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-100 p-3 rounded-xl"><PawPrint className="w-7 h-7 text-orange-500" /></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel da ONG</h1>
                <p className="text-sm text-gray-500">Mundo ONG — Área da Organização</p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" disabled={isLoading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" disabled={isLoading} />
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-5">
              Não tem conta? <a href="/ongs/cadastrar" className="text-orange-500 font-semibold hover:underline">Cadastre-se</a>
            </p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── DASHBOARD ──────────────────────────────────────────────────────
  const tabs = [
    { id: 'posts' as Tab,   label: 'Meus Posts',    icon: <FileText className="w-4 h-4" /> },
    { id: 'create' as Tab,  label: 'Criar Post',    icon: <Plus className="w-4 h-4" /> },
    { id: 'profile' as Tab, label: 'Meu Perfil',    icon: <Settings className="w-4 h-4" /> },
  ];

  const isDonation = postType === 'donation';

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Header */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-orange-100">
                {(currentOng as any).avatar_url
                  ? <img src={(currentOng as any).avatar_url} className="w-full h-full object-cover" alt="" />
                  : <PawPrint className="w-full h-full p-2 text-orange-400" />
                }
              </div>
              <div>
                <p className="font-bold text-gray-900">{currentOng.name}</p>
                <p className="text-xs text-gray-500">{currentOng.city}/{currentOng.state}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50">
              <LogOut className="w-4 h-4" /> Sair
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 flex gap-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => { if (tab.id === 'create') resetPostForm(); setActiveTab(tab.id); }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">

          {/* ── POSTS LIST ── */}
          {activeTab === 'posts' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Meus Posts ({ongPosts?.length || 0})</h2>
              {!ongPosts?.length ? (
                <div className="text-center py-16 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3" />
                  <p className="mb-3">Nenhum post ainda.</p>
                  <Button onClick={() => setActiveTab('create')} className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="w-4 h-4 mr-2" /> Criar primeiro post
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {ongPosts.map(post => (
                    <Card key={post.id} className="p-4 flex gap-4 items-start">
                      {(post as any).image_url && (
                        <img src={(post as any).image_url} alt="" className="w-20 h-16 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            post.type === 'donation' ? 'bg-blue-100 text-blue-700' :
                            post.type === 'request_food' ? 'bg-green-100 text-green-700' :
                            post.type === 'request_medicine' ? 'bg-purple-100 text-purple-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {post.type === 'donation' ? 'Doação' : post.type === 'request_food' ? 'Ração' : post.type === 'request_medicine' ? 'Remédio' : 'Outro'}
                          </span>
                          {(post as any).is_urgent && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">🚨 Urgente</span>}
                        </div>
                        <p className="font-semibold text-gray-900 truncate">{post.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{post.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(post.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => handleStartEditPost(post)}
                          className="border-gray-200 text-gray-600 hover:bg-gray-50">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeletePost(post.id)}
                          className="border-red-200 text-red-500 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CREATE / EDIT POST ── */}
          {activeTab === 'create' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingPostId ? 'Editar Post' : 'Criar Novo Post'}
                </h2>
                {editingPostId && (
                  <Button type="button" variant="outline" size="sm" onClick={() => { resetPostForm(); setActiveTab('posts'); }}>
                    Cancelar edição
                  </Button>
                )}
              </div>
              <Card className="p-6">
                <form onSubmit={handleSubmitPost} className="space-y-5">
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Post *</label>
                    <select value={postType} onChange={e => setPostType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm">
                      <option value="donation">🐾 Anúncio de Doação (animal)</option>
                      <option value="request_food">🥣 Pedido de Ração</option>
                      <option value="request_medicine">💊 Pedido de Remédios</option>
                      <option value="request_other">📦 Outro Pedido</option>
                    </select>
                  </div>

                  {/* Title + Urgent */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                      <Input value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder="Ex: Cachorros para adoção" />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} className="w-4 h-4" />
                        <span className="text-sm font-medium text-gray-700">Marcar como urgente 🚨</span>
                      </label>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                    <textarea value={postDescription} onChange={e => setPostDescription(e.target.value)}
                      rows={3} placeholder="Descreva o post em detalhes..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none text-sm" />
                  </div>

                  {/* Image */}
                  <ImagePicker label="Foto (opcional)" value={postImage} onChange={setPostImage} />

                  {/* Pet fields (donation only) */}
                  {isDonation && (
                    <div className="bg-orange-50 rounded-xl p-4 space-y-4">
                      <p className="text-sm font-semibold text-orange-700 flex items-center gap-2">
                        <PawPrint className="w-4 h-4" /> Informações do Animal
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Nome do animal</label>
                          <Input value={petName} onChange={e => setPetName(e.target.value)} placeholder="Ex: Rex" className="text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Raça</label>
                          <Input value={petBreed} onChange={e => setPetBreed(e.target.value)} placeholder="Ex: Vira-lata" className="text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Idade</label>
                          <Input value={petAge} onChange={e => setPetAge(e.target.value)} placeholder="Ex: 2 anos" className="text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Sexo</label>
                          <select value={petGender} onChange={e => setPetGender(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm">
                            <option value="">Não informado</option>
                            <option value="Macho">Macho</option>
                            <option value="Fêmea">Fêmea</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Porte</label>
                          <select value={petSize} onChange={e => setPetSize(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm">
                            <option value="">Não informado</option>
                            <option value="Pequeno">Pequeno</option>
                            <option value="Médio">Médio</option>
                            <option value="Grande">Grande</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Cor / pelagem</label>
                          <Input value={petColor} onChange={e => setPetColor(e.target.value)} placeholder="Ex: Caramelo" className="text-sm" />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input type="checkbox" checked={petVaccinated} onChange={e => setPetVaccinated(e.target.checked)} className="w-4 h-4" />
                          Vacinado
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input type="checkbox" checked={petCastrated} onChange={e => setPetCastrated(e.target.checked)} className="w-4 h-4" />
                          Castrado
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Items (non-donation) */}
                  {!isDonation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Itens necessários (opcional)</label>
                      <Input value={postItems} onChange={e => setPostItems(e.target.value)} placeholder="Ex: 10kg de ração, vitaminas" />
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 flex items-center gap-2" disabled={isCreatingPost}>
                    {editingPostId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isCreatingPost
                      ? (editingPostId ? 'Salvando...' : 'Criando...')
                      : (editingPostId ? 'Salvar Alterações' : 'Publicar Post')}
                  </Button>
                </form>
              </Card>
            </div>
          )}

          {/* ── PROFILE ── */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* ── Perfil básico (sem exigir código) ── */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Meu Perfil</h2>
                <Card className="p-6">
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <ImageCropPicker
                      label="Banner (imagem de capa)"
                      value={profileBanner}
                      onChange={setProfileBanner}
                      aspectRatio={16/4}
                      outputWidth={600}
                      outputHeight={150}
                      hint="Recomendado: 1200×300px — arraste para reposicionar"
                    />
                    <ImageCropPicker
                      label="Foto de perfil / avatar"
                      value={profileAvatar}
                      onChange={setProfileAvatar}
                      aspectRatio={1}
                      outputWidth={200}
                      outputHeight={200}
                      hint="Recomendado: quadrado 400×400px"
                    />

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da ONG</label>
                        <Input value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Nome da organização" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado (UF)</label>
                        <Input value={profileState} onChange={e => setProfileState(e.target.value)} maxLength={2} placeholder="SP" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea value={profileDescription} onChange={e => setProfileDescription(e.target.value)}
                        rows={3} placeholder="Conte um pouco sobre a sua ONG..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none text-sm" />
                    </div>

                    <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isSavingProfile}>
                      {isSavingProfile ? 'Salvando...' : 'Salvar Perfil'}
                    </Button>
                  </form>
                </Card>
              </div>

              {/* ── Informações protegidas (telefone/cidade/site/instagram) — exigem código por email ── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <KeyRound className="w-4 h-4 text-sky-500" />
                  <h2 className="text-lg font-bold text-gray-900">Telefone, Site, Cidade e Instagram</h2>
                </div>
                <Card className="p-6">
                  <p className="text-sm text-gray-500 mb-4">
                    Por segurança, qualquer alteração nessas informações só é salva depois de confirmar um código enviado para o seu email cadastrado.
                  </p>
                  <form onSubmit={handleRequestContactChange} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                        <Input value={profilePhone} onChange={e => setProfilePhone(e.target.value)} placeholder="(00) 00000-0000" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                        <Input value={profileCity} onChange={e => setProfileCity(e.target.value)} placeholder="Sua cidade" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
                        <Input value={profileWebsite} onChange={e => setProfileWebsite(e.target.value)} placeholder="https://seusite.com.br" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                        <Input value={profileInstagram} onChange={e => setProfileInstagram(e.target.value)} placeholder="@suaong" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600" disabled={savingContactInfo}>
                      {savingContactInfo ? 'Enviando código...' : 'Salvar e confirmar por email'}
                    </Button>
                  </form>
                </Card>
              </div>

              {/* ── Meios de contato (Entrar em contato) ── */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Meios de Contato</h2>
                <Card className="p-6">
                  <p className="text-sm text-gray-500 mb-4">
                    Escolha quais meios de contato aparecem para quem quiser falar com a sua ONG. Você pode ativar, desativar, editar ou adicionar novos a qualquer momento.
                  </p>

                  <div className="space-y-2.5 mb-4">
                    {(contactMethods || []).map((method: any) => {
                      const Icon = CONTACT_TYPE_ICON[method.type] || Link2;
                      const style = CONTACT_TYPE_STYLE[method.type] || CONTACT_TYPE_STYLE.other;
                      const typeLabel = CONTACT_TYPE_OPTIONS.find(o => o.value === method.type)?.label || method.type;
                      const isEditing = editingMethodId === method.id;
                      return (
                        <div key={method.id} className={`flex items-center gap-3 p-3 rounded-xl border ${method.enabled ? 'border-gray-100 bg-gray-50' : 'border-gray-100 bg-white opacity-60'}`}>
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-500">{method.label || typeLabel}</p>
                            {isEditing ? (
                              <Input
                                autoFocus
                                value={editingMethodValue}
                                onChange={e => setEditingMethodValue(e.target.value)}
                                className="h-8 mt-1"
                              />
                            ) : (
                              <p className="text-sm text-gray-800 truncate">{method.value}</p>
                            )}
                          </div>
                          {isEditing ? (
                            <button type="button" onClick={() => handleSaveEditedMethod(method.id)} className="text-green-500 hover:text-green-600 shrink-0">
                              <Check className="w-4 h-4" />
                            </button>
                          ) : (
                            <button type="button" onClick={() => { setEditingMethodId(method.id); setEditingMethodValue(method.value); }} className="text-gray-400 hover:text-gray-600 shrink-0">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button type="button" onClick={() => handleDeleteContactMethod(method.id)} className="text-gray-400 hover:text-red-500 shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <Switch
                            checked={method.enabled}
                            onCheckedChange={(checked) => handleToggleContactMethod(method.id, checked)}
                          />
                        </div>
                      );
                    })}
                    {(!contactMethods || contactMethods.length === 0) && (
                      <p className="text-sm text-gray-400 text-center py-4">Nenhum meio de contato cadastrado ainda.</p>
                    )}
                  </div>

                  {showAddMethodForm ? (
                    <form onSubmit={handleAddContactMethod} className="space-y-3 p-4 rounded-xl border border-dashed border-gray-200">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                          <select
                            value={newMethodType}
                            onChange={e => setNewMethodType(e.target.value)}
                            className="w-full h-9 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          >
                            {CONTACT_TYPE_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Rótulo (opcional)</label>
                          <Input value={newMethodLabel} onChange={e => setNewMethodLabel(e.target.value)} placeholder="Ex: WhatsApp Adoções" className="h-9" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Valor</label>
                        <Input
                          value={newMethodValue}
                          onChange={e => setNewMethodValue(e.target.value)}
                          placeholder={newMethodType === 'email' ? 'contato@suaong.org' : newMethodType === 'instagram' ? '@suaong' : newMethodType === 'whatsapp' ? '(00) 00000-0000' : 'https://...'}
                          className="h-9"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" className="bg-orange-500 hover:bg-orange-600" disabled={addingMethodLoading}>
                          {addingMethodLoading ? 'Adicionando...' : 'Adicionar'}
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setShowAddMethodForm(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button type="button" variant="outline" className="w-full flex items-center gap-2" onClick={() => setShowAddMethodForm(true)}>
                      <Plus className="w-4 h-4" /> Adicionar meio de contato
                    </Button>
                  )}
                </Card>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal de confirmação de código para alteração de telefone/site/cidade/instagram */}
      {profileChangeCodeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setProfileChangeCodeOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900">Confirme a alteração</h3>
              <button type="button" onClick={() => setProfileChangeCodeOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Enviamos um código de 6 dígitos para o seu email. Digite-o abaixo para confirmar a alteração.
            </p>
            <form onSubmit={handleConfirmProfileChange} className="space-y-3">
              <Input
                autoFocus
                inputMode="numeric"
                maxLength={6}
                value={profileChangeCode}
                onChange={e => setProfileChangeCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center text-lg tracking-widest font-bold"
              />
              <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600" disabled={confirmingCode}>
                {confirmingCode ? 'Confirmando...' : 'Confirmar alteração'}
              </Button>
              <button
                type="button"
                onClick={handleRequestContactChange as any}
                disabled={savingContactInfo}
                className="w-full text-xs font-semibold text-gray-400 hover:text-orange-500"
              >
                {savingContactInfo ? 'Reenviando...' : 'Não recebeu? Reenviar código'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
