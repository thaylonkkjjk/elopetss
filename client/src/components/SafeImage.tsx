interface SafeImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallback?: React.ReactNode;
  loading?: 'lazy' | 'eager';
}

// Wrapper simples — mostra fallback se src for vazio ou quebrar.
// SEM opacity-0 inicial para não sumir imagens.
export default function SafeImage({ src, alt = '', className = '', fallback, loading = 'lazy' }: SafeImageProps) {
  if (!src) return <>{fallback ?? null}</>;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={(e) => {
        const target = e.currentTarget;
        target.style.display = 'none';
        // Mostra fallback inserindo após o elemento
        const fb = target.nextElementSibling as HTMLElement;
        if (fb?.dataset?.fallback) fb.style.display = 'flex';
      }}
    />
  );
}
