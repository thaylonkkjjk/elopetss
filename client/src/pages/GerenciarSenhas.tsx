import { getErrorMessage } from '@/lib/errorMessage';
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldCheck, UserPlus, KeyRound, Eye, EyeOff } from "lucide-react";

export default function GerenciarSenhas() {
  // Verificação de acesso — chave local para não expor a rota
  const [unlocked, setUnlocked] = useState(false);
  const [gateKey, setGateKey] = useState("");
  const GATE = "elopets2026";

  // Criar admin
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) =>
    setLog(p => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...p]);

  const createAdminMutation = trpc.adminAuth.createAdmin.useMutation({
    onSuccess: () => {
      addLog(`✅ Admin criado: ${newEmail}`);
      toast.success("Admin criado com sucesso!");
      setNewEmail("");
      setNewPassword("");
    },
    onError: (e) => {
      const msg = getErrorMessage(e);
      addLog(`❌ Erro: ${msg}`);
      toast.error(msg);
    },
  });

  const handleCreate = () => {
    if (!newEmail || !newPassword) return toast.error("Preencha email e senha");
    if (newPassword.length < 6) return toast.error("Senha mínima: 6 caracteres");
    addLog(`🔄 Criando admin ${newEmail}...`);
    createAdminMutation.mutate({ email: newEmail, password: newPassword });
  };

  // ── Gate screen ─────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm p-8 bg-gray-900 border-gray-800 shadow-2xl">
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-orange-400" />
            </div>
            <h1 className="text-white font-bold text-lg">Acesso restrito</h1>
            <p className="text-gray-500 text-xs text-center">Digite a chave de acesso para continuar</p>
          </div>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Chave de acesso"
              value={gateKey}
              onChange={e => setGateKey(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (gateKey === GATE ? setUnlocked(true) : toast.error("Chave incorreta"))}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600"
            />
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={() => gateKey === GATE ? setUnlocked(true) : toast.error("Chave incorreta")}
            >
              Entrar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Main panel ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-white font-bold">Gerenciar Admins</h1>
            <p className="text-gray-500 text-xs">Mundo ONG — Painel interno</p>
          </div>
        </div>

        {/* Create admin */}
        <Card className="bg-gray-900 border-gray-800 p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-orange-400" />
            <h2 className="text-white font-semibold text-sm">Criar novo admin</h2>
          </div>
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="Email do admin"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600"
            />
            <div className="relative">
              <Input
                type={showPwd ? "text" : "password"}
                placeholder="Senha (mín. 6 caracteres)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button
              onClick={handleCreate}
              disabled={createAdminMutation.isPending}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {createAdminMutation.isPending ? "Criando..." : "Criar admin"}
            </Button>
          </div>
        </Card>

        {/* Log */}
        {log.length > 0 && (
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold text-sm">Log</h2>
              <button onClick={() => setLog([])} className="text-gray-600 hover:text-gray-400 text-xs">Limpar</button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {log.map((l, i) => (
                <p key={i} className="text-xs font-mono text-gray-400">{l}</p>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
