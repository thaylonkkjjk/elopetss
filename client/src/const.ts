export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// O site usa login próprio via /ong-login e /admin
// Esta função retorna a página de login da ONG por padrão
export const getLoginUrl = () => "/ong-login";
