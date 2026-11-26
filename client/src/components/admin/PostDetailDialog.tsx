import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, PawPrint } from 'lucide-react';
import { useState } from 'react';

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  donation: { label: 'Doação', color: 'bg-blue-100 text-blue-700' },
  request_food: { label: 'Pedido: Alimento', color: 'bg-green-100 text-green-700' },
  request_medicine: { label: 'Pedido: Remédio', color: 'bg-purple-100 text-purple-700' },
  request_other: { label: 'Pedido: Outro', color: 'bg-orange-100 text-orange-700' },
};

interface PostDetailDialogProps {
  post: any | null;
  ongName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (postId: string) => Promise<void> | void;
  deleting?: boolean;
}

export default function PostDetailDialog({ post, ongName, open, onOpenChange, onDelete, deleting }: PostDetailDialogProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!post) return null;
  const type = TYPE_LABELS[post.type] || { label: post.type, color: 'bg-gray-100 text-gray-700' };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setConfirmDelete(false); }}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-6">
            <PawPrint className="w-5 h-5 text-orange-500 shrink-0" />
            <span className="truncate">{post.pet_name || post.title}</span>
          </DialogTitle>
        </DialogHeader>

        {post.image_url && (
          <img src={post.image_url} alt="" className="w-full h-56 object-cover rounded-xl" />
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${type.color}`}>{type.label}</span>
          {post.is_urgent && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">🚨 Urgente</span>}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
            {post.is_active ? 'Ativo' : 'Desativado'}
          </span>
        </div>

        <div>
          <h3 className="font-bold text-gray-900">{post.title}</h3>
          <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{post.description}</p>
        </div>

        {post.items && (
          <div className="text-sm text-gray-700">
            <b>Itens:</b> {post.items}
          </div>
        )}

        {post.type === 'donation' && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
            {post.pet_breed && <span><b>Raça:</b> {post.pet_breed}</span>}
            {post.pet_age && <span><b>Idade:</b> {post.pet_age}</span>}
            {post.pet_gender && <span><b>Sexo:</b> {post.pet_gender}</span>}
            {post.pet_size && <span><b>Porte:</b> {post.pet_size}</span>}
            {post.pet_color && <span><b>Cor:</b> {post.pet_color}</span>}
            <span><b>Vacinado:</b> {post.pet_vaccinated ? 'Sim' : 'Não'}</span>
            <span><b>Castrado:</b> {post.pet_castrated ? 'Sim' : 'Não'}</span>
          </div>
        )}

        <div className="text-xs text-gray-400 space-y-0.5 pt-1 border-t border-gray-100">
          {ongName && <p>ONG: <span className="font-medium text-gray-500">{ongName}</span></p>}
          <p>Criado em {formatDate(post.created_at)}</p>
          {post.updated_at && post.updated_at !== post.created_at && <p>Última alteração em {formatDate(post.updated_at)}</p>}
        </div>

        {onDelete && post.is_active && (
          <div className="pt-2 border-t border-gray-100">
            {confirmDelete ? (
              <div className="flex gap-2">
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white"
                  disabled={deleting}
                  onClick={async () => { await onDelete(post.id); setConfirmDelete(false); }}
                >
                  Confirmar exclusão
                </Button>
                <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-2"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="w-4 h-4" /> Apagar post
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
