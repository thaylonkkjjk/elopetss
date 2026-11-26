import { createClient, SupabaseClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import { ENV } from "./_core/env";

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;
  if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
    throw new Error(
      "\n\n❌ VARIÁVEIS DE AMBIENTE FALTANDO!\n" +
      "Crie um arquivo .env na raiz do projeto com:\n\n" +
      "  SUPABASE_URL=https://SEU_PROJETO.supabase.co\n" +
      "  SUPABASE_SERVICE_ROLE_KEY=eyJ...\n" +
      "  JWT_SECRET=qualquer_string_longa_aqui\n\n" +
      "Veja o arquivo .env.example para referência.\n"
    );
  }
  _supabase = createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey);
  return _supabase;
}

// ============ Interfaces ============

export interface OngPending {
  id: string;
  name: string;
  description: string;
  email: string;
  phone?: string;
  city: string;
  state: string;
  website?: string;
  instagram?: string;
  cnpj?: string;
  responsible_name?: string;
  responsible_cpf?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  password_hash?: string;
  is_active: boolean;
  created_at: string;
}

export interface OngApprovedUser {
  id: string;
  name: string;
  email: string;
  description: string;
  phone?: string;
  city: string;
  state: string;
  website?: string;
  instagram?: string;
  cnpj?: string;
  responsible_name?: string;
  responsible_cpf?: string;
  is_active: boolean;
  created_at: string;
}

// Campos sensíveis que nunca devem ser expostos em endpoints públicos
// (uso exclusivo da administração da plataforma).
export function stripSensitiveOngFields<T extends { responsible_name?: any; responsible_cpf?: any }>(
  ong: T
): Omit<T, "responsible_name" | "responsible_cpf"> {
  const { responsible_name, responsible_cpf, ...rest } = ong;
  return rest;
}

