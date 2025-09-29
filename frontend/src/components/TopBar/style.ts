import { Gear } from 'phosphor-react';
import styled from 'styled-components';

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
  gap: 1rem;
  width: 100%;
  max-width: 400px;
`;

export const LevelDisplay = styled.div`
  background-color: #5865f2;
  color: white;
  font-weight: bold;
  padding: 0.5rem;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
  border: 2px solid #2f3136;
`;

export const ProgressBarContainer = styled.div`
  width: 100%;
  background-color: #202225;
  border-radius: 8px;
  height: 20px;
  overflow: hidden;
  position: relative;
  border: 1px solid #40444b;
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
`;

export const XPText = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);

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
