import { useParams, Link } from 'wouter';
import { ArrowLeft, MapPin, Mail, Phone, PawPrint, Heart, Calendar } from 'lucide-react';
import { getOngById, getAnimalsByOng, getHelpRequestsByOng } from '@/lib/data';
import AnimalCard from '@/components/AnimalCard';
import HelpRequestCard from '@/components/HelpRequestCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function OngDetalhe() {
  const { id } = useParams<{ id: string }>();
  const ong = getOngById(id);
  const animals = ong ? getAnimalsByOng(id) : [];
  const helpRequests = ong ? getHelpRequestsByOng(id) : [];

  if (!ong) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container pt-32 pb-20 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            ONG não encontrada
          </h2>
          <Link href="/ongs">
            <button className="ep-btn-blue px-6 py-2.5">Ver todas as ONGs</button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20 pb-16">
        <div className="container">
          {/* botão de voltar */}
          <div className="flex items-center gap-2 mb-6 mt-4">
            <Link href="/ongs">
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-orange-500 text-sm font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Voltar para ONGs
              </button>
            </Link>
          </div>

          {/* cabeçalho com foto, descrição e contato da ong */}
          <div className="bg-gradient-to-br from-sky-50 to-orange-50 rounded-3xl p-8 mb-10">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* logo/foto da ong */}
              <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-md">
                <img
                  src={ong.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&h=200&fit=crop'}
                  alt={ong.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <h1
                  className="text-3xl font-black text-gray-800 mb-2"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {ong.name}
                </h1>
                <p className="text-gray-600 mb-4">{ong.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    <span>{ong.city}, {ong.state}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-orange-400" />
                    <span>{ong.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-orange-400" />
                    <span>{ong.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    <span>Desde {ong.since}</span>
                  </div>
                </div>
              </div>

              {/* numerinhos de animais e pedidos */}
              <div className="flex sm:flex-col gap-3 shrink-0">
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm min-w-[90px]">
                  <div className="flex items-center justify-center mb-1">
                    <PawPrint className="w-4 h-4 text-orange-400" />
                  </div>
                  <p className="text-2xl font-black text-orange-500" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {ong.animalsCount}
                  </p>
                  <p className="text-xs text-gray-500">Animais</p>
                </div>
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm min-w-[90px]">
                  <div className="flex items-center justify-center mb-1">
                    <Heart className="w-4 h-4 text-sky-400" />
                  </div>
                  <p className="text-2xl font-black text-sky-500" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {ong.helpRequestsCount}
                  </p>
                  <p className="text-xs text-gray-500">Pedidos</p>
                </div>
              </div>
            </div>
          </div>

          {/* animais dessa ong disponíveis pra adoção */}
          {animals.length > 0 && (
            <div className="mb-12">
              <h2
                className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                <PawPrint className="w-5 h-5 text-orange-400" />
                Animais para Adoção
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {animals.map((animal, i) => (
                  <AnimalCard key={animal.id} animal={animal} delay={i * 80} />
                ))}
              </div>
            </div>
          )}

          {/* pedidos de ajuda dessa ong */}
          {helpRequests.length > 0 && (
            <div>
              <h2
                className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                <Heart className="w-5 h-5 text-orange-400" />
                Pedidos de Ajuda
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {helpRequests.map((request, i) => (
                  <HelpRequestCard key={request.id} request={request} delay={i * 80} />
                ))}
              </div>
            </div>
          )}

          {animals.length === 0 && helpRequests.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">Esta ONG ainda não possui animais ou pedidos cadastrados.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