export interface OngPostData {
  id: string;
  ong_id: string;
  type: "donation" | "request_food" | "request_medicine" | "request_other";
  title: string;
  description: string;
  items?: string;
  image_url?: string;
  is_urgent: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminLog {
  id: string;
  admin_email: string;
  action: "approve" | "reject" | "delete_ong" | "delete_post";
  target_type: "ong" | "post";
  target_id: string;
  target_name: string;
  notes?: string;
  created_at: string;
}

// ============ Admin Logs ============

export async function createAdminLog(data: {
  adminEmail: string;
  action: AdminLog["action"];
  targetType: AdminLog["target_type"];
  targetId: string;
  targetName: string;
  notes?: string;
}): Promise<void> {
  await getSupabase()
    .from("admin_logs")
    .insert([{
      admin_email: data.adminEmail,
      action: data.action,
      target_type: data.targetType,
      target_id: data.targetId,
      target_name: data.targetName,
      notes: data.notes || null,
    }]);
}

export async function getAdminLogs(): Promise<AdminLog[]> {
  const { data, error } = await getSupabase()
    .from("admin_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(`Erro ao buscar logs: ${error.message}`);
  return data || [];
}

// ============ ONGs Pending ============

// Verifica se já existe uma ONG (pendente, aprovada ou rejeitada) com o mesmo e-mail ou telefone
export async function checkOngEmailOrPhoneTaken(
  email: string,
  phone?: string
): Promise<"email" | "phone" | null> {
  const db = getSupabase();

  const { data: pendingByEmail } = await db
    .from("ongs_pending")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (pendingByEmail) return "email";

  const { data: approvedByEmail } = await db
    .from("ongs_approved")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (approvedByEmail) return "email";

  if (phone) {
    const { data: pendingByPhone } = await db
      .from("ongs_pending")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();
    if (pendingByPhone) return "phone";

    const { data: approvedByPhone } = await db
      .from("ongs_approved")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();
    if (approvedByPhone) return "phone";
  }

  return null;
}

// Verifica se já existe uma ONG (pendente ou aprovada) cadastrada com o mesmo CNPJ
export async function checkCnpjTaken(cnpj: string): Promise<boolean> {
  const db = getSupabase();

  const { data: pending } = await db
    .from("ongs_pending")
    .select("id")
    .eq("cnpj", cnpj)
    .maybeSingle();
  if (pending) return true;

  const { data: approved } = await db
    .from("ongs_approved")
    .select("id")
    .eq("cnpj", cnpj)
    .maybeSingle();
  return !!approved;
}

export async function createOngPending(data: {
  name: string;
  description: string;
  email: string;
  phone?: string;
  city: string;
  state: string;
  password: string;
  website?: string;
  instagram?: string;
  cnpj: string;
  responsibleName: string;
  responsibleCpf: string;
}): Promise<OngPending> {
  const taken = await checkOngEmailOrPhoneTaken(data.email, data.phone);
  if (taken === "email") {
    throw new Error("Este e-mail já está cadastrado no site.");
  }
  if (taken === "phone") {
    throw new Error("Este telefone já está cadastrado no site.");
  }
  if (await checkCnpjTaken(data.cnpj)) {
    throw new Error("Este CNPJ já está cadastrado no site.");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const confirmationCode = generateCode();
  const confirmationExpiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();
  const { data: ong, error } = await getSupabase()
    .from("ongs_pending")
    .insert([{
      name: data.name,
      description: data.description,
      email: data.email,
      phone: data.phone || null,
      city: data.city,
      state: data.state,
      password_hash: hashedPassword,
      website: data.website || null,
      instagram: data.instagram || null,
      cnpj: data.cnpj,
      responsible_name: data.responsibleName,
      responsible_cpf: data.responsibleCpf,
      status: "pending",
      email_confirmed: false,
      confirmation_code: confirmationCode,
      confirmation_code_expires_at: confirmationExpiresAt,
    }])
    .select()
    .single();
  if (error) throw new Error(`Erro ao criar ONG pendente: ${error.message}`);
  return { ...ong, confirmation_code: confirmationCode } as OngPending & { confirmation_code: string };
}

export async function getPendingOngs(): Promise<OngPending[]> {
  const { data, error } = await getSupabase()
    .from("ongs_pending")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Erro ao buscar ONGs pendentes: ${error.message}`);
  return data || [];
}

export async function getAllOngApplications(): Promise<OngPending[]> {
  const { data, error } = await getSupabase()
    .from("ongs_pending")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Erro ao buscar candidaturas: ${error.message}`);
  return data || [];
}

export async function approveOng(ongId: string, adminEmail: string): Promise<OngApprovedUser> {
  const { data: pendingOng, error: fetchError } = await getSupabase()
    .from("ongs_pending")
    .select("*")
    .eq("id", ongId)
    .single();
  if (fetchError || !pendingOng) throw new Error("ONG não encontrada");

  const { data: approvedOng, error: insertError } = await getSupabase()
    .from("ongs_approved")
    .insert([{
      name: pendingOng.name,
      description: pendingOng.description,
      email: pendingOng.email,
      phone: pendingOng.phone,
      city: pendingOng.city,
      state: pendingOng.state,
      password_hash: pendingOng.password_hash,
      website: pendingOng.website,
      instagram: pendingOng.instagram,
      cnpj: pendingOng.cnpj,
      responsible_name: pendingOng.responsible_name,
      responsible_cpf: pendingOng.responsible_cpf,
      is_active: true,
      email_confirmed: pendingOng.email_confirmed || false,
    }])
    .select()
    .single();
  if (insertError) throw new Error(`Erro ao aprovar ONG: ${insertError.message}`);

  await getSupabase()
    .from("ongs_pending")
    .update({ status: "approved" })
    .eq("id", ongId);

  await createAdminLog({
    adminEmail,
    action: "approve",
    targetType: "ong",
    targetId: ongId,
    targetName: pendingOng.name,
    notes: `ONG ${pendingOng.email} aprovada`,
  });

  await seedContactMethodsForOng(approvedOng.id, {
    phone: pendingOng.phone,
    email: pendingOng.email,
    instagram: pendingOng.instagram,
    website: pendingOng.website,
  });

  return approvedOng;
}

// ============ Meios de Contato da ONG ============

export interface OngContactMethod {
  id: string;
  ong_id: string;
  type: "whatsapp" | "email" | "instagram" | "facebook" | "website" | "other";
  label: string | null;
  value: string;
  enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

async function seedContactMethodsForOng(ongId: string, fields: {
  phone?: string | null;
  email?: string | null;
  instagram?: string | null;
  website?: string | null;
}): Promise<void> {
  const rows: Array<{ ong_id: string; type: OngContactMethod["type"]; value: string; sort_order: number }> = [];
  let order = 0;
  if (fields.phone) rows.push({ ong_id: ongId, type: "whatsapp", value: fields.phone, sort_order: order++ });
  if (fields.email) rows.push({ ong_id: ongId, type: "email", value: fields.email, sort_order: order++ });
  if (fields.instagram) rows.push({ ong_id: ongId, type: "instagram", value: fields.instagram, sort_order: order++ });
  if (fields.website) rows.push({ ong_id: ongId, type: "website", value: fields.website, sort_order: order++ });
  if (rows.length === 0) return;
  await getSupabase().from("ong_contact_methods").insert(rows);
}

export async function getOngContactMethods(ongId: string, onlyEnabled: boolean): Promise<OngContactMethod[]> {
  let query = getSupabase()
    .from("ong_contact_methods")
    .select("*")
    .eq("ong_id", ongId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (onlyEnabled) query = query.eq("enabled", true);
  const { data, error } = await query;
  if (error) throw new Error(`Erro ao buscar meios de contato: ${error.message}`);
  return data || [];
}

export async function addOngContactMethod(ongId: string, data: {
  type: OngContactMethod["type"];
  label?: string;
  value: string;
}): Promise<OngContactMethod> {
  const { data: existing } = await getSupabase()
    .from("ong_contact_methods")
    .select("sort_order")
    .eq("ong_id", ongId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = existing ? existing.sort_order + 1 : 0;

  const { data: created, error } = await getSupabase()
    .from("ong_contact_methods")
    .insert([{
      ong_id: ongId,
      type: data.type,
      label: data.label || null,
      value: data.value,
      enabled: true,
      sort_order: nextOrder,
    }])
    .select()
    .single();
  if (error) throw new Error(`Erro ao adicionar meio de contato: ${error.message}`);
  return created;
}

export async function updateOngContactMethod(id: string, ongId: string, data: {
  label?: string;
  value?: string;
  enabled?: boolean;
}): Promise<OngContactMethod> {
  const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
  if (data.label !== undefined) updateData.label = data.label || null;
  if (data.value !== undefined) updateData.value = data.value;
  if (data.enabled !== undefined) updateData.enabled = data.enabled;

  const { data: updated, error } = await getSupabase()
    .from("ong_contact_methods")
    .update(updateData)
    .eq("id", id)
    .eq("ong_id", ongId)
    .select()
    .single();
  if (error || !updated) throw new Error("Meio de contato não encontrado.");
  return updated;
}

export async function deleteOngContactMethod(id: string, ongId: string): Promise<void> {
  const { error } = await getSupabase()
    .from("ong_contact_methods")
    .delete()
    .eq("id", id)
    .eq("ong_id", ongId);
  if (error) throw new Error(`Erro ao remover meio de contato: ${error.message}`);
}

export async function rejectOng(ongId: string, adminEmail: string): Promise<void> {
  const { data: pendingOng } = await getSupabase()
    .from("ongs_pending")
    .select("name, email")
    .eq("id", ongId)
    .single();

  const { error } = await getSupabase()
    .from("ongs_pending")
    .update({ status: "rejected" })
    .eq("id", ongId);
  if (error) throw new Error(`Erro ao rejeitar ONG: ${error.message}`);

  if (pendingOng) {
    await createAdminLog({
      adminEmail,
      action: "reject",
      targetType: "ong",
      targetId: ongId,
      targetName: pendingOng.name,
      notes: `ONG ${pendingOng.email} rejeitada`,
    });
  }
}

// ============ Admin Users ============

export async function createAdminUser(email: string, password: string): Promise<AdminUser> {
  const hashedPassword = await bcrypt.hash(password, 10);
  const { data: admin, error } = await getSupabase()
    .from("admin_users")
    .insert([{ email, password_hash: hashedPassword, is_active: true }])
    .select()
    .single();
  if (error) throw new Error(`Erro ao criar admin: ${error.message}`);
  return admin;
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  const { data, error } = await getSupabase()
    .from("admin_users")
    .select("*")
    .eq("email", email)
    .single();
  if (error) return null;
  return data || null;
}

export async function verifyAdminPassword(email: string, password: string): Promise<boolean> {
  const admin = await getAdminByEmail(email);
  if (!admin || !admin.password_hash) return false;
  try {
    return await bcrypt.compare(password, admin.password_hash);
  } catch {
    return false;
  }
}

// ============ ONG Approved Users ============

export async function getOngByEmail(email: string): Promise<OngApprovedUser | null> {
  const { data, error } = await getSupabase()
    .from("ongs_approved")
    .select("*")
    .eq("email", email)
    .single();
  if (error) return null;
  return data || null;
}

export async function getOngById(id: string): Promise<OngApprovedUser | null> {
  const { data, error } = await getSupabase()
    .from("ongs_approved")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data || null;
}

export async function verifyOngPassword(email: string, password: string): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from("ongs_approved")
    .select("password_hash")
    .eq("email", email)
    .single();
  if (error || !data) return false;
  return bcrypt.compare(password, data.password_hash);
}

export async function getAllApprovedOngs(): Promise<OngApprovedUser[]> {
  const { data, error } = await getSupabase()
    .from("ongs_approved")
    .select("*")
    .neq("is_active", false)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Erro ao buscar ONGs aprovadas: ${error.message}`);
  return data || [];
}

export async function getAllOngsAdmin(): Promise<OngApprovedUser[]> {
  // Retorna TODAS, inclusive inativas
  const { data, error } = await getSupabase()
    .from("ongs_approved")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Erro ao buscar ONGs: ${error.message}`);
  return data || [];
}

export async function deleteOngAndPosts(ongId: string, adminEmail: string): Promise<void> {
  // Buscar info da ONG antes de deletar
  const { data: ong } = await getSupabase()
    .from("ongs_approved")
    .select("name, email")
    .eq("id", ongId)
    .single();

  // Desativar todos os posts
  await getSupabase()
    .from("ong_posts")
    .update({ is_active: false })
    .eq("ong_id", ongId);

  // Desativar a ONG (soft delete — preserva histórico)
  const { error } = await getSupabase()
    .from("ongs_approved")
    .update({ is_active: false })
    .eq("id", ongId);
  if (error) throw new Error(`Erro ao deletar ONG: ${error.message}`);

  if (ong) {
    await createAdminLog({
      adminEmail,
      action: "delete_ong",
      targetType: "ong",
      targetId: ongId,
      targetName: ong.name,
      notes: `ONG ${ong.email} removida. Todos os posts desativados.`,
    });
  }
}

// ============ ONG Posts ============

export async function createOngPost(data: {
  ongId: string;
  type: "donation" | "request_food" | "request_medicine" | "request_other";
  title: string;
  description: string;
  items?: string;
  isUrgent: boolean;
  image_url?: string;
  pet_name?: string;
  pet_age?: string;
  pet_breed?: string;
  pet_gender?: string;
  pet_size?: string;
  pet_vaccinated?: boolean;
  pet_castrated?: boolean;
  pet_color?: string;
}): Promise<OngPostData> {
  const { data: post, error } = await getSupabase()
    .from("ong_posts")
    .insert([{
      ong_id: data.ongId,
      type: data.type,
      title: data.title,
      description: data.description,
      items: data.items || null,
      is_urgent: data.isUrgent,
      is_active: true,
      image_url: data.image_url || null,
      pet_name: data.pet_name || null,
      pet_age: data.pet_age || null,
      pet_breed: data.pet_breed || null,
      pet_gender: data.pet_gender || null,
      pet_size: data.pet_size || null,
      pet_vaccinated: data.pet_vaccinated || false,
      pet_castrated: data.pet_castrated || false,
      pet_color: data.pet_color || null,
    }])
    .select()
    .single();
  if (error) throw new Error(`Erro ao criar post: ${error.message}`);
  return post;
}

export async function getOngPosts(ongId: string): Promise<OngPostData[]> {
  const { data, error } = await getSupabase()
    .from("ong_posts")
    .select("*")
    .eq("ong_id", ongId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Erro ao buscar posts: ${error.message}`);
  return data || [];
}

// Para admin: todos os posts de uma ONG (ativos + desativados), para o histórico
export async function getOngPostsAdminAll(ongId: string): Promise<OngPostData[]> {
  const { data, error } = await getSupabase()
    .from("ong_posts")
    .select("*")
    .eq("ong_id", ongId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Erro ao buscar posts da ONG: ${error.message}`);
  return data || [];
}

export async function updateOngPost(postId: string, data: {
  type?: "donation" | "request_food" | "request_medicine" | "request_other";
  title?: string;
  description?: string;
  items?: string;
  isUrgent?: boolean;
  image_url?: string;
  pet_name?: string;
  pet_age?: string;
  pet_breed?: string;
  pet_gender?: string;
  pet_size?: string;
  pet_vaccinated?: boolean;
  pet_castrated?: boolean;
  pet_color?: string;
}): Promise<OngPostData> {
  const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
  if (data.type !== undefined) updateData.type = data.type;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.items !== undefined) updateData.items = data.items || null;
  if (data.isUrgent !== undefined) updateData.is_urgent = data.isUrgent;
  if (data.image_url !== undefined) updateData.image_url = data.image_url || null;
  if (data.pet_name !== undefined) updateData.pet_name = data.pet_name || null;
  if (data.pet_age !== undefined) updateData.pet_age = data.pet_age || null;
  if (data.pet_breed !== undefined) updateData.pet_breed = data.pet_breed || null;
  if (data.pet_gender !== undefined) updateData.pet_gender = data.pet_gender || null;
  if (data.pet_size !== undefined) updateData.pet_size = data.pet_size || null;
  if (data.pet_vaccinated !== undefined) updateData.pet_vaccinated = data.pet_vaccinated;
  if (data.pet_castrated !== undefined) updateData.pet_castrated = data.pet_castrated;
  if (data.pet_color !== undefined) updateData.pet_color = data.pet_color || null;

  const { data: post, error } = await getSupabase()
    .from("ong_posts")
    .update(updateData)
    .eq("id", postId)
    .select()
    .single();
  if (error) throw new Error(`Erro ao atualizar post: ${error.message}`);
  return post;
}

export async function getAllOngPosts(): Promise<OngPostData[]> {
  const { data, error } = await getSupabase()
    .from("ong_posts")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Erro ao buscar todos os posts: ${error.message}`);
  return data || [];
}

export async function getAllPostsAdmin(): Promise<(OngPostData & { ong_name?: string })[]> {
  // Para admin: todos os posts ativos com nome da ONG
  const { data, error } = await getSupabase()
    .from("ong_posts")
    .select("*, ongs_approved(name)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Erro ao buscar posts: ${error.message}`);
  return (data || []).map((p: any) => ({
    ...p,
    ong_name: p.ongs_approved?.name,
  }));
}

// ============ Denúncias de anúncios ============

export async function reportPost(postId: string, reporterKey: string, reason?: string): Promise<void> {
  const { error } = await getSupabase()
    .from("post_reports")
    .insert([{ post_id: postId, reporter_key: reporterKey, reason: reason || null }]);
  // Código 23505 = unique_violation (a pessoa já denunciou este anúncio)
  if (error) {
    if ((error as any).code === "23505") {
      throw new Error("Você já denunciou este anúncio.");
    }
    throw new Error(`Erro ao registrar denúncia: ${error.message}`);
  }
}

export async function hasUserReportedPost(postId: string, reporterKey: string): Promise<boolean> {
  const { data } = await getSupabase()
    .from("post_reports")
    .select("id")
    .eq("post_id", postId)
    .eq("reporter_key", reporterKey)
    .maybeSingle();
  return !!data;
}

export async function getPostReportsCount(postId: string): Promise<number> {
  const { count, error } = await getSupabase()
    .from("post_reports")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);
  if (error) throw new Error(`Erro ao buscar denúncias: ${error.message}`);
  return count || 0;
}

