// ENV usa funções getter para garantir que process.env seja lido
// DEPOIS que o dotenv/config já carregou no entry point.
export const ENV = {
  get cookieSecret() { return process.env.JWT_SECRET ?? ""; },
  get databaseUrl() { return process.env.DATABASE_URL ?? ""; },
  get isProduction() { return process.env.NODE_ENV === "production"; },
  get supabaseUrl() { return process.env.SUPABASE_URL ?? ""; },
  get supabaseServiceRoleKey() { return process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""; },
  get emailFrom() { return process.env.EMAIL_FROM ?? ""; },
  get gmailUser() { return process.env.GMAIL_USER ?? ""; },
  get brevoApiKey() { return process.env.BREVO_API_KEY ?? ""; },
  get siteUrl() { return process.env.SITE_URL ?? "http://localhost:3000"; },
};
