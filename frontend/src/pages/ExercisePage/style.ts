import styled, { css, keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../style/theme';

const shake = keyframes`
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
`;

export const ExerciseContainer = styled.div`
  max-width: 48rem;
  margin: 0 auto;
`;

export const QuestionCounter = styled.div`
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #b9bbbe;
  margin-bottom: 2rem;
`;

export const OptionLabel = styled(motion.label)<{
  $status: 'correct' | 'incorrect' | 'default';
}>`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: #36393f;
  border-radius: 4px;
  border: 2px solid #40444b;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #5865f2;
  }

  ${({ $status }) =>
    $status === 'correct' &&
    css`
      background-color: #43b581;
      border-color: #3aa570;
      color: white;
      transform: scale(1.02);
    `}

  ${({ $status }) =>
    $status === 'incorrect' &&
    css`
      background-color: #ed4245;
      border-color: #d83c3e;
      color: white;
      animation: ${shake} 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    `}
`;

export const RadioInput = styled.input`
  margin-right: 0.75rem;
  accent-color: #5865f2;
`;

export const ActionButton = styled.button`
  background-color: #5865f2;
  color: #ffffff;
  font-family: ${theme.font.sans};
  font-weight: bold;
  padding: 0.75rem 3rem;
  border-radius: 4px;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 2rem;

  &:disabled {
    background-color: #40444b;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: #4f5bd5;
  }
`;
