import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../style/theme';

export const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    background: rgba(0, 0, 0, 0.6);
    color: #ff0000;
    transform: scale(1.1);
  }
`;

export const ProfileCard = styled(motion.div)`
  background: linear-gradient(135deg, #2e3035, #222428);
  border-radius: 16px;
  border: 1px solid #4f545c;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 450px;
`;

export const ProfileHeader = styled(motion.div)`
  width: 100%;
  height: 100px;
  background: linear-gradient(135deg, #5865f2, #43b581);
  border-radius: 16px 16px 0 0;
  margin-top: -1.5rem;
  position: relative;
`;

export const AvatarContainer = styled(motion.div)`
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
`;

export const ProfileAvatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 6px solid #2f3136;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
  background-color: #202225;
`;

export const EditAvatarButton = styled.button`
  position: absolute;
  bottom: 5px;
  right: 5px;
  background-color: #5865f2;
  border: 2px solid #2f3136;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.15);
  }
`;

export const UserInfo = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  user-select: text;
  margin-top: 80px; /* Mantém o espaçamento do avatar */
  text-align: center;
  width: 90%; /* Para que os inputs ocupem a largura correta */
  padding: 0 1.5rem; /* Adiciona padding para alinhamento */
  box-sizing: border-box; /* Garante que o padding não aumente a largura */
`;

export const Username = styled.h3`
  margin: 0;
  font-size: 1.75rem;
  color: #ffffff;
  font-weight: 700;
`;

export const UserTag = styled.p`
  color: #b9bbbe;
  font-size: 0.9rem;
  margin: -0.5rem 0 0.5rem 0;
  background-color: #202225;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

// O texto da bio agora será mais flexível, podendo ser um p ou um textarea
export const UserBioText = styled.p`
  color: #dcddde;
  font-size: 0.95rem;
  line-height: 1.5;
  max-width: 100%; /* Ajustado para se adequar ao UserInfo */
  margin: 0.5rem 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const StatsContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
  box-sizing: border-box;

  /* --- A MÁGICA É ESSA LINHA AQUI, MEU NOBRE --- */
  /* Seleciona o terceiro item (StatBox) APENAS se ele for o último */
  > div:nth-child(3):last-child {
    grid-column: span 2;
  }
`;

export const StatBox = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #b9bbbe;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.4);
  }
`;

export const StatIcon = styled.div`
  color: #5865f2;
  flex-shrink: 0;
`;

export const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StatValue = styled.p`
  margin: 0;
  font-size: 1.25rem;
  font-weight: bold;
  color: #ffffff;
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

export const StatLabel = styled.p`
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #b9bbbe;
`;

// Estilos para os inputs que se misturam ao layout
export const StyledInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem; /* Ajustado para ser mais compacto */
  background-color: #202225;
  border: 1px solid #40444b;
  border-radius: 4px;
  color: #ffffff; /* Cor do texto similar ao Username */
  font-family: ${theme.font.sans};
  font-size: 1.75rem; /* Tamanho da fonte similar ao Username */
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem; /* Espaço após o nome */
  box-sizing: border-box; /* Inclui padding na largura */

  &:focus {
    outline: none;
    border-color: #5865f2;
  }
`;

export const StyledTextArea = styled.textarea`
  width: 100%;
  min-height: 95px;
  padding: 0.75rem;
  background-color: #202225;
  border: 1px solid #40444b;
  border-radius: 4px;
  color: #dcddde;
  font-family: ${theme.font.sans};
  font-size: 0.95rem; /* Tamanho da fonte similar ao UserBio */
  line-height: 1.5;
  resize: vertical;
  text-align: center; /* Alinha o texto ao centro */
  box-sizing: border-box; /* Inclui padding na largura */

  &:focus {
    outline: none;
    border-color: #5865f2;
  }
`;

export const AvatarGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  width: 90%; /* Ajustado para a largura do modal */
  margin-top: 1rem; /* Espaçamento da bio */
  box-sizing: border-box;
`;

export const AvatarOption = styled.button<{ $isSelected: boolean }>`
  background-color: #36393f;
  border: 2px solid
    ${(props) => (props.$isSelected ? '#5865f2' : 'transparent')};
  border-radius: 8px;
  padding: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  transform: ${(props) => (props.$isSelected ? 'scale(1.1)' : 'scale(1)')};

  &:hover {
    border-color: #5865f2;
  }

  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

// NOVO: Adiciona um container flexível para centralizar botões e inputs
export const ContentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1.5rem 1.5rem; /* Padding para o conteúdo abaixo da foto */
  box-sizing: border-box;
`;
