// src/components/ModalUserPerfil/style.ts
import styled from 'styled-components';
import { motion } from 'framer-motion';

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
  width: 100%;
  max-width: 480px; // Aumentei um pouco pra dar mais espaço
  border: 1px solid #4f545c;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden; // Garante que nada vaze pra fora
`;

export const ProfileHeader = styled(motion.div)`
  width: 100%;
  height: 100px;
  background: linear-gradient(135deg, #5865f2, #43b581);
`;

export const AvatarContainer = styled.div`
  margin-top: -70px; // Puxa o avatar pra cima, sobrepondo o header
  position: relative;
  width: 120px;
  height: 120px;
  margin-left: auto;
  margin-right: auto;
  cursor: pointer;
`;

export const ProfileAvatar = styled(motion.img)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 6px solid #2f3136;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
  background-color: #202225;
`;

export const EditOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;

  ${AvatarContainer}:hover & {
    opacity: 1;
  }
`;

// Container principal para o conteúdo abaixo do avatar
export const ProfileBody = styled.div`
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
`;

export const UserInfo = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem; // Diminuí o gap
  user-select: text;
  margin-bottom: 0.75rem;
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
  margin: 0;
  background-color: #202225;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

export const BioText = styled.p`
  color: #b9bbbe;
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-wrap;
  text-align: center;
  user-select: text;
  max-width: 90%;
`;

export const StatsContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
  margin-top: 1.5rem;
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
`;

export const StatLabel = styled.p`
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #b9bbbe;
`;

// --- Estilos para o modo de edição ---

export const EditForm = styled(motion.div)`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1rem;
`;

export const UsernameInput = styled.input`
  width: 100%;
  background: #202225;
  border: 1px solid #40444b;
  border-radius: 4px;
  color: white;
  font-family: 'Fira Code', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  outline: none;
  padding: 0.5rem;

  &:focus {
    border-color: #5865f2;
  }
`;

export const BioTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  background-color: #202225;
  border: 1px solid #40444b;
  border-radius: 4px;
  color: #dcddde;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  padding: 0.5rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #5865f2;
  }
`;

export const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 0.75rem;
  width: 100%;
  max-height: 200px; // Aumentei um pouco
  overflow-y: auto;
  padding: 0.5rem;
  background-color: #202225;
  border-radius: 8px;
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
    border-radius: 4px;
  }
`;
