import styled from 'styled-components';

export const XPBarWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
`;

export const InfoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0 0.25rem;
`;

export const LevelLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: #dcddde;
`;

export const XPLabel = styled.span`
  font-size: 0.8rem;
  color: #b9bbbe;
`;

export const ProgressBarContainer = styled.div`
  width: 100%;
  height: 12px;
  background-color: #2f3136;
  border-radius: 9999px;
  overflow: hidden;
`;

export const ProgressBarFill = styled.div<{ progress: number }>`
  width: ${(props) => props.progress}%;
  height: 100%;
  background: linear-gradient(90deg, #43b581, #5865f2);
  border-radius: 9999px;
  transition: width 0.5s cubic-bezier(0.25, 1, 0.5, 1);
`;
