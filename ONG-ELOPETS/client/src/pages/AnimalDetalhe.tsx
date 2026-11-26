import { useParams, Link } from 'wouter';
import { ArrowLeft, MapPin, Heart, CheckCircle, XCircle, PawPrint, Phone, Mail } from 'lucide-react';
import { getAnimalById, getOngById } from '@/lib/data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

export default function AnimalDetalhe() {
  const { id } = useParams<{ id: string }>();
  const animal = getAnimalById(id);
  const ong = animal ? getOngById(animal.ongId) : null;

  if (!animal) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container pt-32 pb-20 text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Animal não encontrado
          </h2>
          <p className="text-gray-500 mb-6">Este animal pode ter sido adotado ou o link está incorreto.</p>
          <Link href="/adocao">
            <button className="ep-btn-blue px-6 py-2.5">Ver outros animais</button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const speciesLabel = {
    cachorro: 'Cachorro',
    gato: 'Gato',
    outro: 'Outro',
  }[animal.species];

  const handleInterest = () => {
    toast.success('Interesse registrado! A ONG entrará em contato em breve.', {
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
            <Link href="/adocao">
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-orange-500 text-sm font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Voltar para Adoção
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* foto grande do bichinho */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden aspect-square shadow-lg">
                <img
                  src={animal.image}
                  alt={animal.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* selo mostrando se tá disponível, adotado etc */}
              <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-bold ${
                animal.status === 'disponível'
                  ? 'bg-green-500 text-white'
                  : animal.status === 'adotado'
                  ? 'bg-gray-500 text-white'
                  : 'bg-yellow-500 text-white'
              }`}>
                {animal.status === 'disponível' ? '✓ Disponível' : animal.status === 'adotado' ? 'Adotado' : 'Em Processo'}
              </div>
            </div>

            {/* infos do animal */}
            <div className="flex flex-col">
              {/* nome, espécie, porte e local */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    animal.species === 'cachorro' ? 'ep-badge-dog' : animal.species === 'gato' ? 'ep-badge-cat' : 'ep-badge-other'
                  }`}>
                    {speciesLabel}
                  </span>
                  {animal.size && (
                    <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
                      Porte {animal.size}
                    </span>
                  )}
                </div>
                <h1
                  className="text-4xl font-black text-gray-800 mt-2"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {animal.name}
                </h1>
                <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{animal.city}, {animal.state}</span>
                </div>
              </div>

              {/* grade com raça, idade, gênero etc */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Espécie', value: speciesLabel },
                  { label: 'Raça', value: animal.breed },
                  { label: 'Idade', value: animal.age },
                  { label: 'Gênero', value: animal.gender === 'macho' ? '♂ Macho' : '♀ Fêmea' },
                ].map((info) => (
                  <div key={info.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-medium">{info.label}</p>
                    <p className="font-bold text-gray-800 capitalize" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      {info.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* se já foi vacinado/castrado */}
              <div className="flex gap-3 mb-6">
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  animal.vaccinated ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                }`}>
                  {animal.vaccinated
                    ? <CheckCircle className="w-4 h-4" />
                    : <XCircle className="w-4 h-4" />
                  }
                  {animal.vaccinated ? 'Vacinado' : 'Não vacinado'}
                </div>
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  animal.castrated ? 'bg-sky-50 text-sky-600' : 'bg-gray-50 text-gray-500'
                }`}>
                  {animal.castrated
                    ? <CheckCircle className="w-4 h-4" />
                    : <XCircle className="w-4 h-4" />
                  }
                  {animal.castrated ? 'Castrado' : 'Não castrado'}
                </div>
              </div>

              {/* texto contando a história do bichinho */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Sobre {animal.name}
                </h3>
                <p className="text-gray-600 leading-relaxed">{animal.description}</p>
              </div>

              {/* contato da ong responsável pela adoção */}
              {ong && (
                <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <PawPrint className="w-4 h-4 text-sky-500" />
                    <span className="text-xs font-bold text-sky-600 uppercase tracking-wide">Responsável pela adoção</span>
                  </div>
                  <p className="font-bold text-gray-800 mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {ong.name}
                  </p>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{ong.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{ong.phone}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* botão de interesse, só aparece se ainda tá disponível */}
              {animal.status === 'disponível' && (
                <button
                  onClick={handleInterest}
                  className="ep-btn-orange text-base py-4 flex items-center justify-center gap-2 w-full"
                >
                  <Heart className="w-5 h-5" />
                  Tenho Interesse em Adotar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
