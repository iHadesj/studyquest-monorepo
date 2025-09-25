import styled, { keyframes } from 'styled-components';

// --- DEFINIÇÃO DAS ANIMAÇÕES (KEYFRAMES) ---

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
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// --- ESTILOS GLOBAIS COM ANIMAÇÕES ---
export const AppContainer = styled.div`
  background-color: #36393f;
  color: #dcddde;
  padding: 2rem;
  padding-top: 5rem;
  min-height: 100vh;
  font-family: 'Fira Code', monospace;
  padding-bottom: 5rem;

  @media (max-width: 480px) {
    padding-top: 0rem;
    padding-bottom: 0rem;

    padding: 6rem 2.5rem 6rem 2.5rem;
    min-height: 100vh;
  }
`;

export const FooterWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  p {
    margin: 0;
    font-size: 0.875rem;
  }
  a {
    color: #5865f2;
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
  background-color: #5865f2;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #4f5bd5;
  }

  @media (max-width: 480px) {
    position: static;
    transform: none;
    margin: 0 1rem;
  }
`;

// Botão base para Ranking e Amigos
const FooterButton = styled.button`
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Fira Code', monospace;
  font-size: 1rem;
  &:hover {
    color: #ffffff;
  }
`;

export const RankingButton = styled(FooterButton)``;

export const FriendsButton = styled(FooterButton)``;

export const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const LoadingSpinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-left-color: #5865f2;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #36393f;
`;

export const MainContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  animation: ${fadeIn} 0.4s ease-in-out;
`;

export const BackButton = styled.button`
  position: relative;
  background: none;
  border: none;
  color: #b9bbbe;
  margin-bottom: 1.5rem;
  cursor: pointer;
  font-family: 'Fira Code', monospace;
  font-size: 1rem;
  font-weight: bold;
  transition: color 0.2s ease-in-out;
  &:hover {
    color: #ffffff;
  }
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-align: center;
  border-bottom: 2px solid #40444b;
  padding-bottom: 0.5rem;
  letter-spacing: -1px;
  animation: ${fadeIn} 0.5s ease-out;
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-top: 2rem;
  }
`;

export const TitleExercise = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-align: center;
  border-bottom: 2px solid #40444b;
  padding-bottom: 0.5rem;
  letter-spacing: -1px;
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

export const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #b9bbbe;
  margin-bottom: 2rem;
  text-align: center;
  animation: ${fadeIn} 0.5s ease-out 0.2s;
  animation-fill-mode: backwards;
`;

export const BarWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #202225;
  padding: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 50;
  border-bottom: 1px solid #2f3136;
`;

export const XPDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #5865f2;
  color: white;
  font-weight: bold;
  padding: 0.25rem 1rem;
  border-radius: 4px;
  margin: 0 auto;
  width: fit-content;
`;

export const LevelSelectorWrapper = styled.div`
  max-width: 42rem;
  margin: 0 auto;
  margin-top: 2rem;
`;

export const LevelList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const LevelButton = styled.button`
  width: 100%;
  padding: 1.5rem;
  border-radius: 4px;
  border: 1px solid #40444b;
  text-align: left;
  transition: all 0.2s ease-in-out;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) =>
    props.disabled ? 'rgba(47, 49, 54, 0.3)' : '#2f3136'};
  color: ${(props) => (props.disabled ? '#72767d' : '#dcddde')};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

  &:hover {
    background-color: ${(props) => !props.disabled && '#40444b'};
    border-color: #5c5c5c;
    transform: ${(props) => !props.disabled && 'scale(1.02)'};
  }
  h2 {
    font-family: 'Fira Code', monospace;
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
  }
  p {
    font-family: 'Fira Code', monospace;
    font-size: 0.875rem;
    color: #43b581;
    margin: 0.25rem 0 0 0;
  }
`;

export const LessonWrapper = styled.div`
  max-width: 48rem;
  margin: 0 auto;
`;

export const ContentBox = styled.div`
  background-color: #2f3136;
  padding: 1.5rem;
  border-radius: 4px;
  border: 1px solid #40444b;
  margin-bottom: 2rem;
`;

export const ExerciseBox = styled.div`
  background-color: #2f3136;
  border: 1px solid #40444b;
  padding: 1.5rem;
  border-radius: 4px;
  transition: box-shadow 0.2s ease-in-out;
  &:hover {
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  }
`;

export const QuestionText = styled.p`
  font-size: 1rem;
  font-weight: bold;
  user-select: none;
  margin: 0 0 1rem 0;
  line-height: 1.5;
  color: #ffffff;

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

export const OptionLabel = styled.label`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: #36393f;
  border-radius: 4px;
  font-size: 0.8rem;
  user-select: none;
  border: 1px solid #40444b;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  &:hover {
    background-color: #40444b;
  }
`;

export const RadioInput = styled.input`
  margin-right: 0.75rem;
  width: 1rem;
  height: 1rem;
  user-select: none;
  accent-color: #5865f2;
  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

export const TextInput = styled.input`
  width: 90%;
  padding: 0.75rem;
  background-color: #202225;
  border: 1px solid #40444b;
  border-radius: 4px;
  color: #dcddde;
  font-family: 'Fira Code', monospace;
  font-size: 1.1rem;
  transition: border-color 0.2s ease-in-out;
  &:focus {
    outline: none;
    border-color: #5865f2;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

export const SubmitButton = styled.button`
  background-color: ${(props) => (props.disabled ? '#40444b' : '#43b581')};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  color: #ffffff;
  font-family: 'Fira Code', monospace;
  font-weight: bold;
  padding: 0.75rem 3rem;
  border-radius: 4px;
  font-size: 1.1rem;
  border: none;
  transition: all 0.2s ease-in-out;
  &:hover {
    background-color: ${(props) => !props.disabled && '#3aa570'};
    transform: ${(props) => !props.disabled && 'scale(1.05)'};
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  animation: ${fadeIn} 0.3s ease-in-out;

  @media (max-width: 480px) {
    align-items: flex-start;
  }
`;

export const ModalContent = styled.div`
  background-color: #2f3136;
  padding: 2rem;
  border-radius: 4px;
  border: 1px solid #40444b;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 28rem;
  width: 90%;
  animation: ${scaleIn} 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  @media (max-width: 480px) {
    padding: 2rem;
    overflow-y: auto;
    max-width: 17rem;
    margin-top: 1rem;
    max-height: 489px;
    width: 90%;
  }
`;

export const XPDisplayModal = styled.div`
  margin-top: 1.5rem;
  background-color: #5865f2;
  color: #ffffff;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ContinueButton = styled.button<{
  variant?: 'primary' | 'secondary';
}>`
  margin-top: 2rem;
  width: 100%;
  background-color: ${({ variant }) =>
    variant === 'primary' ? '#43b581' : '#5c5c5c'};
  color: #ffffff;
  font-family: 'Fira Code', monospace;
  font-weight: bold;
  padding: 0.75rem;
  border-radius: 4px;
  border: none;
  transition: background-color 0.3s ease-in-out;
  cursor: pointer;
  &:hover {
    background-color: ${({ variant }) =>
      variant === 'primary' ? '#43b58273' : '#ff5f5fac'};
  }
`;

export const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #202225;
  color: #b9bbbe;
  text-align: center;
  padding: 1rem;
  font-size: 0.875rem;
  border-top: 1px solid #2f3136;
  z-index: 1000;
  a {
    color: #5865f2;
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
  font-size: 0.8rem;
  color: #72767d;

  a {
    color: #5865f2;
    text-decoration: none;
    font-weight: bold;
    &:hover {
      text-decoration: underline;
    }
  }
`;
