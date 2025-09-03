import styled from 'styled-components';
import { Avatar as BaseAvatar } from '../TopBar/index';

export const ProfileWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0;
`;

export const ProfileAvatar = styled(BaseAvatar)`
  width: 100px;
  height: 100px;
  border: 4px solid #4f545c;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

export const Username = styled.h3`
  margin: 0;
  font-size: 1.5rem;
  color: #ffffff;
  font-weight: 600;
`;

export const StatsContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
  padding: 1rem;
  background-color: #292b2f;
  border-radius: 8px;
  width: 100%;
  justify-content: center;
`;

export const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

export const StatValue = styled.p`
  margin: 0;
  font-size: 1.25rem;
  font-weight: bold;
  color: #5865f2; /* Cor de destaque */
`;

export const StatLabel = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #b9bbbe;
  text-transform: uppercase;
`;
