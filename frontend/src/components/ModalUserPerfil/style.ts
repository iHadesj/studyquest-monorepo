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
`;

export const ProfileHeader = styled(motion.div)`
  width: 100%;
  height: 100px;
  background: linear-gradient(135deg, #5865f2, #43b581);
  border-radius: 16px 16px 0 0;
  margin-top: -1.5rem;
  position: relative;
`;

export const ProfileAvatar = styled(motion.img)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 6px solid #2f3136;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #202225;
`;

export const UserInfo = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  user-select: text;
  margin-top: 80px;
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
  margin: -0.5rem 0 0 0;
  background-color: #202225;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

export const StatsContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
  margin-top: 1rem;
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
