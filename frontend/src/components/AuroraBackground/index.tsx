import * as S from './style';

/**
 * Fundo vivo do app: três manchas de cor que derivam devagar sobre uma grade
 * sutil, com um grão por cima pra não ficar com aparência de degradê chapado.
 *
 * É puramente decorativo (aria-hidden) e fica atrás de tudo com pointer-events
 * desligado. Respeita prefers-reduced-motion: sem movimento, só o gradiente.
 */
export function AuroraBackground() {
  return (
    <S.Wrapper aria-hidden>
      <S.Blob $variant="violet" />
      <S.Blob $variant="cyan" />
      <S.Blob $variant="pink" />
      <S.Grid />
      <S.Grain />
      <S.Vignette />
    </S.Wrapper>
  );
}
