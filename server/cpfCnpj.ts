// Validação e consulta de CNPJ/CPF (algoritmos de dígito verificador + BrasilAPI)

export function onlyDigits(value: string): string {
  return (value || "").replace(/\D/g, "");
}

export function isValidCPF(raw: string): boolean {
  const cpf = onlyDigits(raw);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calcCheckDigit = (base: string, weightStart: number): number => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i], 10) * (weightStart - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  const d1 = calcCheckDigit(cpf.slice(0, 9), 10);
  const d2 = calcCheckDigit(cpf.slice(0, 10), 11);
  return d1 === parseInt(cpf[9], 10) && d2 === parseInt(cpf[10], 10);
}

export function isValidCNPJ(raw: string): boolean {
  const cnpj = onlyDigits(raw);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  const calcCheckDigit = (base: string): number => {
    const weights = base.length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i], 10) * weights[i];
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const d1 = calcCheckDigit(cnpj.slice(0, 12));
  const d2 = calcCheckDigit(cnpj.slice(0, 12) + d1);
  return d1 === parseInt(cnpj[12], 10) && d2 === parseInt(cnpj[13], 10);
}

export interface CnpjLookupResult {
  razaoSocial: string;
  nomeFantasia: string | null;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  municipio: string | null;
  uf: string | null;
  cep: string | null;
  telefone: string | null;
  email: string | null;
  situacao: string | null;
  isAnimalRelated: boolean;
}

// Palavras-chave que precisam aparecer na razão social/nome fantasia para
// aceitarmos o CNPJ como sendo de uma ONG de proteção animal.
const ANIMAL_KEYWORDS = [
  "ANIMAL",
  "ANIMAIS",
  "PROTECAO",
  "PROTETORA",
  "AMPARO",
  "RESGATE",
  "ABRIGO",
  "FAUNA",
  "PATAS",
  "BICHO",
];

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase();
}

export function isAnimalRelatedCompany(razaoSocial: string, nomeFantasia?: string | null): boolean {
  const combined = normalize(`${razaoSocial} ${nomeFantasia || ""}`);
  return ANIMAL_KEYWORDS.some((keyword) => combined.includes(keyword));
}

export async function lookupCnpj(raw: string): Promise<CnpjLookupResult> {
  const cnpj = onlyDigits(raw);
  if (!isValidCNPJ(cnpj)) {
    throw new Error("CNPJ inválido.");
  }

  let response: Response;
  try {
    response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
      headers: { "User-Agent": "MundoONG/1.0", "Accept": "application/json" },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new Error("Não foi possível consultar o CNPJ agora. Tente novamente em instantes.");
  }

  if (response.status === 404) {
    throw new Error("CNPJ não encontrado na Receita Federal.");
  }
  if (!response.ok) {
    throw new Error("Serviço de consulta de CNPJ indisponível no momento. Tente novamente em instantes.");
  }

  const data = await response.json();
  const razaoSocial = data.razao_social || "";
  const nomeFantasia = data.nome_fantasia || null;
  return {
    razaoSocial,
    nomeFantasia,
    logradouro: data.logradouro || null,
    numero: data.numero || null,
    bairro: data.bairro || null,
    municipio: data.municipio || null,
    uf: data.uf || null,
    cep: data.cep || null,
    telefone: data.ddd_telefone_1 || null,
    email: data.email || null,
    situacao: data.descricao_situacao_cadastral || null,
    isAnimalRelated: isAnimalRelatedCompany(razaoSocial, nomeFantasia),
  };
}