// Admin: todos os posts que já receberam alguma denúncia, com a contagem de
// cada um, ordenados do mais denunciado para o menos denunciado.
export async function getReportedPostsAdmin(): Promise<(OngPostData & { ong_name?: string; report_count: number })[]> {
  const db = getSupabase();

  const { data: reports, error: reportsError } = await db.from("post_reports").select("post_id");
  if (reportsError) throw new Error(`Erro ao buscar denúncias: ${reportsError.message}`);
  if (!reports?.length) return [];

  const countByPost = new Map<string, number>();
  for (const r of reports) {
    countByPost.set(r.post_id, (countByPost.get(r.post_id) || 0) + 1);
  }

  const { data: posts, error: postsError } = await db
    .from("ong_posts")
    .select("*, ongs_approved(name)")
    .in("id", Array.from(countByPost.keys()));
  if (postsError) throw new Error(`Erro ao buscar posts denunciados: ${postsError.message}`);

  return (posts || [])
    .map((p: any) => ({
      ...p,
      ong_name: p.ongs_approved?.name,
      report_count: countByPost.get(p.id) || 0,
    }))
    .sort((a, b) => b.report_count - a.report_count);
}

export async function deleteOngPost(postId: string, adminEmail?: string): Promise<void> {
  // Buscar info do post antes
  const { data: post } = await getSupabase()
    .from("ong_posts")
    .select("title, ong_id")
    .eq("id", postId)
    .single();

  const { error } = await getSupabase()
    .from("ong_posts")
    .update({ is_active: false })
    .eq("id", postId);
  if (error) throw new Error(`Erro ao deletar post: ${error.message}`);

  if (adminEmail && post) {
    await createAdminLog({
      adminEmail,
      action: "delete_post",
      targetType: "post",
      targetId: postId,
      targetName: post.title,
      notes: `Post da ONG ${post.ong_id} removido`,
    });
  }
}

