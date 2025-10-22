import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shine = keyframes`
  0% { background-position: 220% 0; }
  100% { background-position: -120% 0; }
`;

const eyeMove = keyframes`
  0%  , 10% {     background-position: 0px 0px}
  13%  , 40% {     background-position: -15px 0px}
  43%  , 70% {     background-position: 15px 0px}
  73%  , 90% {     background-position: 0px 15px}
  93%  , 100% {     background-position: 0px 0px}
`;

const blink = keyframes`
  0%  , 10% , 12% , 20%, 22%, 40%, 42% , 60%, 62%,  70%, 72% , 90%, 92%, 98% , 100%
  { height: 48px}
  11% , 21% ,41% , 61% , 71% , 91% , 99%
  { height: 18px}
`;

export const Container = styled.div`
  animation: ${fadeIn} 380ms ease-out;
  padding-bottom: 2rem;
`;

export const CategoryTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  color: #dfe6ee;
  margin-top: 2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
`;

export const SubjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
`;

export const Loader = styled.span`
  position: relative;
  width: 108px;
  display: flex;
  justify-content: space-between;

  &::after,
  &::before {
    content: '';
    display: inline-block;
    width: 48px;
    height: 48px;
    background-color: #fff;
    /* Imagem para simular a pupila */
    background-image: radial-gradient(circle 14px, #0d161b 100%, transparent 0);
    background-repeat: no-repeat;
    border-radius: 50%;
    animation: ${eyeMove} 10s infinite, ${blink} 10s infinite;
  }
`;

export const LoaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 3rem 0;
`;

export const SubjectCard = styled.button<{ bg: string; text: string }>`
  --card-bg: ${(p) => p.bg};
  --card-text: ${(p) => p.text};
  background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.06),
      rgba(255, 255, 255, 0.02)
    ),
    var(--card-bg);
  color: var(--card-text);
  border: 0;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease;
  min-height: 150px;
  text-align: left;
  overflow: hidden;

  &:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow: 0 14px 30px rgba(2, 6, 23, 0.6);
  }

  .top {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .icon-wrap {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 8px rgb(0 0 0 / 45%);
  }
  h3 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
    color: white;
    letter-spacing: -0.3px;
  }
  .meta {
    font-size: 0.82rem;
    color: rgba(255, 255, 255, 1);
    opacity: 0.92;
  }
  .progress-wrap {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;

export const ProgressBarContainer = styled.div`
  height: 12px;
  width: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04),
    rgba(0, 0, 0, 0.06)
  );
  border-radius: 999px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.15);
`;

export const ProgressBarFill = styled.div<{
  $percent: number;
  $delay?: number;
}>`
  width: ${(p) => Math.max(0, Math.min(100, p.$percent))}%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.7)
  );
  box-shadow: inset 0 -6px 18px rgba(255, 255, 255, 0.05);
  transition: width 420ms cubic-bezier(0.2, 0.9, 0.2, 1);
  position: relative;
  background-size: 220% 100%;
  animation: ${shine} 4.6s linear infinite;
  animation-delay: ${(p) => p.$delay || 0}ms;
`;

export const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.95);
`;

export const Separator = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  margin: 2.5rem 0;
`;

// --- NOVA SEÇÃO BRAINSTORM ---
export const BrainstormSection = styled(motion.section)`
  border-radius: 16px;
  padding: 2.5rem;
  background: linear-gradient(105deg, #2c2f4a 0%, #1a1b24 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 2.5rem;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 2rem 1.5rem;
  }
`;

export const BrainstormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 880px) {
    align-items: center;
  }
`;

export const BrainStormTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 2.5rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  letter-spacing: -1px;
`;

export const BrainstormDescription = styled.p`
  color: #c9d1d9;
  font-size: 1rem;
  line-height: 1.6;
  max-width: 450px;
  margin: 0;
`;

export const BrainControls = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

export const LargeButton = styled.button<{ $variant?: 'primary' | 'accent' }>`
  --color-primary: ${(p) => (p.$variant === 'accent' ? '#f05a4a' : '#4f5bd5')};
  --color-secondary: ${(p) =>
    p.$variant === 'accent' ? '#f7b84a' : '#44c284'};

  position: relative;
  overflow: hidden;

  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;

  display: inline-flex;
  gap: 10px;
  align-items: center;
  justify-content: center;

  font-weight: 700;
  font-size: 1rem;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);

  background-image: linear-gradient(
      to right,
      var(--color-primary),
      var(--color-secondary)
    ),
    linear-gradient(to right, var(--color-primary), var(--color-secondary));
  background-size: 100% 100%, 100% 100%;
  background-position: center center, center center;

  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2),
    0 4px 8px rgba(0, 0, 0, 0.4);

  transition: transform 200ms ease, box-shadow 200ms ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 75%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transform: skewX(-25deg);
    transition: left 400ms ease;
  }

  &:hover {
    transform: translateY(-4px) scale(1.03);
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2),
      0 8px 16px rgba(0, 0, 0, 0.5);

    &::before {
      left: 120%;
    }
  }
`;

export const BrainInfo = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 1.5rem;

  h4 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    color: #e6eef7;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  li {
    color: #c6cbd2;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
  }
`;
