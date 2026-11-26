import { useState } from 'react';
import { useLocation } from 'wouter';
import { X, PawPrint, ArrowLeft, KeyRound, Mail } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { getErrorMessage } from '@/lib/errorMessage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type View = 'login' | 'forgot-request' | 'forgot-reset';

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [, setLocation] = useLocation();
  const [view, setView] = useState<View>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetError, setResetError] = useState('');

  const utils = trpc.useUtils();
  const ongLoginMutation = trpc.ongAuth.login.useMutation();
  const adminLoginMutation = trpc.adminAuth.login.useMutation();
  const requestResetMutation = trpc.ongAuth.requestPasswordReset.useMutation();
  const resetPasswordMutation = trpc.ongAuth.resetPassword.useMutation();

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setIsLoading(false);
    setView('login');
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setResetError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Um único formulário: tenta como ONG e, se não der certo, tenta como admin
  // automaticamente — sem a pessoa precisar escolher o tipo de acesso.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await ongLoginMutation.mutateAsync({ email, password });
      utils.ongAuth.me.setData(undefined, result.ong);
      await utils.ongAuth.me.invalidate();
      toast.success('Bem-vinda de volta!');
      handleClose();
      setLocation('/ong-login');
      return;
    } catch (ongErr: any) {
      try {
        const result = await adminLoginMutation.mutateAsync({ email, password });
        utils.adminAuth.me.setData(undefined, result.admin);
        await utils.adminAuth.me.invalidate();
        toast.success('Login realizado com sucesso!');
        handleClose();
        setLocation('/admin');
        return;
      } catch {
        setError(getErrorMessage(ongErr, 'E-mail ou senha incorretos.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setIsLoading(true);
    try {
      await requestResetMutation.mutateAsync({ email: resetEmail });
      toast.success('Se este email existir, um código foi enviado!');
      setView('forgot-reset');
    } catch (err: any) {
      setResetError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (newPassword.length < 6) {
      setResetError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetError('As senhas não conferem.');
      return;
    }
    setIsLoading(true);
    try {
      await resetPasswordMutation.mutateAsync({ email: resetEmail, code: resetCode, newPassword });
      toast.success('Senha redefinida com sucesso! Faça login com a nova senha.');
      setEmail(resetEmail);
      setPassword('');
      setView('login');
      setResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setResetError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>

        {view === 'login' && (
          <>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Entrar</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-500 text-sm mb-6 flex items-center gap-2">
              <PawPrint className="w-4 h-4 text-orange-400" />
              Entre com o login da sua ONG
            </p>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Senha</label>
                  <button
                    type="button"
                    onClick={() => { setResetError(''); setResetEmail(email); setView('forgot-request'); }}
                    className="text-xs font-semibold text-orange-500 hover:underline"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Não tem conta?{' '}
              <a href="/ongs/cadastrar" className="text-orange-500 font-semibold hover:underline" onClick={handleClose}>
                Cadastre sua ONG
              </a>
            </p>
          </>
        )}

        {view === 'forgot-request' && (
          <>
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={() => setView('login')}
                className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="w-14 h-14 bg-sky-50 rounded-full flex items-center justify-center mx-auto mt-2 mb-4">
              <Mail className="w-6 h-6 text-sky-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Redefinir senha</h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              Digite seu email e enviaremos um código de 6 dígitos para você criar uma nova senha.
            </p>

            {resetError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {resetError}
              </div>
            )}

            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar código'}
              </Button>
            </form>
          </>
        )}

        {view === 'forgot-reset' && (
          <>
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={() => setView('forgot-request')}
                className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="w-14 h-14 bg-sky-50 rounded-full flex items-center justify-center mx-auto mt-2 mb-4">
              <KeyRound className="w-6 h-6 text-sky-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Digite o código</h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              Enviamos um código para <strong>{resetEmail}</strong>. Ele expira em 15 minutos.
            </p>

            {resetError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {resetError}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código de 6 dígitos</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={resetCode}
                  onChange={e => setResetCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="text-center text-lg tracking-widest font-bold"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
                <Input
                  type="password"
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600" disabled={isLoading}>
                {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
              </Button>
              <button
                type="button"
                onClick={() => handleRequestReset({ preventDefault: () => {} } as React.FormEvent)}
                disabled={isLoading}
                className="w-full text-xs font-semibold text-gray-400 hover:text-orange-500 text-center"
              >
                Não recebeu? Reenviar código
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
