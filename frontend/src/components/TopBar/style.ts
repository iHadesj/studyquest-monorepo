// src/components/TopBar/style.ts
import { Gear } from 'phosphor-react';
import styled, { keyframes } from 'styled-components';

const shineAnimation = keyframes`
  0% {
    transform: translateX(-100%) skewX(-30deg);
  }
  100% {
    transform: translateX(250%) skewX(-30deg);
  }
`;

export const TopBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1280px;
  gap: 2rem;
  margin: 0 auto;
`;

export const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
`;

export const UserDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
  font-weight: bold;
  font-size: 1rem;

  &:hover .settings-icon {
    opacity: 1;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const Username = styled.span``;

export const SettingsIcon = styled(Gear)`
  color: #b9bbbe;
  opacity: 0;
  transition: opacity 0.2s;
`;

export const LevelBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 400px;
  @media (max-width: 480px) {
    gap: 0.6rem;
  }
`;

export const LevelDisplay = styled.div`
  background-color: #5865f2;
  color: white;
  font-weight: bold;
  padding: 0.4rem;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  flex-shrink: 0;
  border: 2px solid #2f3136;
  box-shadow: 0 0 10px rgba(88, 101, 242, 0.7);
`;

export const ProgressBarContainer = styled.div`
  width: 100%;
  background-color: #282a2fff;
  border-radius: 99px;
  border: 2px solid #ffffff00;
  height: 22px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
`;

export const AvatarContainer = styled.div`
  position: relative;
  cursor: pointer;
`;

export const ProgressBarFill = styled.div<{ $progress: number }>`
  width: ${(props) => props.$progress}%;
  height: 100%;
  background: linear-gradient(90deg, #43b581, #5865f2);
  transition: width 0.5s ease-in-out;
  border-radius: 99px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: ${shineAnimation} 3s infinite linear;
  }
`;

export const XPText = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: 100;
  text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.8);
  white-space: nowrap;

  @media (max-width: 480px) {
    display: none;
  }
`;

export const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  margin-left: 1rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    color: #ffffff;
    background-color: #40444b;
  }
`;
