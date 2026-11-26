import { ENV } from "./_core/env";

// Envio de email via API HTTP da Brevo (ex-Sendinblue), usando o remetente
// verificado mundoongprojetos@gmail.com. Trocado do Gmail SMTP porque
// hospedagens como a Render bloqueiam conexões SMTP de saída — a API da
// Brevo usa HTTPS (porta 443), que não é bloqueada, e tem um plano grátis
// permanente (300 emails/dia) sem precisar de domínio próprio.
const BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email";

function parseFrom(): { name: string; email: string } {
  const raw = ENV.emailFrom || `Mundo ONG <${ENV.gmailUser}>`;
  const match = raw.match(/^(.*)<(.+)>$/);
  if (match) {
    return { name: match[1].trim().replace(/^"|"$/g, ""), email: match[2].trim() };
  }
  return { name: "Mundo ONG", email: raw.trim() };
}

async function sendMail(opts: { to: string; subject: string; html: string }): Promise<void> {
  if (!ENV.brevoApiKey) {
    throw new Error(
      "\n\n❌ BREVO_API_KEY FALTANDO!\n" +
      "Gere uma API key em https://app.brevo.com/settings/keys/api e adicione no .env:\n\n" +
      "  BREVO_API_KEY=xkeysib-xxxxxxxx\n\n"
    );
  }

  const response = await fetch(BREVO_SEND_URL, {
    method: "POST",
    headers: {
      "api-key": ENV.brevoApiKey,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      sender: parseFrom(),
      to: [{ email: opts.to }],
      subject: opts.subject,
      htmlContent: opts.html,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao enviar email via Brevo (${response.status}): ${errorText}`);
  }
}

// Imagens hospedadas no Supabase Storage (bucket público) — emails não devem usar
// base64 inline, pois o app do Gmail (mobile) não renderiza bem imagens data:URI.
const STORAGE_BASE = "https://tciftqgyjixhrxtvqcrh.supabase.co/storage/v1/object/public/elopets-images/email-assets";
const APPROVED_BANNER_URL = `${STORAGE_BASE}/email-approved-banner.png`;
const CODE_BANNER_URL = `${STORAGE_BASE}/email-code-banner.png`;

// ============ Template base (visual profissional, cores da marca) ============

function baseTemplate(opts: {
  preheader: string;
  heading?: string;
  bodyHtml: string;
  accentColor?: string;
  headerImageUrl?: string;
  headerImageMode?: "full" | "compact";
}): string {
  const accent = opts.accentColor || "#F97316";

  const headerHtml = opts.headerImageUrl
    ? opts.headerImageMode === "compact"
      ? `
          <tr>
            <td align="center" style="background:linear-gradient(135deg,#FFF3E6 0%,#E6F6FF 100%);padding:32px 24px;">
              <img src="${opts.headerImageUrl}" alt="Mundo ONG" width="120" style="display:block;width:120px;height:120px;border-radius:20px;" />
            </td>
          </tr>`
      : `
          <tr>
            <td align="center" style="padding:0;line-height:0;font-size:0;">
              <img src="${opts.headerImageUrl}" alt="Mundo ONG" width="560" style="display:block;width:100%;max-width:560px;height:auto;" />
            </td>
          </tr>`
    : `
          <tr>
            <td align="center" style="background:linear-gradient(135deg,#FFF3E6 0%,#E6F6FF 100%);padding:32px 24px;">
              <span style="font-size:24px;font-weight:800;font-family:'Nunito',sans-serif;">
                <span style="color:#F97316;">Mundo</span> <span style="color:#0EA5E9;">ONG</span>
              </span>
              <div style="font-size:28px;margin-top:4px;">🐾</div>
            </td>
          </tr>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Mundo ONG</title>
</head>
<body style="margin:0;padding:0;background-color:#FFF8F0;font-family:'Nunito',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF8F0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
${headerHtml}

          <!-- Faixa de destaque -->
          <tr>
            <td style="height:6px;background:linear-gradient(90deg,#F97316 0%,#0EA5E9 100%);"></td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="padding:40px 36px 8px;">
              ${opts.heading ? `<h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;color:#1f2937;font-weight:800;text-align:center;">${opts.heading}</h1>` : ""}
              ${opts.bodyHtml}
            </td>
          </tr>

          <!-- Botão: Ir para Mundo ONG -->
          <tr>
            <td style="padding:8px 36px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${ENV.siteUrl}" style="display:inline-block;background-color:#0EA5E9;color:#ffffff;text-decoration:none;font-weight:800;font-size:15px;padding:14px 36px;border-radius:999px;font-family:'Nunito',sans-serif;">
                      Ir para Mundo ONG
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="padding:0 36px 36px;">
              <div style="height:1px;background-color:#F3E8DD;margin-bottom:24px;"></div>
              <p style="margin:0 0 6px;font-size:13px;color:#9ca3af;text-align:center;line-height:1.6;">
                Este é um email automático do <strong style="color:#6b7280;">Mundo ONG</strong> 🐾<br/>
                Conectando animais a lares cheios de amor.
              </p>
              <p style="margin:0;font-size:12px;color:#c4c4c4;text-align:center;">
                Se você não solicitou esta ação, pode ignorar este email com segurança.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function codeBlockHtml(code: string, accent: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
      <tr>
        <td align="center">
          <div style="display:inline-block;background-color:#FFF8F0;border:2px dashed ${accent};border-radius:16px;padding:18px 36px;">
            <span style="font-size:34px;font-weight:800;letter-spacing:8px;color:#1f2937;font-family:'Courier New',monospace;">${code}</span>
          </div>
        </td>
      </tr>
    </table>`;
}

// ============ Envio: confirmação de email ============

export async function sendConfirmationEmail(to: string, name: string, code: string): Promise<void> {
  const html = baseTemplate({
    preheader: `Seu código de confirmação Mundo ONG: ${code}`,
    headerImageUrl: CODE_BANNER_URL,
    accentColor: "#F97316",
    bodyHtml: `
      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4b5563;text-align:center;">
        Olá, ${name}! Estamos muito felizes em ter sua ONG com a gente. Use o código abaixo para confirmar seu email e ativar sua conta:
      </p>
      ${codeBlockHtml(code, "#F97316")}
      <p style="margin:0 0 4px;font-size:14px;line-height:1.6;color:#9ca3af;text-align:center;">
        Este código expira em <strong>15 minutos</strong>.
      </p>
    `,
  });

  await sendMail({ to, subject: "Confirme seu email • Mundo ONG", html });
}

// ============ Envio: redefinição de senha ============

export async function sendPasswordResetEmail(to: string, name: string, code: string): Promise<void> {
  const html = baseTemplate({
    preheader: `Seu código de redefinição de senha Mundo ONG: ${code}`,
    headerImageUrl: CODE_BANNER_URL,
    accentColor: "#0EA5E9",
    bodyHtml: `
      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4b5563;text-align:center;">
        Olá, ${name}! Recebemos uma solicitação para redefinir a senha da sua conta no Mundo ONG. Use o código abaixo para continuar:
      </p>
      ${codeBlockHtml(code, "#0EA5E9")}
      <p style="margin:0 0 4px;font-size:14px;line-height:1.6;color:#9ca3af;text-align:center;">
        Este código expira em <strong>15 minutos</strong>. Se não foi você quem solicitou, ignore este email — sua senha continuará a mesma.
      </p>
    `,
  });

  await sendMail({ to, subject: "Redefinição de senha • Mundo ONG", html });
}

// ============ Envio: confirmação de alteração de perfil ============

const PROFILE_FIELD_LABELS: Record<string, string> = {
  phone: "Telefone",
  website: "Site",
  city: "Cidade",
  instagram: "Instagram",
};

export async function sendProfileChangeCode(
  to: string,
  name: string,
  code: string,
  changedFields: string[]
): Promise<void> {
  const fieldsLabel = changedFields.map((f) => PROFILE_FIELD_LABELS[f] || f).join(", ");
  const html = baseTemplate({
    preheader: `Seu código de confirmação de alteração de perfil Mundo ONG: ${code}`,
    headerImageUrl: CODE_BANNER_URL,
    accentColor: "#0EA5E9",
    heading: "Confirmar alteração de perfil 🔒",
    bodyHtml: `
      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4b5563;text-align:center;">
        Olá, ${name}! Recebemos uma solicitação para alterar os seguintes dados do perfil da sua ONG: <strong>${fieldsLabel}</strong>. Use o código abaixo para confirmar essa alteração:
      </p>
      ${codeBlockHtml(code, "#0EA5E9")}
      <p style="margin:0 0 4px;font-size:14px;line-height:1.6;color:#9ca3af;text-align:center;">
        Este código expira em <strong>15 minutos</strong>. Se não foi você quem solicitou, ignore este email — nada será alterado.
      </p>
    `,
  });

  await sendMail({ to, subject: "Confirme a alteração do seu perfil • Mundo ONG", html });
}

// ============ Envio: ONG aprovada ============

export async function sendOngApprovedEmail(to: string, name: string): Promise<void> {
  const html = baseTemplate({
    preheader: `Sua ONG ${name} foi aprovada no Mundo ONG!`,
    headerImageUrl: APPROVED_BANNER_URL,
    accentColor: "#0EA5E9",
    bodyHtml: `
      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4b5563;text-align:center;">
        Boas notícias, <strong>${name}</strong>! Sua ONG foi analisada e aprovada pela nossa equipe. Agora você já pode fazer login no site com seu email e senha para acessar o painel da sua ONG, publicar pedidos de ajuda e aparecer na nossa lista de parceiras.
      </p>
      <p style="margin:0 0 4px;font-size:14px;line-height:1.6;color:#9ca3af;text-align:center;">
        Obrigado por fazer parte do Mundo ONG! 🐾
      </p>
    `,
  });

  await sendMail({ to, subject: "Sua ONG foi aprovada! 🎉 • Mundo ONG", html });
}
