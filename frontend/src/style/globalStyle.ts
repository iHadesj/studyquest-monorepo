import styled, { keyframes } from 'styled-components';
import { theme } from './theme';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.94) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const sheenSweep = keyframes`
  0%   { transform: translateX(-120%) skewX(-20deg); }
  100% { transform: translateX(260%) skewX(-20deg); }
`;

const titleShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
`;

/* O container é transparente: quem pinta o fundo é o AuroraBackground. */
export const AppContainer = styled.div`
  position: relative;
  z-index: 1;
  color: ${theme.color.text};
  padding: 2rem;
  padding-top: 6rem;
  min-height: 100vh;
  font-family: ${theme.font.mono};
  padding-bottom: 6rem;

  @media (max-width: 480px) {
    padding: 6rem 1.25rem;
    min-height: 100vh;
  }
`;

export const FooterWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: ${theme.layout.maxWidth};
  margin: 0 auto;
  width: 100%;
  position: relative;
  p {
    margin: 0;
    font-size: 0.875rem;
  }
  a {
    color: ${theme.color.primarySoft};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  @media (max-width: 480px) {
    justify-content: center;
    gap: 1rem;
    p {
      display: none;
    }
  }
`;

export const HomeButton = styled.button`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: ${theme.gradient.primary};
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: ${theme.shadow.glowPrimary};
  transition: transform 220ms ${theme.ease.bounce}, box-shadow 220ms ease;

  &:hover {
    transform: translate(-50%, -50%) scale(1.12) rotate(-6deg);
    box-shadow: 0 0 0 1px rgba(124, 92, 255, 0.5),
      0 12px 40px rgba(124, 92, 255, 0.45);
  }
  &:active {
    transform: translate(-50%, -50%) scale(0.95);
  }

  @media (max-width: 480px) {
    position: static;
    transform: none;
    margin: 0 0.5rem;
    &:hover {
      transform: scale(1.12) rotate(-6deg);
    }
  }
`;

const FooterButton = styled.button`
  position: relative;
  background: ${theme.color.glass};
  border: 1px solid ${theme.color.stroke};
  color: ${theme.color.textMuted};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.1rem;
  border-radius: ${theme.radius.pill};
  font-family: ${theme.font.mono};
  font-size: 0.9rem;
  font-weight: 600;
  overflow: hidden;
  transition: color 200ms ease, border-color 200ms ease,
    transform 220ms ${theme.ease.bounce}, background 200ms ease;

  svg {
    transition: transform 260ms ${theme.ease.bounce};
  }

  &:hover {
    color: #fff;
    background: ${theme.color.glassStrong};
    border-color: ${theme.color.strokeStrong};
    transform: translateY(-2px);
    svg {
      transform: scale(1.18) rotate(-8deg);
    }
  }
  &:active {
    transform: translateY(0) scale(0.97);
  }

  @media (max-width: 480px) {
    padding: 0.5rem 0.85rem;
  }
`;

export const RankingButton = styled(FooterButton)`
  &:hover {
    color: ${theme.color.gold};
    border-color: rgba(245, 197, 66, 0.4);
  }
`;

export const FriendsButton = styled(FooterButton)`
  &:hover {
    color: ${theme.color.cyan};
    border-color: rgba(34, 211, 238, 0.4);
  }
`;

export const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const LoadingSpinner = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  /* Anel em gradiente: cor sólida girando parece um GIF de 2012. */
  background: conic-gradient(
    from 0deg,
    transparent 0%,
    ${theme.color.primary} 45%,
    ${theme.color.cyan} 75%,
    transparent 100%
  );
  mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 0);
  -webkit-mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 4px),
    #000 0
  );
  animation: ${spin} 0.9s linear infinite;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: ${theme.color.bg};
`;

export const MainContent = styled.div`
  max-width: ${theme.layout.maxWidth};
  margin: 0 auto;
`;

export const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${theme.color.bgRaised};
  border: 2px solid ${theme.color.stroke};
  object-fit: cover;
`;

export const BackButton = styled.button`
  position: relative;
  background: ${theme.color.glass};
  border: 1px solid ${theme.color.stroke};
  color: ${theme.color.textMuted};
  margin-bottom: 1.5rem;
  padding: 0.5rem 1.1rem;
  border-radius: ${theme.radius.pill};
  cursor: pointer;
  font-family: ${theme.font.mono};
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 200ms ease, transform 220ms ${theme.ease.bounce},
    background 200ms ease, border-color 200ms ease;

  &:hover {
    color: #fff;
    background: ${theme.color.glassStrong};
    border-color: ${theme.color.strokeStrong};
    transform: translateX(-4px);
  }
  &:active {
    transform: translateX(-4px) scale(0.97);
  }
`;

