import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, PawPrint, CheckCircle, Building, Mail, Phone, MapPin, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

interface FormData {
  name: string;
  description: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  website: string;
  instagram: string;
}

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

export default function CadastrarOng() {
  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    website: '',
    instagram: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim()) newErrors.name = 'Nome da ONG é obrigatório';
    if (!form.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'E-mail válido é obrigatório';
    if (!form.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!form.city.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!form.state) newErrors.state = 'Estado é obrigatório';
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor, corrija os erros no formulário.');
      return;
    }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSubmitted(true);
    toast.success('ONG cadastrada com sucesso! Entraremos em contato em breve.');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container pt-32 pb-20 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2
            className="text-3xl font-black text-gray-800 mb-3"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Cadastro Enviado! 🎉
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Recebemos o cadastro de <strong>{form.name}</strong>. Nossa equipe irá analisar as informações e entrar em contato pelo e-mail <strong>{form.email}</strong> em até 48 horas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <button className="ep-btn-orange px-8 py-3">Voltar ao Início</button>
            </Link>
            <Link href="/ongs">
              <button className="ep-btn-outline-orange px-8 py-3">Ver ONGs Parceiras</button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const inputClass = (field: keyof FormData) =>
    `w-full px-4 py-3 rounded-xl border ${
      errors[field] ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
    } focus:outline-none focus:ring-2 text-sm transition-all`;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* cabeçalho */}
      <div className="pt-16 bg-gradient-to-br from-orange-50 to-sky-50 paw-bg">
        <div className="container py-12">
          <div className="flex items-center gap-2 mb-3">
            <PawPrint className="w-6 h-6 text-orange-400" />
            <h1
              className="text-4xl font-black text-gray-800"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Cadastrar <span className="text-orange-500">ONG</span>
            </h1>
          </div>
          <p className="text-gray-500 max-w-xl">
            Junte-se à nossa rede de ONGs parceiras e alcance mais pessoas dispostas a ajudar e adotar animais.
          </p>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          {/* botão de voltar */}
          <div className="mb-6">
            <Link href="/ongs">
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-orange-500 text-sm font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Voltar para ONGs
              </button>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* bloco de informações básicas */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3
                className="font-bold text-gray-800 mb-4 flex items-center gap-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                <Building className="w-4 h-4 text-orange-400" />
                Informações Básicas
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Nome da ONG *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ex: Patinhas do Sul"
                    className={inputClass('name')}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Descrição *
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Descreva a missão e as atividades da sua ONG..."
                    rows={4}
                    className={`${inputClass('description')} resize-none`}
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>
              </div>
            </div>

            {/* bloco de contato */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3
                className="font-bold text-gray-800 mb-4 flex items-center gap-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                <Mail className="w-4 h-4 text-orange-400" />
                Contato
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="contato@suaong.org"
                    className={inputClass('email')}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                    className={inputClass('phone')}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://suaong.org.br"
                    className={inputClass('website')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Instagram
                  </label>
                  <input
                    type="text"
                    name="instagram"
                    value={form.instagram}
                    onChange={handleChange}
                    placeholder="@suaong"
                    className={inputClass('instagram')}
                  />
                </div>
              </div>
            </div>

            {/* bloco de localização */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3
                className="font-bold text-gray-800 mb-4 flex items-center gap-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                <MapPin className="w-4 h-4 text-orange-400" />
                Localização
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Ex: Florianópolis"
                    className={inputClass('city')}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Estado *
                  </label>
                  <select
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className={inputClass('state')}
                  >
                    <option value="">Selecione o estado</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
              </div>
            </div>

            {/* aviso de termos de uso */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">
                  Ao cadastrar sua ONG, você concorda com os{' '}
                  <span className="text-orange-500 font-semibold cursor-pointer hover:underline">
                    Termos de Uso
                  </span>{' '}
                  e a{' '}
                  <span className="text-orange-500 font-semibold cursor-pointer hover:underline">
                    Política de Privacidade
                  </span>{' '}
                  do EloPets. Sua ONG será analisada pela nossa equipe antes de ser publicada.
                </p>
              </div>
            </div>

            {/* botão de enviar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full ep-btn-orange text-base py-4 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando cadastro...
                </>
              ) : (
                <>
                  <PawPrint className="w-5 h-5" />
                  Cadastrar Minha ONG
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
