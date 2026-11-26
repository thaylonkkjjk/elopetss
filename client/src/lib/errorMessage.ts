/**
 * Extrai uma mensagem de erro legível a partir de qualquer erro tRPC/Zod/JS.
 * Evita exibir JSON bruto para o usuário.
 */
export function getErrorMessage(err: unknown, fallback = 'Ocorreu um erro. Tente novamente.'): string {
  if (!err) return fallback;

  // String simples
  if (typeof err === 'string') return err || fallback;

  const e = err as any;
  const raw: string = e?.message || e?.data?.message || '';

  if (!raw) return fallback;

  // Tenta parsear JSON do Zod (array de erros)
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Pega o campo "message" do primeiro erro Zod
      const msg = parsed[0]?.message;
      if (msg) return humanizeZodMessage(msg, parsed[0]?.path);
    }
    if (typeof parsed === 'object' && parsed.message) {
      return parsed.message;
    }
  } catch {
    // Não é JSON — usa a string diretamente
  }

  // Mensagens conhecidas do backend → traduz
  return translateServerMessage(raw);
}

function humanizeZodMessage(msg: string, path?: string[]): string {
  const field = path?.[0] as string | undefined;
  const fieldNames: Record<string, string> = {
    email: 'E-mail',
    password: 'Senha',
    name: 'Nome',
    description: 'Descrição',
    phone: 'Telefone',
    city: 'Cidade',
    state: 'Estado',
    website: 'Site',
    instagram: 'Instagram',
    title: 'Título',
    items: 'Itens',
  };

  const label = field ? fieldNames[field] ?? field : '';
  const prefix = label ? `${label}: ` : '';

  // Mensagens de tamanho mínimo/máximo (Zod v3 e v4 têm formatos diferentes)
  const minMatch = msg.match(/(?:at least|>=)\s*(\d+)/i);
  if (minMatch && /too small|at least/i.test(msg)) {
    return `${prefix}Deve ter pelo menos ${minMatch[1]} caracteres`;
  }
  const maxMatch = msg.match(/(?:at most|<=)\s*(\d+)/i);
  if (maxMatch && /too big|at most/i.test(msg)) {
    return `${prefix}Deve ter no máximo ${maxMatch[1]} caracteres`;
  }

  const msgMap: Record<string, string> = {
    'Invalid email address': 'E-mail inválido',
    'Invalid email': 'E-mail inválido',
    'Required': 'Campo obrigatório',
    'Expected string, received number': 'Valor inválido',
    'Invalid url': 'Endereço inválido (use algo como https://suaong.org.br)',
    'Invalid URL': 'Endereço inválido (use algo como https://suaong.org.br)',
  };

  for (const [key, translation] of Object.entries(msgMap)) {
    if (msg.includes(key)) return prefix + translation;
  }

  return prefix + 'Verifique este campo e tente novamente.';
}

function translateServerMessage(msg: string): string {
  const translations: Record<string, string> = {
    'Email ou senha inválidos': 'E-mail ou senha incorretos. Verifique e tente novamente.',
    'ONG não encontrada': 'ONG não encontrada.',
    'Admin não encontrado': 'Administrador não encontrado.',
    'Esta ONG foi desativada': 'Esta ONG foi desativada. Entre em contato com o suporte.',
    'Erro ao criar ONG pendente': 'Erro ao cadastrar ONG. Verifique os dados e tente novamente.',
    'Erro ao fazer login': 'Erro ao fazer login. Verifique suas credenciais.',
    'UNAUTHORIZED': 'E-mail ou senha incorretos.',
    'NOT_FOUND': 'Não encontrado.',
    'INTERNAL_SERVER_ERROR': 'Erro interno. Tente novamente em instantes.',
    'BAD_REQUEST': 'Dados inválidos. Verifique o formulário.',
    'unique constraint': 'Este e-mail já está cadastrado.',
    'duplicate key': 'Este e-mail já está cadastrado.',
  };

  for (const [key, translation] of Object.entries(translations)) {
    if (msg.includes(key)) return translation;
  }

  // Se for JSON escapado ainda, retorna fallback
  if (msg.startsWith('[{') || msg.startsWith('{')) {
    return 'Dados inválidos. Verifique o formulário e tente novamente.';
  }

  return msg;
}