export const Title = styled.h1`
  font-size: clamp(1.9rem, 4.5vw, 2.8rem);
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-align: center;
  padding-bottom: 0.5rem;
  letter-spacing: -1.4px;
  /* Gradiente animado no texto, em vez de branco chapado. */
  background: linear-gradient(
    100deg,
    ${theme.color.text} 0%,
    ${theme.color.primarySoft} 30%,
    ${theme.color.cyan} 55%,
    ${theme.color.text} 85%
  );
  background-size: 220% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: ${titleShift} 9s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const TitleExercise = styled.h1`
  font-size: clamp(1.4rem, 3.5vw, 2.2rem);
  font-weight: 800;
  color: ${theme.color.text};
  margin-bottom: 0.5rem;
  text-align: center;
  padding-bottom: 0.5rem;
  letter-spacing: -1px;
  animation: ${fadeIn} 0.5s ${theme.ease.out};
`;

export const Subtitle = styled.p`
  font-size: 1.05rem;
  color: ${theme.color.textMuted};
  margin-bottom: 2rem;
  text-align: center;
  animation: ${fadeIn} 0.5s ${theme.ease.out} 0.12s;
  animation-fill-mode: backwards;
`;

export const BarWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(11, 11, 20, 0.72);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  padding: 0.65rem 1rem;
  z-index: 50;
  border-bottom: 1px solid ${theme.color.stroke};
`;

export const XPDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${theme.gradient.primary};
  color: white;
  font-weight: bold;
  padding: 0.25rem 1rem;
  border-radius: ${theme.radius.pill};
  margin: 0 auto;
  width: fit-content;
`;

export const LevelSelectorWrapper = styled.div`
  max-width: 46rem;
  margin: 0 auto;
  margin-top: 2rem;
`;

export const LevelList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const LevelButton = styled.button`
  position: relative;
  width: 100%;
  padding: 1.5rem;
  border-radius: ${theme.radius.lg};
  border: 1px solid ${theme.color.stroke};
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  background: ${(props) =>
    props.disabled ? 'rgba(255,255,255,0.02)' : theme.color.glass};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: ${(props) =>
    props.disabled ? theme.color.textFaint : theme.color.text};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: transform 260ms ${theme.ease.bounce}, border-color 220ms ease,
    background 220ms ease, box-shadow 220ms ease;

  /* Faixa de destaque que cresce na lateral esquerda no hover. */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    border-radius: 0 3px 3px 0;
    background: ${theme.gradient.primary};
    transition: height 300ms ${theme.ease.out};
  }

  &:hover {
    background: ${(props) => !props.disabled && theme.color.glassStrong};
    border-color: ${(props) =>
      !props.disabled ? 'rgba(124, 92, 255, 0.4)' : theme.color.stroke};
    transform: ${(props) => !props.disabled && 'translateY(-3px)'};
    box-shadow: ${(props) => !props.disabled && theme.shadow.md};
    &::before {
      height: ${(props) => (props.disabled ? '0' : '62%')};
    }
  }
  &:active {
    transform: ${(props) => !props.disabled && 'translateY(-1px) scale(0.995)'};
  }

  h2 {
    font-family: ${theme.font.mono};
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.5px;
  }
  p {
    font-family: ${theme.font.mono};
    font-size: 0.85rem;
    color: ${theme.color.success};
    margin: 0.35rem 0 0 0;
  }
`;

export const LessonWrapper = styled.div`
  max-width: 48rem;
  margin: 0 auto;
`;

export const ContentBox = styled.div`
  background: ${theme.color.glass};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 1.75rem;
  border-radius: ${theme.radius.lg};
  border: 1px solid ${theme.color.stroke};
  margin-bottom: 2rem;
  box-shadow: ${theme.shadow.md};
`;

export const ExerciseBox = styled.div<{
  $hasMarginTop?: boolean;
}>`
  background: ${theme.color.glass};
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid ${theme.color.stroke};
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadow.md};
  transition: box-shadow 260ms ease, border-color 260ms ease;

  &:hover {
    border-color: ${theme.color.strokeStrong};
    box-shadow: ${theme.shadow.lg};
  }

  @media (max-width: 480px) {
    margin-top: ${(props) => (props.$hasMarginTop ? '2rem' : '0')};
    padding: 1.25rem;
  }
`;

export const QuestionText = styled.p`
  font-size: 1.05rem;
  font-weight: 700;
  user-select: none;
  margin: 0 0 1rem 0;
  line-height: 1.6;
  color: ${theme.color.text};

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

export const OptionLabel = styled.label`
  display: flex;
  align-items: center;
  padding: 0.85rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: ${theme.radius.md};
  font-size: 0.9rem;
  user-select: none;
  border: 1px solid ${theme.color.stroke};
  cursor: pointer;
  transition: background 200ms ease, border-color 200ms ease,
    transform 200ms ${theme.ease.out};

  &:hover {
    background: ${theme.color.glassStrong};
    border-color: rgba(124, 92, 255, 0.45);
    transform: translateX(4px);
  }
`;

