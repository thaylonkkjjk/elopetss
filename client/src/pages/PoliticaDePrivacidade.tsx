import { Link } from 'wouter';
import { ArrowLeft, ShieldCheck, PawPrint } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SECTIONS = [
  {
    title: '1. Coleta de Informações',
    content: 'Coletamos informações fornecidas pelos usuários durante o uso da plataforma, incluindo:',
    items: [
      'Nome;',
      'E-mail;',
      'Telefone;',
      'Dados da ONG;',
      'Fotos e conteúdos publicados;',
      'Informações de navegação e acesso.',
    ],
  },
  {
    title: '2. Uso das Informações',
    content: 'As informações coletadas poderão ser utilizadas para:',
    items: [
      'Manter o funcionamento da plataforma;',
      'Gerenciar contas e publicações;',
      'Exibir anúncios e campanhas;',
      'Melhorar a experiência do usuário;',
      'Garantir segurança e prevenção contra fraudes;',
      'Entrar em contato quando necessário.',
    ],
  },
  {
    title: '3. Compartilhamento de Informações',
    content: 'Não vendemos informações pessoais dos usuários. Os dados poderão ser compartilhados apenas:',
    items: [
      'Quando necessário para funcionamento da plataforma;',
      'Em cumprimento de obrigações legais;',
      'Para prevenção de fraudes e segurança dos usuários.',
    ],
  },
  {
    title: '4. Segurança dos Dados',
    content: 'A plataforma adota medidas de proteção e monitoramento para manter os dados dos usuários seguros e preservar a integridade das informações cadastradas.',
  },
  {
    title: '5. Conteúdo Público',
    content: 'Ao publicar anúncios, campanhas ou pedidos de ajuda, algumas informações poderão ficar visíveis para outros usuários da plataforma.',
  },
  {
    title: '6. Cookies',
    content: 'Utilizamos cookies e tecnologias semelhantes para:',
    items: [
      'Melhorar a experiência do usuário;',
      'Salvar preferências;',
      'Analisar desempenho e funcionamento da plataforma.',
    ],
  },
  {
    title: '7. Direitos do Usuário',
    content: 'O usuário poderá:',
    items: [
      'Solicitar alteração de dados;',
      'Solicitar exclusão da conta;',
      'Pedir remoção de conteúdos publicados.',
    ],
  },
  {
    title: '8. Alterações nesta Política',
    content: 'Esta Política de Privacidade poderá ser atualizada periodicamente para melhorias, segurança e adequação legal.',
  },
  {
    title: '9. Contato',
    content: 'Em caso de dúvidas relacionadas à privacidade ou aos dados pessoais, o usuário poderá entrar em contato pelos canais oficiais de suporte da plataforma.',
  },
];

export default function PoliticaDePrivacidade() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <div className="pt-16 bg-[#F0F9FF]">
        <div className="container py-12">
          <Link href="/ongs/cadastrar">
            <button className="flex items-center gap-1.5 text-gray-500 hover:text-sky-500 text-sm font-medium transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-sky-500" />
            </div>
            <h1 className="text-4xl font-black text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Política de <span className="text-sky-500">Privacidade</span>
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            Última atualização: Janeiro de 2026 · Mundo ONG
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12 max-w-3xl">
        {/* Intro box */}
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 mb-10 flex items-start gap-3">
          <PawPrint className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 leading-relaxed">
            A Mundo ONG se preocupa com a privacidade dos seus usuários. Esta política descreve como
            coletamos, usamos e protegemos suas informações ao utilizar nossa plataforma.
          </p>
        </div>

        {/* Highlight: no data selling */}
        <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl p-4 mb-10">
          <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
          <p className="text-sm font-semibold text-green-700">
            Nunca vendemos seus dados pessoais para terceiros.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((section, i) => (
            <div key={i} className="border-b border-gray-100 pb-8 last:border-0">
              <h2
                className="text-lg font-black text-gray-800 mb-3"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {section.title}
              </h2>
              {section.content && (
                <p className="text-gray-600 text-sm leading-relaxed mb-3">{section.content}</p>
              )}
              {section.items && (
                <ul className="space-y-2 ml-1">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-6 text-center">
          <p className="text-gray-500 text-sm mb-4">
            Dúvidas sobre como tratamos seus dados? Fale com a gente.
          </p>
          <a
            href="mailto:mundoongprojetos@gmail.com"
            className="inline-flex items-center gap-2 ep-btn-blue text-sm px-6 py-2.5"
          >
            mundoongprojetos@gmail.com
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
