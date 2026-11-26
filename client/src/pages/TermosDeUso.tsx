import { Link } from 'wouter';
import { ArrowLeft, FileText, PawPrint } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SECTIONS = [
  {
    title: '1. Aceitação dos Termos',
    content: 'Ao acessar ou utilizar a plataforma, o usuário concorda com estes Termos de Uso do site. Caso não concorde com qualquer parte destes termos, recomendamos não utilizar a plataforma.',
  },
  {
    title: '2. Objetivo da Plataforma',
    content: 'A plataforma foi criada para conectar ONGs, protetores independentes e usuários, permitindo:',
    items: [
      'Divulgação de animais para adoção;',
      'Criação de campanhas de doação;',
      'Pedidos de ajuda;',
      'Divulgação de projetos sociais e beneficentes.',
    ],
    footer: 'O site atua como intermediador das publicações realizadas pelos usuários.',
  },
  {
    title: '3. Cadastro de Usuários e ONGs',
    content: 'Ao criar uma conta, o usuário declara que:',
    items: [
      'As informações fornecidas são verdadeiras e atualizadas;',
      'Possui autorização para representar a ONG, caso aplicável;',
      'É responsável pelas atividades realizadas em sua conta.',
    ],
    footer: 'O usuário é responsável pela segurança de seu login e senha.',
  },
  {
    title: '4. Publicações',
    content: 'Os usuários podem criar anúncios relacionados a:',
    items: [
      'Adoções responsáveis;',
      'Campanhas beneficentes;',
      'Arrecadações;',
      'Pedidos de ajuda;',
      'Divulgação de ONGs e projetos sociais.',
    ],
    footer: 'Todos os conteúdos publicados são de responsabilidade exclusiva do autor da publicação.',
  },
  {
    title: '5. Conteúdos Proibidos',
    content: 'Não é permitido publicar:',
    items: [
      'Informações falsas ou enganosas;',
      'Golpes ou campanhas fraudulentas;',
      'Conteúdo ofensivo, discriminatório ou ilegal;',
      'Venda ilegal de animais;',
      'Conteúdo que incentive maus-tratos;',
      'Dados pessoais de terceiros sem autorização.',
    ],
    footer: 'A plataforma poderá remover conteúdos que violem estes termos.',
  },
  {
    title: '6. Doações e Adoções',
    content: 'A plataforma não participa diretamente de:',
    items: [
      'Processos de adoção;',
      'Entrega de doações;',
      'Transações financeiras entre usuários.',
    ],
    footer: 'Toda negociação é realizada sob responsabilidade das partes envolvidas.',
  },
  {
    title: '7. Suspensão de Contas',
    content: 'A equipe da plataforma poderá:',
    items: [
      'Suspender contas;',
      'Remover anúncios;',
      'Encerrar acessos;',
      'Solicitar comprovação de identidade ou informações adicionais.',
    ],
    footer: 'Isso poderá ocorrer em casos de fraude, violação das regras ou comportamento inadequado.',
  },
  {
    title: '8. Limitação de Responsabilidade',
    content: 'A plataforma não garante:',
    items: [
      'Veracidade dos anúncios;',
      'Autenticidade das campanhas;',
      'Sucesso em adoções ou arrecadações.',
    ],
    footer: 'O usuário utiliza o serviço por sua própria responsabilidade.',
  },
  {
    title: '9. Alterações dos Termos',
    content: 'Os Termos de Uso poderão ser alterados a qualquer momento para melhorias, segurança e adequação legal.',
  },
  {
    title: '10. Contato',
    content: 'Dúvidas, denúncias ou solicitações podem ser realizadas pelos canais oficiais de suporte da plataforma.',
  },
];

export default function TermosDeUso() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <div className="pt-16 bg-[#FFF8F0]">
        <div className="container py-12">
          <Link href="/ongs/cadastrar">
            <button className="flex items-center gap-1.5 text-gray-500 hover:text-orange-500 text-sm font-medium transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-500" />
            </div>
            <h1 className="text-4xl font-black text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Termos de <span className="text-orange-500">Uso</span>
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
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-10 flex items-start gap-3">
          <PawPrint className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 leading-relaxed">
            Leia com atenção os termos abaixo antes de utilizar a plataforma Mundo ONG.
            Ao se cadastrar, você confirma que leu e concorda com todas as condições aqui descritas.
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
                <ul className="space-y-2 mb-3 ml-1">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {section.footer && (
                <p className="text-gray-500 text-sm italic leading-relaxed">{section.footer}</p>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-6 text-center">
          <p className="text-gray-500 text-sm mb-4">
            Tem dúvidas sobre os termos? Entre em contato com nossa equipe.
          </p>
          <a
            href="mailto:mundoongprojetos@gmail.com"
            className="inline-flex items-center gap-2 ep-btn-orange text-sm px-6 py-2.5"
          >
            mundoongprojetos@gmail.com
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
