import { parse as parseCookieHeader } from "cookie";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  createOngPending, getPendingOngs, getAllOngApplications,
  approveOng, rejectOng,
  getAdminByEmail, verifyAdminPassword,
  getOngByEmail, verifyOngPassword, getOngById,
  getAllApprovedOngs, getAllOngsAdmin, getApprovedOngById,
  deleteOngAndPosts,
  createOngPost, getOngPosts, getAllOngPosts, getAllPostsAdmin,
  getOngPostsAdminAll, updateOngPost,
  deleteOngPost,
  getAdminLogs,
  createAdminUser,
  getPostById, getPostByIdAny,
  uploadImage,
  recordLogin, getLoginHistory, getPostHistory,
  updateOngProfile,
  reportPost, getPostReportsCount, hasUserReportedPost, getReportedPostsAdmin,
  createEmailConfirmationCode, confirmEmailCode, getOngEmailConfirmedStatus,
  createPasswordResetCode, resetPasswordWithCode,
  stripSensitiveOngFields,
  requestOngProfileChange, confirmOngProfileChange,
  getOngContactMethods, addOngContactMethod, updateOngContactMethod, deleteOngContactMethod,
} from "../supabase";
import { sendConfirmationEmail, sendPasswordResetEmail, sendOngApprovedEmail, sendProfileChangeCode } from "../email";
import { isValidCNPJ, isValidCPF, lookupCnpj, onlyDigits } from "../cpfCnpj";
const ANIMAL_KEYWORDS_MESSAGE =
  "O CNPJ informado não parece ser de uma ONG de proteção animal (a razão social precisa conter palavras como ANIMAL, PROTEÇÃO, RESGATE, ABRIGO, FAUNA, PATAS, BICHO, etc).";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "../../shared/const";
import { getSessionCookieOptions } from "../_core/cookies";

function getCookie(req: { headers: { cookie?: string } }, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  return parseCookieHeader(header)[name];
}

function getAdminEmailFromCookie(req: { headers: { cookie?: string } }): string | null {
  const token = getCookie(req, COOKIE_NAME);
  if (!token) return null;
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString());
    if (decoded.type !== "admin") return null;
    return decoded.email || null;
  } catch {
    return null;
  }
}

function getOngSessionFromCookie(req: { headers: { cookie?: string } }): { id: string; email: string } | null {
  const token = getCookie(req, COOKIE_NAME);
  if (!token) return null;
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString());
    if (decoded.type !== "ong") return null;
    return { id: decoded.id, email: decoded.email };
  } catch {
    return null;
  }
}

