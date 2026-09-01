import { useEffect, useRef, useState } from 'react';
import { theme } from '../../style/theme';
import { BrainPoster } from './poster';
import * as S from './style';
import type { BrainHandle } from './scene';

/**
 * Decide se vale a pena baixar e rodar a cena WebGL.
 *
 * O padrão é NÃO rodar: só passa quem tem tela grande, ponteiro fino, GPU
 * plausível e não pediu menos movimento. Quem não passa fica com o pôster e
 * não baixa um byte do three.
 */
function devicePodeRodar3D() {
  if (typeof window === 'undefined') return false;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }
  // Mobile e ponteiro grosso ficam no pôster: o custo de GPU não compensa.
  if (!window.matchMedia('(min-width: 768px) and (pointer: fine)').matches) {
    return false;
  }

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4) return false;
  if (
    typeof nav.hardwareConcurrency === 'number' &&
    nav.hardwareConcurrency < 4
  ) {
    return false;
  }

  // WebGL disponível de fato?
  try {
    const c = document.createElement('canvas');
    return !!(
      c.getContext('webgl2') ||
      c.getContext('webgl') ||
      c.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}

const aoOciar = (fn: () => void) => {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(fn, { timeout: 2500 });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(fn, 900);
  return () => window.clearTimeout(id);
};

export function BrainScene({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<BrainHandle | null>(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (!devicePodeRodar3D()) return;

    let cancelado = false;

    // Pós-idle: a cena nunca disputa banda ou CPU com a primeira pintura.
    const cancelarIdle = aoOciar(async () => {
      if (cancelado) return;
      try {
        const { createBrain } = await import('./scene');
        if (cancelado || !canvasRef.current) return;

        handleRef.current = createBrain(canvasRef.current, {
          colorA: theme.color.primary,
          colorB: theme.color.cyan,
          colorC: theme.color.pink,
          quality: window.innerWidth < 1100 ? 'baixa' : 'alta',
        });
        setPronto(true);
      } catch (erro) {
        // Falhou o download ou a criação do contexto: o pôster continua ali.
        console.warn('Cena 3D indisponível, seguindo com o pôster.', erro);
      }
    });

    return () => {
      cancelado = true;
      cancelarIdle();
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, []);

  return (
    <S.Wrapper className={className}>
      <S.Glow aria-hidden />
      <BrainPoster hidden={pronto} />
      <S.Canvas ref={canvasRef} $visible={pronto} />
    </S.Wrapper>
  );
}