export const RadioInput = styled.input`
  margin-right: 0.75rem;
  width: 1rem;
  height: 1rem;
  user-select: none;
  accent-color: ${theme.color.primary};
`;

export const TextInput = styled.input`
  width: 90%;
  padding: 0.85rem 1rem;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid ${theme.color.stroke};
  border-radius: ${theme.radius.md};
  color: ${theme.color.text};
  font-family: ${theme.font.mono};
  font-size: 1rem;
  transition: border-color 200ms ease, box-shadow 200ms ease;

  &::placeholder {
    color: ${theme.color.textFaint};
  }
  &:focus {
    outline: none;
    border-color: ${theme.color.primary};
    box-shadow: 0 0 0 3px rgba(124, 92, 255, 0.18);
  }
`;

export const SubmitButton = styled.button`
  position: relative;
  overflow: hidden;
  background: ${(props) =>
    props.disabled ? 'rgba(255,255,255,0.06)' : theme.gradient.success};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  color: ${(props) => (props.disabled ? theme.color.textFaint : '#04231A')};
  font-family: ${theme.font.mono};
  font-weight: 800;
  padding: 0.85rem 2.75rem;
  border-radius: ${theme.radius.pill};
  font-size: 1rem;
  border: none;
  box-shadow: ${(props) => (props.disabled ? 'none' : theme.shadow.md)};
  transition: transform 240ms ${theme.ease.bounce}, box-shadow 240ms ease,
    filter 240ms ease;

  /* Brilho que atravessa o botão no hover. */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${theme.gradient.sheen};
    transform: translateX(-120%) skewX(-20deg);
  }

  &:hover {
    transform: ${(props) => !props.disabled && 'translateY(-3px) scale(1.03)'};
    box-shadow: ${(props) =>
      !props.disabled && '0 14px 34px rgba(52, 211, 153, 0.35)'};
    &::after {
      animation: ${sheenSweep} 750ms ${theme.ease.out};
    }
  }
  &:active {
    transform: ${(props) => !props.disabled && 'translateY(0) scale(0.97)'};
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(4, 4, 10, 0.72);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
  animation: ${fadeIn} 0.28s ${theme.ease.out};

  @media (max-width: 480px) {
    align-items: flex-start;
    padding-top: 5rem;
  }
`;

export const ModalContent = styled.div`
  background: linear-gradient(
    160deg,
    rgba(30, 30, 48, 0.95) 0%,
    rgba(16, 16, 28, 0.95) 100%
  );
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  padding: 2.25rem;
  border-radius: ${theme.radius.xl};
  border: 1px solid ${theme.color.strokeStrong};
  box-shadow: ${theme.shadow.lg};
  text-align: center;
  max-width: 30rem;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  animation: ${scaleIn} 0.42s ${theme.ease.bounce};

  @media (max-width: 480px) {
    padding: 1.5rem;
    max-width: 100%;
  }
`;

export const XPDisplayModal = styled.div`
  margin-top: 1.5rem;
  background: ${theme.gradient.primary};
  color: #ffffff;
  font-weight: 800;
  padding: 0.75rem 1.5rem;
  border-radius: ${theme.radius.pill};
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: ${theme.shadow.glowPrimary};
`;

export const ContinueButton = styled.button<{
  variant?: 'primary' | 'secondary';
}>`
  margin-top: 1.75rem;
  width: 100%;
  background: ${({ variant }) =>
    variant === 'primary' ? theme.gradient.success : theme.color.glassStrong};
  color: ${({ variant }) => (variant === 'primary' ? '#04231A' : '#fff')};
  border: 1px solid
    ${({ variant }) =>
      variant === 'primary' ? 'transparent' : theme.color.stroke};
  font-family: ${theme.font.mono};
  font-weight: 800;
  padding: 0.85rem 1.5rem;
  border-radius: ${theme.radius.pill};
  cursor: pointer;
  transition: transform 240ms ${theme.ease.bounce}, box-shadow 240ms ease,
    filter 240ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    filter: brightness(1.08);
    box-shadow: ${theme.shadow.md};
  }
  &:active:not(:disabled) {
    transform: translateY(0) scale(0.97);
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(11, 11, 20, 0.72);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  color: ${theme.color.textMuted};
  text-align: center;
  padding: 0.85rem 1rem;
  font-size: 0.875rem;
  border-top: 1px solid ${theme.color.stroke};
  z-index: 40;
  a {
    color: ${theme.color.primarySoft};
    text-decoration: none;
    font-weight: bold;
    &:hover {
      text-decoration: underline;
    }
  }
  p {
    margin: 0;
  }
`;

export const FooterCredit = styled.p`
  margin: 0;
  font-size: 0.78rem;
  color: ${theme.color.textFaint};

  a {
    color: ${theme.color.primarySoft};
    text-decoration: none;
    font-weight: bold;
    &:hover {
      text-decoration: underline;
    }
  }
`;
