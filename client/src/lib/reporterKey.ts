// Identificador anônimo e persistente do navegador, usado só para limitar
// a 1 denúncia por anúncio por pessoa (não identifica o usuário).
const STORAGE_KEY = 'mundoong_reporter_key';

export function getReporterKey(): string {
  try {
    let key = localStorage.getItem(STORAGE_KEY);
    if (!key) {
      key = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, key);
    }
    return key;
  } catch {
    // Sem acesso ao localStorage (modo privado, etc.) — gera uma chave temporária
    return `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
