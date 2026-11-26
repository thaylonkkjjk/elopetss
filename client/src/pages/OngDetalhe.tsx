import { useState, useEffect } from 'react';
import { useParams, Link, useSearch, useLocation } from 'wouter';
import {
  ArrowLeft, MapPin, Mail, Phone, Calendar, Globe, Instagram,
  Heart, FileText, PawPrint, Loader2, ExternalLink, Facebook,
  MessageCircle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import PostDetailModal, { ContactPanel } from '@/components/PostDetailModal';

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  donation:         { label: 'Adoção',          color: 'bg-orange-100 text-orange-700' },
  request_food:     { label: 'Pedido: Ração',   color: 'bg-green-100 text-green-700' },
  request_medicine: { label: 'Pedido: Remédio', color: 'bg-purple-100 text-purple-700' },
  request_other:    { label: 'Pedido: Outro',   color: 'bg-sky-100 text-sky-700' },
};

// ── PostCard ──────────────────────────────────────────────────────────────────
function PostCard({ post, ong }: { post: any; ong: any }) {
  const [showDetail, setShowDetail] = useState(false);
  const type = TYPE_LABELS[post.type] ?? { label: post.type, color: 'bg-gray-100 text-gray-700' };
  const isDonation = post.type === 'donation';

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
        {post.image_url ? (
          <div className="h-44 overflow-hidden shrink-0">
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        ) : isDonation ? (
          <div className="h-44 bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center shrink-0">
            <PawPrint className="w-16 h-16 text-orange-200" />
          </div>
        ) : (
          <div className="h-24 bg-gradient-to-br from-sky-50 to-orange-50 flex items-center justify-center shrink-0">
            <Heart className="w-10 h-10 text-orange-200" />
          </div>
        )}

        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${type.color}`}>{type.label}</span>
            {post.is_urgent && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">🚨 Urgente</span>}
          </div>

          <h3 className="font-bold text-gray-900 mb-1">{post.pet_name || post.title}</h3>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-1">{post.description}</p>

          {isDonation && (post.pet_age || post.pet_breed || post.pet_gender) && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.pet_age    && <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{post.pet_age}</span>}
              {post.pet_gender && <span className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full">{post.pet_gender}</span>}
              {post.pet_size   && <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">{post.pet_size}</span>}
            </div>
          )}

          <button
            onClick={() => setShowDetail(true)}
            className="w-full ep-btn-orange text-sm py-2.5 flex items-center justify-center gap-1.5 mt-auto"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {isDonation ? 'Ver detalhes' : 'Quero ajudar'}
          </button>
        </div>
      </Card>

      {showDetail && (
        <PostDetailModal post={post} ong={ong} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OngDetalhe() {
  const { id } = useParams<{ id: string }>();
  const search = useSearch();
  const [, navigate] = useLocation();
  const [showContact, setShowContact] = useState(false);

  // Deep link: /ongs/:id?post=:postId — abre o anúncio direto, com o perfil da ONG no fundo.
  const deepLinkPostId = new URLSearchParams(search).get('post');
  const [deepLinkedPost, setDeepLinkedPost] = useState<any>(null);
  const [deepLinkHandled, setDeepLinkHandled] = useState(false);

  const { data: ong, isLoading: loadingOng } = trpc.ongs.getById.useQuery(id || '', { enabled: !!id });
  const { data: posts, isLoading: loadingPosts } = trpc.ongs.getPostsByOng.useQuery(id || '', { enabled: !!id });

  useEffect(() => {
    if (deepLinkPostId && posts && !deepLinkHandled) {
      const found = posts.find((p: any) => p.id === deepLinkPostId);
      if (found) setDeepLinkedPost({ ...found, ong });
      setDeepLinkHandled(true);
    }
  }, [deepLinkPostId, posts, ong, deepLinkHandled]);

  if (loadingOng) {
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

  if (!ong) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="container pt-32 pb-20 text-center flex-1">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>ONG não encontrada</h2>
          <Link href="/ongs"><button className="ep-btn-blue px-6 py-2.5">Ver todas as ONGs</button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const ongData = ong as any;
  const donationPosts = posts?.filter(p => p.type === 'donation') || [];
  const requestPosts  = posts?.filter(p => p.type !== 'donation')  || [];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="pt-16 pb-16 flex-1">
        {/* Banner */}
        <div className="relative h-56 bg-gradient-to-br from-sky-400 to-orange-400 overflow-hidden">
          {ongData.banner_url && (
            <img src={ongData.banner_url} alt="Banner" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/30" />

          {/* Back button — sobre o banner, longe do avatar que fica abaixo */}
          <div className="absolute top-4 left-4 z-20">
            <Link href="/ongs">
              <button className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-orange-500 text-sm font-medium px-3 py-1.5 rounded-full shadow-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Voltar para ONGs
              </button>
            </Link>
          </div>
        </div>

        <div className="container">
          {/* Profile card */}
          <div className="bg-white rounded-2xl shadow-md -mt-8 relative z-10 p-6 mb-8 flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow border-2 border-white -mt-14 bg-white">
              {ongData.avatar_url ? (
                <img
                  src={ongData.avatar_url}
                  alt={ong.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-sky-100 flex items-center justify-center">
                  <PawPrint className="w-8 h-8 text-orange-300" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-black text-gray-800 mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>{ong.name}</h1>
              <p className="text-gray-600 mb-4 text-sm">{ong.description}</p>

              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-orange-400" /><span>{ong.city}, {ong.state}</span></div>
                {ong.email && <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-orange-400" /><span>{ong.email}</span></div>}
                {ong.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-orange-400" /><span>{ong.phone}</span></div>}
                {ongData.website && <a href={ongData.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sky-500 hover:underline"><Globe className="w-3.5 h-3.5" /><span>Site</span></a>}
                {ongData.instagram && <a href={`https://instagram.com/${ongData.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-pink-500 hover:underline"><Instagram className="w-3.5 h-3.5" /><span>{ongData.instagram}</span></a>}
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-orange-400" /><span>Desde {new Date(ong.created_at).getFullYear()}</span></div>
              </div>

              {/* Fixed social links */}
              <div className="flex items-center gap-2 mt-3">
                <a
                  href="https://www.instagram.com/pjmundo_ong"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-white px-3 py-1.5 rounded-full transition-colors"
                  style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}
                >
                  <Instagram className="w-3.5 h-3.5" /> Instagram
                </a>
                <a
                  href="https://www.facebook.com/share/1Mh8u3crzM/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-white bg-[#1877F2] hover:bg-[#1665d8] px-3 py-1.5 rounded-full transition-colors"
                >
                  <Facebook className="w-3.5 h-3.5" /> Facebook
                </a>
              </div>
            </div>

            <div className="flex sm:flex-col gap-3 shrink-0 w-full sm:w-auto">
              <div className="flex sm:flex-col gap-3 flex-1">
                <div className="bg-orange-50 rounded-xl p-4 text-center flex-1">
                  <PawPrint className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                  <p className="text-2xl font-black text-orange-500">{donationPosts.length}</p>
                  <p className="text-xs text-gray-500">Animais</p>
                </div>
                <div className="bg-sky-50 rounded-xl p-4 text-center flex-1">
                  <Heart className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                  <p className="text-2xl font-black text-sky-500">{requestPosts.length}</p>
                  <p className="text-xs text-gray-500">Pedidos</p>
                </div>
              </div>
              <button
                onClick={() => setShowContact(true)}
                className="ep-btn-orange text-sm py-2 px-4 flex items-center gap-2 sm:w-full justify-center self-end sm:self-auto"
              >
                <MessageCircle className="w-4 h-4" /> Contato
              </button>
            </div>
          </div>

          {/* Posts */}
          {loadingPosts ? (
            <div className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin text-orange-400 mx-auto" /></div>
          ) : !posts?.length ? (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3" />
              <p>Esta ONG ainda não publicou nenhum post.</p>
            </div>
          ) : (
            <div>
              <div className="mb-10">
                <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  <PawPrint className="w-5 h-5 text-orange-400" /> Animais para Adoção
                </h2>
                {donationPosts.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl">
                    <PawPrint className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                    <p className="text-sm">Sem animais para adoção no momento.</p>
                  </div>
                ) : donationPosts.length === 1 ? (
                  <div className="max-w-sm mx-auto">
                    <PostCard post={donationPosts[0]} ong={ongData} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {donationPosts.map(post => <PostCard key={post.id} post={post} ong={ongData} />)}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  <Heart className="w-5 h-5 text-orange-400" /> Pedidos de Ajuda
                </h2>
                {requestPosts.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl">
                    <Heart className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                    <p className="text-sm">Sem pedidos de ajuda no momento.</p>
                  </div>
                ) : requestPosts.length === 1 ? (
                  <div className="max-w-sm mx-auto">
                    <PostCard post={requestPosts[0]} ong={ongData} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {requestPosts.map(post => <PostCard key={post.id} post={post} ong={ongData} />)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showContact && <ContactPanel ong={ongData} onClose={() => setShowContact(false)} />}
      {deepLinkedPost && (
        <PostDetailModal
          post={deepLinkedPost}
          ong={ongData}
          onClose={() => { setDeepLinkedPost(null); navigate(`/ongs/${id}`, { replace: true }); }}
        />
      )}
      <Footer />
    </div>
  );
}
