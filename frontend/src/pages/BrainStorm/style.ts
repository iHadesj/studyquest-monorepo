// pages/BrainStorm/style.ts

import styled from 'styled-components';

export const StormWrapper = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
`;

export const StatsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin-bottom: 2rem;
  font-size: 1.2rem;
  font-weight: bold;
`;

export const StatItem = styled.span`
  color: #b9bbbe;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  strong {
    color: #ffffff;
  }
`;

export const TimerBarContainer = styled.div`
  width: 100%;
  max-width: 600px;
  height: 10px;
  background-color: #40444b;
  border-radius: 5px;
  margin-bottom: 2rem;
  overflow: hidden;
`;

export const TimerBarProgress = styled.div<{ percentage: number }>`
  width: ${(props) => props.percentage}%;
  height: 100%;
  background-color: ${(props) =>
    props.percentage > 50
      ? '#43b581'
      : props.percentage > 25
      ? '#faa61a'
      : '#ed4245'};
  transition: width 0.2s linear;
`;

export const FeedbackText = styled.p<{ isCorrect: boolean }>`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${(props) => (props.isCorrect ? '#43b581' : '#ed4245')};
  height: 30px;
  margin: 0 0 1rem 0;
`;

export const StartScreen = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;

  p {
    max-width: 500px;
    color: #b9bbbe;
    line-height: 1.5;
  }
`;
