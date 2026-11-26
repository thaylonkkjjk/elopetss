// Mundo ONG CadastrarOng Page — Formulário de cadastro de ONG
// Design: "Warm Companion" — clean form, orange CTA, validation feedback

import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, PawPrint, CheckCircle, Building, Mail, Phone, MapPin, FileText, Lock, KeyRound, Search, Loader2, IdCard } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errorMessage';
import { trpc } from '@/lib/trpc';
import { maskCNPJ, maskCPF, onlyDigits, isValidCNPJ, isValidCPF } from '@/lib/docMasks';

function capitalizeWords(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

interface FormData {
  name: string;
  description: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  city: string;
  state: string;
  website: string;
  instagram: string;
  cnpj: string;
  responsibleName: string;
  responsibleCpf: string;
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
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    state: '',
    website: '',
    instagram: '',
    cnpj: '',
    responsibleName: '',
    responsibleCpf: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [resending, setResending] = useState(false);
  const [cnpjLookupStatus, setCnpjLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not-animal' | 'error'>('idle');

  const utils = trpc.useUtils();

  const validate = () => {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim()) newErrors.name = 'Nome da ONG é obrigatório';
    if (!form.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'E-mail válido é obrigatório';
    if (!form.password.trim() || form.password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Senhas não conferem';
    if (!form.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!form.city.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!form.state) newErrors.state = 'Estado é obrigatório';
    if (!isValidCNPJ(form.cnpj)) newErrors.cnpj = 'CNPJ válido é obrigatório';
    if (!form.responsibleName.trim() || form.responsibleName.trim().length < 3) {
      newErrors.responsibleName = 'Nome completo do responsável é obrigatório';
    }
    if (!isValidCPF(form.responsibleCpf)) newErrors.responsibleCpf = 'CPF válido é obrigatório';
    return newErrors;
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCNPJ(e.target.value);
    setForm((prev) => ({ ...prev, cnpj: masked }));
    setCnpjLookupStatus('idle');
    if (errors.cnpj) setErrors((prev) => ({ ...prev, cnpj: undefined }));
  };

  const handleCnpjLookup = async () => {
    if (!isValidCNPJ(form.cnpj)) {
      toast.error('Digite um CNPJ válido antes de buscar.');
      return;
    }
    setCnpjLookupStatus('loading');
    try {
      const data = await utils.ongs.lookupCnpj.fetch({ cnpj: form.cnpj });
      if (!data.isAnimalRelated) {
        setCnpjLookupStatus('not-animal');
        toast.error('A razão social desse CNPJ não indica uma ONG de proteção animal. Verifique o CNPJ informado.');
        return;
      }
      setForm((prev) => ({
        ...prev,
        name: data.nomeFantasia || data.razaoSocial,
        city: data.municipio ? capitalizeWords(data.municipio) : prev.city,
        state: data.uf || prev.state,
        phone: prev.phone.trim() ? prev.phone : (data.telefone || prev.phone),
      }));
      setCnpjLookupStatus('found');
      toast.success(`Empresa encontrada: ${data.razaoSocial}`);
    } catch (error: any) {
      setCnpjLookupStatus('error');
      toast.error(getErrorMessage(error));
    }
  };

  const handleResponsibleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCPF(e.target.value);
    setForm((prev) => ({ ...prev, responsibleCpf: masked }));
    if (errors.responsibleCpf) setErrors((prev) => ({ ...prev, responsibleCpf: undefined }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const registerMutation = trpc.ongs.register.useMutation();
  const confirmEmailMutation = trpc.ongAuth.confirmEmail.useMutation();
  const resendConfirmationMutation = trpc.ongAuth.resendConfirmation.useMutation();

  const handleConfirmEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmCode.length !== 6) {
      toast.error('Digite o código de 6 dígitos enviado para seu email.');
      return;
    }
    setConfirming(true);
    try {
      await confirmEmailMutation.mutateAsync({ email: form.email, code: confirmCode });
      setEmailConfirmed(true);
      toast.success('Email confirmado com sucesso!');
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setConfirming(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      await resendConfirmationMutation.mutateAsync({ email: form.email });
      toast.success('Código reenviado! Verifique seu email.');
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setResending(false);
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
    try {
      await registerMutation.mutateAsync({
        name: form.name,
        description: form.description,
        email: form.email,
        password: form.password,
        phone: form.phone,
        city: form.city,
        state: form.state,
        website: form.website,
        instagram: form.instagram,
        cnpj: onlyDigits(form.cnpj),
        responsibleName: form.responsibleName,
        responsibleCpf: onlyDigits(form.responsibleCpf),
      });
      setLoading(false);
      setSubmitted(true);
      toast.success('ONG cadastrada com sucesso! Entraremos em contato em breve.');
    } catch (error: any) {
      setLoading(false);
      toast.error(getErrorMessage(error));
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="container pt-32 pb-20 text-center max-w-lg mx-auto flex-1">
          {!emailConfirmed ? (
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="w-5 h-5 text-sky-500" />
                <h3 className="font-bold text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Confirme seu email
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Enviamos um código de 6 dígitos para <strong>{form.email}</strong>. Digite-o abaixo para confirmar sua conta.
              </p>
              <form onSubmit={handleConfirmEmail} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:outline-none text-center text-lg tracking-widest font-bold"
                />
                <button
                  type="submit"
                  disabled={confirming}
                  className="ep-btn-blue px-6 py-3 whitespace-nowrap disabled:opacity-50"
                >
                  {confirming ? 'Confirmando...' : 'Confirmar'}
                </button>
              </form>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending}
                className="text-xs font-semibold text-gray-400 hover:text-orange-500 mt-3"
              >
                {resending ? 'Reenviando...' : 'Não recebeu? Reenviar código'}
              </button>
            </div>
          ) : (
            <>
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
            </>
          )}
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

      {/* Page Header */}
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
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/ongs">
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-orange-500 text-sm font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Voltar para ONGs
              </button>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CNPJ */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3
                className="font-bold text-gray-800 mb-4 flex items-center gap-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                <IdCard className="w-4 h-4 text-orange-400" />
                CNPJ da ONG
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                O CNPJ é obrigatório para cadastro. Buscamos os dados oficiais da Receita Federal automaticamente.
              </p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  CNPJ *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="cnpj"
                    value={form.cnpj}
                    onChange={handleCnpjChange}
                    placeholder="00.000.000/0000-00"
                    className={`${inputClass('cnpj')} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={handleCnpjLookup}
                    disabled={cnpjLookupStatus === 'loading'}
                    className="ep-btn-blue px-4 flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                  >
                    {cnpjLookupStatus === 'loading' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    Buscar
                  </button>
                </div>
                {errors.cnpj && <p className="text-red-500 text-xs mt-1">{errors.cnpj}</p>}
                {cnpjLookupStatus === 'found' && !errors.cnpj && (
                  <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Dados da empresa encontrados e preenchidos abaixo.
                  </p>
                )}
                {cnpjLookupStatus === 'not-animal' && (
                  <p className="text-red-500 text-xs mt-1">
                    A razão social desse CNPJ não indica uma ONG de proteção animal. Este cadastro só é permitido para esse tipo de organização.
                  </p>
                )}
              </div>
            </div>

            {/* Basic Info */}
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
                    readOnly={cnpjLookupStatus === 'found'}
                    placeholder="Ex: Patinhas do Sul"
                    className={`${inputClass('name')} ${cnpjLookupStatus === 'found' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                  />
                  {cnpjLookupStatus === 'found' ? (
                    <p className="text-xs text-gray-400 mt-1">Nome confirmado pelo CNPJ e bloqueado para edição.</p>
                  ) : (
                    errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
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

            {/* Credentials */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3
                className="font-bold text-gray-800 mb-4 flex items-center gap-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                <Lock className="w-4 h-4 text-orange-400" />
                Credenciais de Acesso
              </h3>
              <p className="text-sm text-gray-600 mb-4">Essas credenciais serão usadas para acessar o painel da sua ONG após aprovação.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
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
                    Senha *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    className={inputClass('password')}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repita a senha"
                    className={inputClass('confirmPassword')}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Responsável pelo cadastro */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3
                className="font-bold text-gray-800 mb-4 flex items-center gap-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                <IdCard className="w-4 h-4 text-orange-400" />
                Responsável pelo Cadastro
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Esses dados são usados apenas para conferência administrativa e não aparecem no perfil público da ONG.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Nome completo do responsável *
                  </label>
                  <input
                    type="text"
                    name="responsibleName"
                    value={form.responsibleName}
                    onChange={handleChange}
                    placeholder="Nome completo"
                    className={inputClass('responsibleName')}
                  />
                  {errors.responsibleName && <p className="text-red-500 text-xs mt-1">{errors.responsibleName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    CPF do responsável *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="responsibleCpf"
                    value={form.responsibleCpf}
                    onChange={handleResponsibleCpfChange}
                    placeholder="000.000.000-00"
                    className={inputClass('responsibleCpf')}
                  />
                  {errors.responsibleCpf && <p className="text-red-500 text-xs mt-1">{errors.responsibleCpf}</p>}
                </div>
              </div>
            </div>

            {/* Contact */}
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

            {/* Location */}
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
                    readOnly={cnpjLookupStatus === 'found'}
                    placeholder="Ex: Florianópolis"
                    className={`${inputClass('city')} ${cnpjLookupStatus === 'found' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
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
                    disabled={cnpjLookupStatus === 'found'}
                    className={`${inputClass('state')} ${cnpjLookupStatus === 'found' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Selecione o estado</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  {cnpjLookupStatus === 'found' && (
                    <p className="text-xs text-gray-400 mt-1">Localização confirmada pelo CNPJ.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">
                  Ao cadastrar sua ONG, você concorda com os{' '}
                  <Link href="/termos-de-uso">
                    <span className="text-orange-500 font-semibold cursor-pointer hover:underline">
                      Termos de Uso
                    </span>
                  </Link>{' '}
                  e a{' '}
                  <Link href="/politica-de-privacidade">
                    <span className="text-orange-500 font-semibold cursor-pointer hover:underline">
                      Política de Privacidade
                    </span>
                  </Link>{' '}
                  do Mundo ONG. Sua ONG será analisada pela nossa equipe antes de ser publicada.
                </p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full ep-btn-orange py-3 font-bold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Cadastrar ONG'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
