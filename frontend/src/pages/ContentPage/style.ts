import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../style/theme';

export const ContentWrapper = styled.div`
  max-width: 48rem;
  margin: 0 auto;
  padding-bottom: 4rem;
`;

export const ContentCard = styled(motion.div)`
  background-color: #2f3136;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #40444b;
  margin-bottom: 1.5rem;
  white-space: pre-wrap;

  h3 {
    margin-top: 0;
    color: #5865f2;
  }

  p {
    line-height: 1.8;
    color: #dcddde;
  }

  code {
    background-color: #202225;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.9em;
  }
`;

export const StartExercisesButton = styled.button`
  background-color: #43b581;
  color: #ffffff;
  font-family: ${theme.font.sans};
  font-weight: bold;
  padding: 0.75rem 2rem;
  border-radius: 4px;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem auto 0;

  &:hover {
    background-color: #3aa570;
  }
`;
