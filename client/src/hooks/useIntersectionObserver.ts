// Mundo ONG — Intersection Observer hook for fade-in animations
import { useEffect, useRef } from 'react';

export function useIntersectionObserver(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, ...options }
    );

    // Observe the element and all children with fade-in-up class
    const elements = el.querySelectorAll('.fade-in-up');
    elements.forEach((child) => observer.observe(child));
    if (el.classList.contains('fade-in-up')) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return ref;
}