function requireOngSession(req: { headers: { cookie?: string } }, ongId?: string): { id: string; email: string } {
  const session = getOngSessionFromCookie(req);
  if (!session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Faça login para continuar." });
  if (ongId && session.id !== ongId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Você não tem permissão para esta ação." });
  }
  return session;
}

function requireAdminSession(req: { headers: { cookie?: string } }): string {
  const email = getAdminEmailFromCookie(req);
  if (!email) throw new TRPCError({ code: "UNAUTHORIZED", message: "Acesso restrito ao admin." });
  return email;
}

// Autoriza updatePost/deletePost: admin logado pode mexer em qualquer post;
// senão, só a própria ONG dona do post.
async function requireOwnerOrAdminForPost(req: { headers: { cookie?: string } }, postId: string): Promise<string | null> {
  const adminEmail = getAdminEmailFromCookie(req);
  if (adminEmail) return adminEmail;
  const post = await getPostByIdAny(postId);
  if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post não encontrado." });
  requireOngSession(req, post.ong_id);
  return null;
}

// ============================================================
export const ongsRouter = router({

  // Public: Consultar dados de uma empresa pelo CNPJ (BrasilAPI)
  lookupCnpj: publicProcedure
    .input(z.object({ cnpj: z.string() }))
    .query(async ({ input }) => {
      try {
        return await lookupCnpj(input.cnpj);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  // Public: Cadastrar ONG
  register: publicProcedure
    .input(z.object({
      name: z.string().min(3),
      description: z.string().min(10),
      email: z.string().email(),
      password: z.string().min(6),
      phone: z.string().optional(),
      city: z.string().min(2),
      state: z.string().length(2),
      website: z.string().optional(),
      instagram: z.string().optional(),
      cnpj: z.string().refine(isValidCNPJ, "CNPJ inválido."),
      responsibleName: z.string().min(3, "Informe o nome completo do responsável."),
      responsibleCpf: z.string().refine(isValidCPF, "CPF inválido."),
    }))
    .mutation(async ({ input }) => {
      try {
        const cnpj = onlyDigits(input.cnpj);
        const company = await lookupCnpj(cnpj);
        if (!company.isAnimalRelated) {
          throw new TRPCError({ code: "BAD_REQUEST", message: ANIMAL_KEYWORDS_MESSAGE });
        }
        const ong = await createOngPending({
          ...input,
          cnpj,
          responsibleCpf: onlyDigits(input.responsibleCpf),
        }) as any;
        sendConfirmationEmail(ong.email, ong.name, ong.confirmation_code).catch(emailError => {
          console.error("Erro ao enviar email de confirmação:", emailError);
        });
        return { success: true, message: "ONG cadastrada com sucesso! Aguarde análise.", ongId: ong.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        const isDuplicate = error.message?.includes("já está cadastrado");
        throw new TRPCError({
          code: isDuplicate ? "CONFLICT" : "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }
    }),

  // Admin: Listar ONGs Pendentes
  listPending: publicProcedure
    .input(z.object({ status: z.string().optional() }))
    .query(async () => {
      try { return await getPendingOngs(); }
      catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
    }),

  // Admin: Todas as candidaturas (pending + approved + rejected)
  getAllApplications: publicProcedure.query(async () => {
    try { return await getAllOngApplications(); }
    catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
  }),

  // Admin: Aprovar ONG
  approve: publicProcedure
    .input(z.object({ ongId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const adminEmail = getAdminEmailFromCookie(ctx.req) ?? "admin";
      try {
        const approvedOng = await approveOng(input.ongId, adminEmail);
        sendOngApprovedEmail(approvedOng.email, approvedOng.name).catch(emailError => {
          console.error("Erro ao enviar email de ONG aprovada:", emailError);
        });
        return { success: true, message: "ONG aprovada com sucesso!", ong: approvedOng };
      } catch (error: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
    }),

  // Admin: Rejeitar ONG
  reject: publicProcedure
    .input(z.object({ ongId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const adminEmail = getAdminEmailFromCookie(ctx.req) ?? "admin";
      try {
        await rejectOng(input.ongId, adminEmail);
        return { success: true, message: "ONG rejeitada com sucesso!" };
      } catch (error: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
    }),

  // Admin: Todas as ONGs aprovadas (para gestão)
  getAllOngsAdmin: publicProcedure.query(async () => {
    try { return await getAllOngsAdmin(); }
    catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
  }),

  // Admin: Deletar ONG + todos os posts
  deleteOng: publicProcedure
    .input(z.object({ ongId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const adminEmail = getAdminEmailFromCookie(ctx.req) ?? "admin";
      try {
        await deleteOngAndPosts(input.ongId, adminEmail);
        return { success: true, message: "ONG e posts removidos com sucesso!" };
      } catch (error: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
    }),

  // Public: Listar ONGs Aprovadas (ativas)
  getAllApproved: publicProcedure.query(async () => {
    try {
      const ongs = await getAllApprovedOngs();
      return ongs.map(stripSensitiveOngFields);
    } catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
  }),

  // Public: Posts de uma ONG
  getPostsByOng: publicProcedure
    .input(z.string())
    .query(async ({ input: ongId }) => {
      if (!ongId) return [];
      try { return await getOngPosts(ongId); }
      catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
    }),

  // Public: Todos os posts ativos
  getAllPosts: publicProcedure.query(async () => {
    try { return await getAllOngPosts(); }
    catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
  }),

  // Admin: Todos os posts com nome da ONG
  getAllPostsAdmin: publicProcedure.query(async () => {
    try { return await getAllPostsAdmin(); }
    catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
  }),

  // Admin: Todos os posts (ativos + desativados) de uma ONG, para histórico
  getOngPostsAdminAll: publicProcedure
    .input(z.string())
    .query(async ({ input: ongId }) => {
      if (!ongId) return [];
      try { return await getOngPostsAdminAll(ongId); }
      catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
    }),

  // ONG: Criar Post
  createPost: publicProcedure
    .input(z.object({
      ongId: z.string(),
      type: z.enum(["donation", "request_food", "request_medicine", "request_other"]),
      title: z.string().min(3),
      description: z.string().min(10),
      items: z.string().optional(),
      isUrgent: z.boolean().default(false),
      image_url: z.string().optional(),
      pet_name: z.string().optional(),
      pet_age: z.string().optional(),
      pet_breed: z.string().optional(),
      pet_gender: z.string().optional(),
      pet_size: z.string().optional(),
      pet_vaccinated: z.boolean().optional(),
      pet_castrated: z.boolean().optional(),
      pet_color: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const post = await createOngPost(input);
        return { success: true, message: "Post criado com sucesso!", post };
      } catch (error: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
    }),

  // ONG: Atualizar Perfil
  // Campos sem risco (nome, descrição, UF, imagens) — alterados direto, sem código.
  // Telefone/site/cidade/instagram ficam em requestProfileChange/confirmProfileChange.
  updateProfile: publicProcedure
    .input(z.object({
      ongId: z.string(),
      name: z.string().min(3).optional(),
      description: z.string().min(10).optional(),
      state: z.string().length(2).optional(),
      banner_url: z.string().optional(),
      avatar_url: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { ongId, ...data } = input;
      requireOngSession(ctx.req, ongId);
      try {
        const updated = await updateOngProfile(ongId, data);
        return { success: true, ong: updated };
      } catch (error: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
    }),

  // ONG autenticada: solicita alteração de telefone/site/cidade/instagram
  // (envia código de confirmação por email; nada é alterado ainda)
  requestProfileChange: publicProcedure
    .input(z.object({
      phone: z.string().optional(),
      website: z.string().optional(),
      city: z.string().optional(),
      instagram: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const session = requireOngSession(ctx.req);
      try {
        const result = await requestOngProfileChange(session.id, input);
        if (!result.changed || !result.code || !result.ong || !result.diff) {
          return { success: true, changed: false };
        }
        try {
          await sendProfileChangeCode(result.ong.email, result.ong.name, result.code, Object.keys(result.diff));
        } catch (emailError) {
          console.error("Erro ao enviar código de alteração de perfil:", emailError);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível enviar o código de confirmação. Tente novamente." });
        }
        return { success: true, changed: true };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
    }),

  // ONG autenticada: confirma a alteração pendente com o código recebido por email
  confirmProfileChange: publicProcedure
    .input(z.object({ code: z.string().length(6) }))
    .mutation(async ({ input, ctx }) => {
      const session = requireOngSession(ctx.req);
      try {
        const updated = await confirmOngProfileChange(session.id, input.code);
        return { success: true, ong: updated };
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  // Público: lista os meios de contato ativos de uma ONG (usado no "Entrar em contato")
  listContactMethods: publicProcedure
    .input(z.string())
    .query(async ({ input: ongId }) => {
      try { return await getOngContactMethods(ongId, true); }
      catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
    }),

  // ONG autenticada: lista todos os seus meios de contato (ativos e inativos)
  listMyContactMethods: publicProcedure.query(async ({ ctx }) => {
    const session = requireOngSession(ctx.req);
    try { return await getOngContactMethods(session.id, false); }
    catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
  }),

  addContactMethod: publicProcedure
    .input(z.object({
      type: z.enum(["whatsapp", "email", "instagram", "facebook", "website", "other"]),
      label: z.string().optional(),
      value: z.string().min(3),
    }))
    .mutation(async ({ input, ctx }) => {
      const session = requireOngSession(ctx.req);
      try { return { success: true, method: await addOngContactMethod(session.id, input) }; }
      catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
    }),

  updateContactMethod: publicProcedure
    .input(z.object({
      id: z.string(),
      label: z.string().optional(),
      value: z.string().min(3).optional(),
      enabled: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const session = requireOngSession(ctx.req);
      const { id, ...data } = input;
      try { return { success: true, method: await updateOngContactMethod(id, session.id, data) }; }
      catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
    }),

  deleteContactMethod: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const session = requireOngSession(ctx.req);
      try {
        await deleteOngContactMethod(input.id, session.id);
        return { success: true };
      } catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
    }),

  // Public: ONG por ID (com dados do banco real)
  getById: publicProcedure
    .input(z.string())
    .query(async ({ input: id }) => {
      try {
        const ong = await getApprovedOngById(id);
        return ong ? stripSensitiveOngFields(ong) : ong;
      } catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
    }),

  // ONG/Admin: Deletar Post
  deletePost: publicProcedure
    .input(z.string())
    .mutation(async ({ input: postId, ctx }) => {
      const adminEmail = await requireOwnerOrAdminForPost(ctx.req, postId);
      try {
        await deleteOngPost(postId, adminEmail ?? undefined);
        return { success: true, message: "Post deletado com sucesso!" };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
    }),

  // ONG: Atualizar Post já publicado
  updatePost: publicProcedure
    .input(z.object({
      postId: z.string(),
      type: z.enum(["donation", "request_food", "request_medicine", "request_other"]).optional(),
      title: z.string().min(3).optional(),
      description: z.string().min(10).optional(),
      items: z.string().optional(),
      isUrgent: z.boolean().optional(),
      image_url: z.string().optional(),
      pet_name: z.string().optional(),
      pet_age: z.string().optional(),
      pet_breed: z.string().optional(),
      pet_gender: z.string().optional(),
      pet_size: z.string().optional(),
      pet_vaccinated: z.boolean().optional(),
      pet_castrated: z.boolean().optional(),
      pet_color: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { postId, ...data } = input;
      await requireOwnerOrAdminForPost(ctx.req, postId);
      try {
        const post = await updateOngPost(postId, data);
        return { success: true, message: "Post atualizado com sucesso!", post };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
    }),

  // Público: Reportar um anúncio (limite de 1 denúncia por anúncio por pessoa)
  reportPost: publicProcedure
    .input(z.object({
      postId: z.string(),
      reporterKey: z.string(), // identificador anônimo do navegador de quem denuncia
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const already = await hasUserReportedPost(input.postId, input.reporterKey);
        if (already) {
          throw new Error("Você já denunciou este anúncio.");
        }
        await reportPost(input.postId, input.reporterKey, input.reason);
        return { success: true, message: "Denúncia enviada. Nossa equipe vai analisar este anúncio." };
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  // Admin: Contagem de denúncias por post
  getPostReportsCount: publicProcedure
    .input(z.string())
    .query(async ({ input: postId }) => {
      try { return await getPostReportsCount(postId); }
      catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
    }),

  // Admin: Posts denunciados, ordenados do mais denunciado para o menos denunciado
  getReportedPosts: publicProcedure.query(async ({ ctx }) => {
    requireAdminSession(ctx.req);
    try { return await getReportedPostsAdmin(); }
    catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
  }),


  // Public: Buscar post por ID
  getPostById: publicProcedure
    .input(z.string())
    .query(async ({ input: postId }) => {
      if (!postId) return null;
      try { return await getPostById(postId); }
      catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
    }),
  // Upload de imagem para o Supabase Storage
  uploadImage: publicProcedure
    .input(z.object({
      base64: z.string(),
      folder: z.string().default("misc"),
      filename: z.string().default("image"),
    }))
    .mutation(async ({ input }) => {
      try {
        const url = await uploadImage(input.base64, input.folder, input.filename);
        return { success: true, url };
      } catch (error: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
    }),

  // Admin: Logs
  getLogs: publicProcedure.query(async ({ ctx }) => {
    requireAdminSession(ctx.req);
    try { return await getAdminLogs(); }
    catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
  }),

  // Admin: Histórico de login de uma ONG (quando/quantas vezes logou)
  getOngLoginHistory: publicProcedure
    .input(z.string())
    .query(async ({ input: ongId, ctx }) => {
      requireAdminSession(ctx.req);
      try { return await getLoginHistory("ong", ongId); }
      catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
    }),

  // Admin: Histórico de posts de uma ONG (criado/editado/apagado/reativado)
  getOngPostHistory: publicProcedure
    .input(z.string())
    .query(async ({ input: ongId, ctx }) => {
      requireAdminSession(ctx.req);
      try { return await getPostHistory(ongId); }
      catch (error: any) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message }); }
    }),
});

// ============================================================
export const adminAuthRouter = router({
  me: publicProcedure.query(async ({ ctx }) => {
    const token = getCookie(ctx.req, COOKIE_NAME);
    if (!token) return null;
    try {
      const decoded = JSON.parse(Buffer.from(token, "base64").toString());
      if (decoded.type !== "admin") return null;
      return await getAdminByEmail(decoded.email) || null;
    } catch { return null; }
  }),

  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const isValid = await verifyAdminPassword(input.email, input.password);
        if (!isValid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou senha inválidos" });
        const admin = await getAdminByEmail(input.email);
        if (!admin) throw new TRPCError({ code: "NOT_FOUND", message: "Admin não encontrado" });
        const token = Buffer.from(JSON.stringify({ type: "admin", email: admin.email, id: admin.id })).toString("base64");
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
        try { await recordLogin("admin", admin.id, admin.email); } catch (e) { console.error("Erro ao registrar login do admin:", e); }
        return { success: true, admin };
      } catch (error: any) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: error.message || "Erro ao fazer login" });
      }
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),

  // Criar admin — usado pela rota interna /ssenhas
  createAdmin: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(6) }))
    .mutation(async ({ input }) => {
      try {
        const admin = await createAdminUser(input.email, input.password);
        return { success: true, admin: { id: admin.id, email: admin.email } };
      } catch (error: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
    }),
});

// ============================================================
export const ongAuthRouter = router({
  me: publicProcedure.query(async ({ ctx }) => {
    const token = getCookie(ctx.req, COOKIE_NAME);
    if (!token) return null;
    try {
      const decoded = JSON.parse(Buffer.from(token, "base64").toString());
      if (decoded.type !== "ong") return null;
      return await getOngById(decoded.id) || null;
    } catch { return null; }
  }),

  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const isValid = await verifyOngPassword(input.email, input.password);
        if (!isValid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou senha inválidos" });
        const ong = await getOngByEmail(input.email);
        if (!ong) throw new TRPCError({ code: "NOT_FOUND", message: "ONG não encontrada" });
        if (!ong.is_active) throw new TRPCError({ code: "UNAUTHORIZED", message: "Esta ONG foi desativada" });
        const token = Buffer.from(JSON.stringify({ type: "ong", email: ong.email, id: ong.id })).toString("base64");
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
        try { await recordLogin("ong", ong.id, ong.email); } catch (e) { console.error("Erro ao registrar login da ONG:", e); }
        return { success: true, ong };
      } catch (error: any) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: error.message || "Erro ao fazer login" });
      }
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),

  // Status de confirmação de email (para mostrar banner/aviso no painel)
  emailConfirmedStatus: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      try { return { confirmed: await getOngEmailConfirmedStatus(input.email) }; }
      catch { return { confirmed: null }; }
    }),

  // Reenviar / enviar código de confirmação de email
  resendConfirmation: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        const result = await createEmailConfirmationCode(input.email);
        if (result) {
          sendConfirmationEmail(input.email, result.name, result.code).catch(emailError => {
            console.error("Erro ao enviar email de confirmação:", emailError);
          });
          return { success: true, message: "Código de confirmação enviado! Verifique seu email." };
        }
        return { success: true, message: "Este email já está confirmado ou não foi encontrado." };
      } catch (error: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
    }),

  // Confirmar email com código
  confirmEmail: publicProcedure
    .input(z.object({ email: z.string().email(), code: z.string().min(6) }))
    .mutation(async ({ input }) => {
      try {
        await confirmEmailCode(input.email, input.code);
        return { success: true, message: "Email confirmado com sucesso!" };
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  // Solicitar código de redefinição de senha (ONG)
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        const result = await createPasswordResetCode(input.email);
        if (result) {
          sendPasswordResetEmail(input.email, result.name, result.code).catch(emailError => {
            console.error("Erro ao enviar email de redefinição de senha:", emailError);
          });
        }
      } catch (error) {
        console.error("Erro ao solicitar redefinição de senha:", error);
      }
      return { success: true, message: "Se este email existir em nossa base, você receberá um código de redefinição." };
    }),

  // Redefinir senha com código (ONG)
  resetPassword: publicProcedure
    .input(z.object({ email: z.string().email(), code: z.string().min(6), newPassword: z.string().min(6) }))
    .mutation(async ({ input }) => {
      try {
        await resetPasswordWithCode(input.email, input.code, input.newPassword);
        return { success: true, message: "Senha redefinida com sucesso!" };
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),
});
