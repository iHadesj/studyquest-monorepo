// src/components/TopBar/style.ts
import { Gear } from 'phosphor-react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../style/theme';

const shineAnimation = keyframes`
  0%   { transform: translateX(-100%) skewX(-30deg); }
  100% { transform: translateX(250%) skewX(-30deg); }
`;

const ringPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(124, 92, 255, 0.45); }
  50%      { box-shadow: 0 0 0 6px rgba(124, 92, 255, 0); }
`;

export const TopBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: ${theme.layout.maxWidth};
  gap: 2rem;
  margin: 0 auto;

  @media (max-width: 480px) {
    gap: 0.75rem;
  }
`;

export const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem 0.25rem 0.25rem;
  border-radius: ${theme.radius.pill};
  transition: background 200ms ease;

  &:hover {
    background: ${theme.color.glass};
  }

  img {
    transition: transform 300ms ${theme.ease.bounce},
      border-color 200ms ease;
  }
  &:hover img {
    transform: scale(1.08) rotate(-5deg);
    border-color: ${theme.color.primary};
  }
`;

export const UserDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${theme.color.text};
  font-weight: 700;
  font-size: 0.92rem;

  &:hover .settings-icon {
    opacity: 1;
    transform: rotate(90deg);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const Username = styled.span``;

export const SettingsIcon = styled(Gear)`
  color: ${theme.color.textMuted};
  opacity: 0;
  transition: opacity 220ms ease, transform 420ms ${theme.ease.out};
`;

export const LevelBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  max-width: 420px;
`;

export const LevelDisplay = styled.div`
  position: relative;
  background: ${theme.gradient.primary};
  color: white;
  font-weight: 800;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.8rem;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  animation: ${ringPulse} 2.6s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const ProgressBarContainer = styled.div`
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  border-radius: ${theme.radius.pill};
  border: 1px solid ${theme.color.stroke};
  height: 22px;
  overflow: hidden;
  position: relative;
`;

export const AvatarContainer = styled.div`
  position: relative;
  cursor: pointer;
`;

export const ProgressBarFill = styled.div<{ $progress: number }>`
  width: ${(props) => props.$progress}%;
  height: 100%;
  background: ${theme.gradient.primary};
  transition: width 700ms ${theme.ease.out};
  border-radius: ${theme.radius.pill};
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
    background: ${theme.gradient.sheen};
    animation: ${shineAnimation} 3s infinite linear;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
    }
  }
`;

export const XPText = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.72rem;
  font-weight: 600;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;

  @media (max-width: 480px) {
    display: none;
  }
`;

export const LogoutButton = styled.button`
  background: none;
  border: 1px solid transparent;
  color: ${theme.color.textMuted};
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: color 200ms ease, background 200ms ease,
    transform 260ms ${theme.ease.bounce}, border-color 200ms ease;

  &:hover {
    color: ${theme.color.danger};
    background: rgba(251, 113, 133, 0.1);
    border-color: rgba(251, 113, 133, 0.3);
    transform: translateX(3px);
  }
  &:active {
    transform: translateX(3px) scale(0.92);
  }
`;
