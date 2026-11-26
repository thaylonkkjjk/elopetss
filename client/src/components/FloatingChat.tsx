import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, PawPrint, ChevronDown } from 'lucide-react';

interface Message {
  id: number;
  from: 'user' | 'agent';
  text: string;
}

interface FAQ {
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    question: '🐾 Como adotar um animal?',
    answer: 'Para adotar, navegue até a seção "Adoção", escolha um pet e clique em "Ver detalhes". Depois use o botão "Entrar em contato" para falar diretamente com a ONG responsável pelo animal. Cada ONG tem seu próprio processo de adoção!',
  },
  {
    question: '🏠 Como cadastrar minha ONG?',
    answer: 'Clique em "Cadastrar ONG" no menu superior ou acesse /cadastrar-ong. Preencha as informações da sua ONG e aguarde a análise da nossa equipe. O processo de aprovação costuma levar até 48h.',
  },
  {
    question: '❤️ Como ajudar as ONGs?',
    answer: 'Vá até "Pedidos de Ajuda" e veja quais ONGs precisam de apoio. Você pode clicar em qualquer pedido e usar o botão "Entrar em contato" para falar com a ONG via WhatsApp, Instagram ou e-mail.',
  },
  {
    question: '📸 Como publicar posts na ONG?',
    answer: 'Acesse o painel da sua ONG em /ong-login. Após entrar com email e senha, você pode criar posts de adoção (com dados do animal) ou pedidos de ajuda. É possível adicionar fotos e marcar urgência!',
  },
  {
    question: '🔐 Esqueci minha senha',
    answer: 'No momento, recuperação de senha é feita pela nossa equipe. Envie um email para mundoongprojetos@gmail.com com o email cadastrado da sua ONG que te ajudaremos rapidinho!',
  },
  {
    question: '📋 Quanto tempo leva a aprovação?',
    answer: 'Nossa equipe analisa cada cadastro de ONG individualmente. O prazo médio é de até 48 horas em dias úteis. Você receberá um email de confirmação assim que aprovado.',
  },
  {
    question: '💬 Falar com a equipe Mundo ONG',
    answer: 'Ficou com dúvidas que não estão aqui? Entre em contato pelo email mundoongprojetos@gmail.com. Respondemos em até 1 dia útil. Estamos aqui para ajudar! 🐾',
  },
];

let msgId = 1;

function AgentAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shrink-0 shadow">
      <PawPrint className="w-4 h-4 text-white" />
    </div>
  );
}

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: msgId++,
      from: 'agent',
      text: 'Olá! 🐾 Sou o assistente da Mundo ONG. Como posso te ajudar hoje? Escolha uma das opções abaixo!',
    },
  ]);
  const [typing, setTyping] = useState(false);
  const [showFAQ, setShowFAQ] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [open, messages]);

  const sendAgentMessage = (text: string) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { id: msgId++, from: 'agent', text }]);
    }, 800 + Math.random() * 400);
  };

  const handleFAQ = (faq: FAQ) => {
    setShowFAQ(false);
    setMessages(prev => [...prev, { id: msgId++, from: 'user', text: faq.question }]);
    sendAgentMessage(faq.answer);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Abrir chat de suporte"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          open
            ? 'bg-gray-700 hover:bg-gray-800 rotate-0 scale-100'
            : 'bg-orange-500 hover:bg-orange-600 scale-100 hover:scale-110'
        }`}
        style={{ boxShadow: open ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(249,115,22,0.4)' }}
      >
        {open
          ? <X className="w-6 h-6 text-white" />
          : <MessageCircle className="w-6 h-6 text-white" />
        }
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Chat window */}
      <div className={`fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 transition-all duration-300 origin-bottom-right ${
        open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'
      }`}>
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ maxHeight: '75vh' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Mundo ONG • Assistente
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                <p className="text-white/80 text-xs">Online agora</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth" style={{ minHeight: 200 }}>
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 items-end ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.from === 'agent' && <AgentAvatar />}
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.from === 'agent'
                    ? 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    : 'bg-orange-500 text-white rounded-br-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex gap-2 items-end">
                <AgentAvatar />
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* FAQ chips */}
            {showFAQ && !typing && (
              <div className="pt-1">
                <p className="text-xs text-gray-400 font-medium mb-2 pl-10">Perguntas frequentes:</p>
                <div className="flex flex-col gap-1.5">
                  {FAQS.map((faq, i) => (
                    <button
                      key={i}
                      onClick={() => handleFAQ(faq)}
                      className="text-left text-sm text-gray-700 bg-orange-50 hover:bg-orange-100 border border-orange-100 px-3.5 py-2 rounded-xl transition-colors ml-10 font-medium"
                    >
                      {faq.question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!showFAQ && !typing && (
              <button
                onClick={() => setShowFAQ(true)}
                className="text-xs text-orange-500 hover:underline ml-10 font-medium"
              >
                Ver perguntas frequentes
              </button>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Rodapé — só perguntas frequentes, sem campo de digitação livre */}
          <div className="border-t border-gray-100 p-3 text-center">
            <p className="text-xs text-gray-400">
              Escolha uma pergunta acima para falar com a gente 🐾
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