// ============ ONG Profile Update ============

// Campos de contato (telefone, site, cidade, instagram) NÃO entram aqui:
// eles só podem ser alterados via requestProfileChange/confirmProfileChange,
// que exigem confirmação por código enviado ao email da ONG.
export async function updateOngProfile(ongId: string, data: {
  name?: string;
  description?: string;
  state?: string;
  banner_url?: string;
  avatar_url?: string;
}): Promise<OngApprovedUser> {
  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.banner_url !== undefined) updateData.banner_url = data.banner_url;
  if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;
  updateData.updated_at = new Date().toISOString();

  const { data: updated, error } = await getSupabase()
    .from("ongs_approved")
    .update(updateData)
    .eq("id", ongId)
    .select()
    .single();

  if (error) throw new Error(`Erro ao atualizar perfil: ${error.message}`);
  return updated;
}

const PROFILE_CHANGE_FIELDS = ["phone", "website", "city", "instagram"] as const;
type ProfileChangeField = (typeof PROFILE_CHANGE_FIELDS)[number];

// Solicita alteração de telefone/site/cidade/instagram: calcula o que
// realmente mudou, grava como alteração pendente e gera um código de confirmação.
export async function requestOngProfileChange(
  ongId: string,
  changes: Partial<Record<ProfileChangeField, string>>
): Promise<{ changed: boolean; code?: string; ong?: OngApprovedUser; diff?: Partial<Record<ProfileChangeField, string>> }> {
  const { data: ong, error } = await getSupabase()
    .from("ongs_approved")
    .select("*")
    .eq("id", ongId)
    .single();
  if (error || !ong) throw new Error("ONG não encontrada.");

  const diff: Partial<Record<ProfileChangeField, string>> = {};
  for (const field of PROFILE_CHANGE_FIELDS) {
    if (changes[field] === undefined) continue;
    const newValue = changes[field] as string;
    const currentValue = (ong as any)[field] || "";
    if (newValue !== currentValue) diff[field] = newValue;
  }

  if (Object.keys(diff).length === 0) {
    return { changed: false };
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

  const { error: updateError } = await getSupabase()
    .from("ongs_approved")
    .update({
      profile_change_pending: diff,
      profile_change_code: code,
      profile_change_code_expires_at: expiresAt,
    })
    .eq("id", ongId);
  if (updateError) throw new Error(`Erro ao preparar alteração: ${updateError.message}`);

  return { changed: true, code, ong: ong as OngApprovedUser, diff };
}

export async function confirmOngProfileChange(ongId: string, code: string): Promise<OngApprovedUser> {
  const { data: ong, error } = await getSupabase()
    .from("ongs_approved")
    .select("*")
    .eq("id", ongId)
    .single();
  if (error || !ong) throw new Error("ONG não encontrada.");

  if (!ong.profile_change_code || !ong.profile_change_pending) {
    throw new Error("Não há nenhuma alteração pendente de confirmação.");
  }
  if (new Date(ong.profile_change_code_expires_at) < new Date()) {
    throw new Error("Código expirado. Solicite a alteração novamente.");
  }
  if (ong.profile_change_code !== code) {
    throw new Error("Código inválido.");
  }

  const updateData: Record<string, any> = {
    ...ong.profile_change_pending,
    profile_change_pending: null,
    profile_change_code: null,
    profile_change_code_expires_at: null,
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error: updateError } = await getSupabase()
    .from("ongs_approved")
    .update(updateData)
    .eq("id", ongId)
    .select()
    .single();
  if (updateError) throw new Error(`Erro ao aplicar alteração: ${updateError.message}`);
  return updated;
}

// ============ ONG by ID (public) ============

export async function getApprovedOngById(id: string): Promise<OngApprovedUser | null> {
  const { data, error } = await getSupabase()
    .from("ongs_approved")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();
  if (error) return null;
  return data || null;
}

export async function getPostById(postId: string): Promise<OngPostData | null> {
  const { data, error } = await getSupabase()
    .from("ong_posts")
    .select("*")
    .eq("id", postId)
    .eq("is_active", true)
    .single();
  if (error) return null;
  return data || null;
}

// Como getPostById, mas sem filtrar por is_active — usado para checar a dona
// (ong_id) de um post antes de autorizar updatePost/deletePost, mesmo que o
// post já esteja desativado.
export async function getPostByIdAny(postId: string): Promise<OngPostData | null> {
  const { data, error } = await getSupabase()
    .from("ong_posts")
    .select("*")
    .eq("id", postId)
    .single();
  if (error) return null;
  return data || null;
}

// ============ Login history ============

export interface LoginHistoryEntry {
  id: string;
  actor_type: "ong" | "admin";
  actor_id: string;
  actor_email: string;
  created_at: string;
}

export async function recordLogin(actorType: "ong" | "admin", actorId: string, actorEmail: string): Promise<void> {
  const now = new Date().toISOString();
  await getSupabase().from("login_history").insert([{ actor_type: actorType, actor_id: actorId, actor_email: actorEmail }]);
  await getSupabase()
    .from(actorType === "ong" ? "ongs_approved" : "admin_users")
    .update({ last_login_at: now })
    .eq("id", actorId);
}

export async function getLoginHistory(actorType: "ong" | "admin", actorId: string, limit = 50): Promise<LoginHistoryEntry[]> {
  const { data, error } = await getSupabase()
    .from("login_history")
    .select("*")
    .eq("actor_type", actorType)
    .eq("actor_id", actorId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Erro ao buscar histórico de login: ${error.message}`);
  return data || [];
}

// ============ Histórico de posts (criado/editado/apagado/reativado) ============
// Preenchido automaticamente por um trigger no Postgres (log_post_history),
// então cobre qualquer alteração em ong_posts, não só as feitas pela API.

export interface PostHistoryEntry {
  id: string;
  post_id: string;
  ong_id: string;
  action: "created" | "updated" | "deleted" | "reactivated";
  snapshot: OngPostData;
  changed_at: string;
}

export async function getPostHistory(ongId: string, limit = 200): Promise<PostHistoryEntry[]> {
  const { data, error } = await getSupabase()
    .from("post_history")
    .select("*")
    .eq("ong_id", ongId)
    .order("changed_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Erro ao buscar histórico de posts: ${error.message}`);
  return data || [];
}

// ============ Confirmação de Email + Redefinição de Senha ============

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const CODE_TTL_MS = 15 * 60 * 1000; // 15 minutos

// Gera e grava um código de confirmação de email para a ONG (pendente ou aprovada)
export async function createEmailConfirmationCode(email: string): Promise<{ name: string; code: string } | null> {
  const db = getSupabase();
  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

  const { data: pending } = await db
    .from("ongs_pending")
    .select("id, name, email_confirmed")
    .eq("email", email)
    .maybeSingle();
  if (pending) {
    if (pending.email_confirmed) return null;
    await db.from("ongs_pending")
      .update({ confirmation_code: code, confirmation_code_expires_at: expiresAt })
      .eq("id", pending.id);
    return { name: pending.name, code };
  }

  const { data: approved } = await db
    .from("ongs_approved")
    .select("id, name, email_confirmed")
    .eq("email", email)
    .maybeSingle();
  if (approved) {
    if (approved.email_confirmed) return null;
    await db.from("ongs_approved")
      .update({ confirmation_code: code, confirmation_code_expires_at: expiresAt })
      .eq("id", approved.id);
    return { name: approved.name, code };
  }

  return null;
}

// Verifica o código e marca o email como confirmado (na tabela em que a ONG estiver)
export async function confirmEmailCode(email: string, code: string): Promise<void> {
  const db = getSupabase();

  const { data: pending } = await db
    .from("ongs_pending")
    .select("id, confirmation_code, confirmation_code_expires_at")
    .eq("email", email)
    .maybeSingle();
  if (pending) {
    if (pending.confirmation_code !== code) throw new Error("Código inválido.");
    if (!pending.confirmation_code_expires_at || new Date(pending.confirmation_code_expires_at) < new Date()) {
      throw new Error("Código expirado. Solicite um novo.");
    }
    await db.from("ongs_pending")
      .update({ email_confirmed: true, confirmation_code: null, confirmation_code_expires_at: null })
      .eq("id", pending.id);
    return;
  }

  const { data: approved } = await db
    .from("ongs_approved")
    .select("id, confirmation_code, confirmation_code_expires_at")
    .eq("email", email)
    .maybeSingle();
  if (approved) {
    if (approved.confirmation_code !== code) throw new Error("Código inválido.");
    if (!approved.confirmation_code_expires_at || new Date(approved.confirmation_code_expires_at) < new Date()) {
      throw new Error("Código expirado. Solicite um novo.");
    }
    await db.from("ongs_approved")
      .update({ email_confirmed: true, confirmation_code: null, confirmation_code_expires_at: null })
      .eq("id", approved.id);
    return;
  }

  throw new Error("Email não encontrado.");
}

// Gera e grava um código de redefinição de senha (ONG aprovada ou admin)
export async function createPasswordResetCode(email: string): Promise<{ name: string; code: string } | null> {
  const db = getSupabase();
  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

  const { data: ong } = await db
    .from("ongs_approved")
    .select("id, name")
    .eq("email", email)
    .maybeSingle();
  if (ong) {
    await db.from("ongs_approved")
      .update({ reset_code: code, reset_code_expires_at: expiresAt })
      .eq("id", ong.id);
    return { name: ong.name, code };
  }

  const { data: admin } = await db
    .from("admin_users")
    .select("id, name, email")
    .eq("email", email)
    .maybeSingle();
  if (admin) {
    await db.from("admin_users")
      .update({ reset_code: code, reset_code_expires_at: expiresAt })
      .eq("id", admin.id);
    return { name: admin.name || "Admin", code };
  }

  return null;
}

// Verifica o código de redefinição e atualiza a senha
export async function resetPasswordWithCode(email: string, code: string, newPassword: string): Promise<void> {
  const db = getSupabase();
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const { data: ong } = await db
    .from("ongs_approved")
    .select("id, reset_code, reset_code_expires_at")
    .eq("email", email)
    .maybeSingle();
  if (ong) {
    if (ong.reset_code !== code) throw new Error("Código inválido.");
    if (!ong.reset_code_expires_at || new Date(ong.reset_code_expires_at) < new Date()) {
      throw new Error("Código expirado. Solicite um novo.");
    }
    await db.from("ongs_approved")
      .update({ password_hash: hashedPassword, reset_code: null, reset_code_expires_at: null })
      .eq("id", ong.id);
    return;
  }

  const { data: admin } = await db
    .from("admin_users")
    .select("id, reset_code, reset_code_expires_at")
    .eq("email", email)
    .maybeSingle();
  if (admin) {
    if (admin.reset_code !== code) throw new Error("Código inválido.");
    if (!admin.reset_code_expires_at || new Date(admin.reset_code_expires_at) < new Date()) {
      throw new Error("Código expirado. Solicite um novo.");
    }
    await db.from("admin_users")
      .update({ password_hash: hashedPassword, reset_code: null, reset_code_expires_at: null })
      .eq("id", admin.id);
    return;
  }

  throw new Error("Email não encontrado.");
}

export async function getOngEmailConfirmedStatus(email: string): Promise<boolean | null> {
  const db = getSupabase();
  const { data: pending } = await db.from("ongs_pending").select("email_confirmed").eq("email", email).maybeSingle();
  if (pending) return pending.email_confirmed;
  const { data: approved } = await db.from("ongs_approved").select("email_confirmed").eq("email", email).maybeSingle();
  if (approved) return approved.email_confirmed;
  return null;
}

// ============ Storage Upload ============

export async function uploadImage(
  base64: string,
  folder: string,
  filename: string
): Promise<string> {
  // Converte base64 para buffer
  const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches) throw new Error("Formato de imagem inválido");

  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], "base64");
  const ext = mimeType.includes("png") ? "png" : "jpg";
  const path = `${folder}/${filename}-${Date.now()}.${ext}`;

  const { error } = await getSupabase()
    .storage
    .from("elopets-images")
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) throw new Error(`Erro ao fazer upload: ${error.message}`);

  const { data } = getSupabase()
    .storage
    .from("elopets-images")
    .getPublicUrl(path);

  return data.publicUrl;
}
