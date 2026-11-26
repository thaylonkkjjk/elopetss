import { useParams, Link } from 'wouter';
import { ArrowLeft, MapPin, Clock, AlertCircle, Heart, Package, Users, Phone, Mail, CheckCircle } from 'lucide-react';
import { getHelpRequestById, getOngById, formatDate } from '@/lib/data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const typeConfig = {
  dinheiro: {
    label: 'Doação em Dinheiro',
    icon: Heart,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    description: 'Sua doação em dinheiro ajuda a ONG a comprar o que precisam com mais urgência.',
  },
  itens: {
    label: 'Doação de Itens',
    icon: Package,
    color: 'text-sky-500',
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    description: 'Doe os itens listados abaixo diretamente para a ONG ou combine a entrega.',
  },
  voluntariado: {
    label: 'Voluntariado',
    icon: Users,
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-100',
    description: 'Ofereça seu tempo e habilidades para ajudar diretamente na ONG.',
  },
};

export default function AjudaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const request = getHelpRequestById(id);
  const ong = request ? getOngById(request.ongId) : null;

  if (!request) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container pt-32 pb-20 text-center">
          <div className="text-6xl mb-4">🤝</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Pedido não encontrado
          </h2>
          <Link href="/ajuda">
            <button className="ep-btn-orange px-6 py-2.5">Ver outros pedidos</button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const config = typeConfig[request.type];
  const Icon = config.icon;

  const handleHelp = () => {
    toast.success('Obrigado pela sua generosidade! Entre em contato com a ONG.', {
      description: `${ong?.name} — ${ong?.email}`,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20 pb-16">
        <div className="container">
          {/* botão de voltar */}
          <div className="flex items-center gap-2 mb-6 mt-4">
            <Link href="/ajuda">
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-orange-500 text-sm font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Voltar para Pedidos de Ajuda
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* foto grande do pedido */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-lg">
                <img
                  src={request.image}
                  alt={request.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {request.urgent && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Urgente
                  </span>
                </div>
              )}
            </div>

            {/* infos do pedido */}
            <div className="flex flex-col">
              {/* tipo do pedido (dinheiro/itens/voluntariado) */}
              <div className={`inline-flex items-center gap-2 ${config.bg} ${config.color} text-sm font-semibold px-3 py-1.5 rounded-full mb-3 self-start border ${config.border}`}>
                <Icon className="w-4 h-4" />
                {config.label}
              </div>

              <h1
                className="text-3xl font-black text-gray-800 mb-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {request.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{request.city}, {request.state}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(request.createdAt)}</span>
                </div>
              </div>

              {/* descrição escrita pela ong */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Sobre este pedido
                </h3>
                <p className="text-gray-600 leading-relaxed">{request.description}</p>
              </div>

              {/* texto explicando como ajudar + lista de itens, se tiver */}
              <div className={`${config.bg} border ${config.border} rounded-2xl p-4 mb-6`}>
                <p className={`text-sm font-semibold ${config.color} mb-2`}>{config.description}</p>
                {request.items && request.items.length > 0 && (
                  <ul className="space-y-1.5">
                    {request.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className={`w-4 h-4 ${config.color} shrink-0`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* dados de contato da ong responsável */}
              {ong && (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">ONG Responsável</p>
                  <p className="font-bold text-gray-800 text-lg mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {ong.name}
                  </p>
                  <p className="text-gray-500 text-sm mb-3">{ong.description}</p>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-orange-400" />
                      <span>{ong.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-orange-400" />
                      <span>{ong.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-orange-400" />
                      <span>{ong.city}, {ong.state}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* botão principal de ação */}
              <button
                onClick={handleHelp}
                className="ep-btn-orange text-base py-4 flex items-center justify-center gap-2 w-full"
              >
                <Icon className="w-5 h-5" />
                Quero Ajudar esta ONG
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
