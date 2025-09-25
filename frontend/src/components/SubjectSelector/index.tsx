// SubjectSelector.tsx
import React from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Divide,
  Code,
  Atom,
  Flask,
  GlobeHemisphereWest,
  Scroll,
  Translate,
  Brain,
  MusicNotesSimple,
  Book,
  Leaf,
  TestTube,
  Sword,
} from 'phosphor-react';
import { Subtitle, Title } from '../../style/globalStyle';
import type { Materia } from '../../interfaces';
import { useProgressStore } from '../../hooks/useProgressStore';

// --- TIPOS ---
type SubjectInfo = Omit<Materia, 'niveis'> & {
  categoria: string;
  iconName: string;
  qtdQuestoes?: number;
};

// --- HELPERS ---
const hexToLuminance = (hex = '#000000') => {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  // linearize
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum;
};
const getContrastText = (bg = '#000000') =>
  hexToLuminance(bg) > 0.55 ? '#0b0b0b' : '#ffffff';

// --- ANIMAÇÕES ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* INVERTEI A DIREÇÃO DO "SHINE":
   Antes: from -120% -> 220% (podia parecer "indo pra trás" dependendo do gradiente)
   Agora: vai de 220% -> -120% para dar a sensação de movimento LEFT -> RIGHT
*/
const shine = keyframes`
  0% { background-position: 220% 0; }
  100% { background-position: -120% 0; }
`;

// --- STYLES ---
const Container = styled.div`
  animation: ${fadeIn} 380ms ease-out;
  padding-bottom: 2rem;
`;

const CategoryTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  color: #dfe6ee;
  margin-top: 2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
`;

const SubjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
`;

const SubjectCard = styled.button<{ bg: string; text: string }>`
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
  &:focus-visible {
    outline: 3px solid rgba(120, 140, 255, 0.22);
    outline-offset: 3px;
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
    color: rgba(255, 255, 255, 0.85);
    opacity: 0.92;
  }

  .progress-wrap {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;

const ProgressBarContainer = styled.div`
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

const ProgressBarFill = styled.div<{ percent: number }>`
  width: ${(p) => Math.max(0, Math.min(100, p.percent))}%;
  height: 100%;
  /* Mantive o gradiente branco (visível sobre bg colorido) e o efeito shine direcionado */
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.7)
  );
  box-shadow: inset 0 -6px 18px rgba(255, 255, 255, 0.05);
  transition: width 420ms cubic-bezier(0.2, 0.9, 0.2, 1);
  position: relative;
  background-size: 220% 100%;
  /* animação invertida aplicada (agora vai "pra frente") */
  animation: ${shine} 2.6s linear infinite;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.95);
`;

/* Brainstorm area - MELHOR POSICIONAMENTO e LAYOUT */
const BrainstormSection = styled.section`
  padding: 1.6rem;

  display: grid;
  gap: 2rem;
  align-items: start;
  justify-items: center;

  /* desktop: coluna de conteúdo + coluna de controle (buttons) */
  @media (min-width: 880px) {
    grid-template-columns: minmax(360px, 0fr) 830px;
    align-items: center;
    justify-items: stretch;
  }
`;

const BrainStormTitle = styled.h3`
  display: flex;
  justify-content: center;
  font-size: 2rem;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  color: #dfe6ee;
  margin-bottom: 0.6rem;
  margin: 0;
`;

const Separator = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  margin: 1.6rem 0;
`;

const BrainInfo = styled.div`
  background: rgba(12, 14, 16, 0.72);
  border-radius: 12px;
  padding: 18px;
  width: 100%;
  color: #d1d7dd;
  border: 1px solid rgba(255, 255, 255, 0.03);
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.45);

  /* header menor e mais claro */
  .info-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  h4 {
    margin: 0;
    font-size: 1.03rem;
    display: flex;
    gap: 8px;
    align-items: center;
    color: #e6eef7;
  }

  .lead {
    color: #bfc9d4;
    margin: 6px 0 12px;
    line-height: 1.45;
  }

  ul {
    margin: 0;
    padding-left: 18px;
    color: #c6cbd2;
    line-height: 1.55;
  }

  /* garantir que o card não "engula" os controles no mobile */
  @media (max-width: 879px) {
    padding: 14px;
  }
`;

const BrainControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
  justify-content: center;
  padding: 8px;

  @media (min-width: 880px) {
    align-items: center;
    justify-content: center;
    padding-left: 12px;
  }
`;

const LargeButton = styled.button<{ variant?: 'primary' | 'accent' }>`
  padding: 12px 18px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  gap: 10px;
  align-items: center;
  font-weight: 800;
  letter-spacing: 0.2px;
  transition: transform 160ms ease, box-shadow 160ms ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
  background: ${(p) =>
    p.variant === 'accent'
      ? 'linear-gradient(45deg, #f05a4a, #f7b84a)'
      : 'linear-gradient(45deg, #6f7ef0, #44c284)'};
  color: white;
  min-width: 140px;
  justify-content: center;

  &:hover {
    transform: translateY(-4px);
  }

  @media (max-width: 520px) {
    width: 100%;
  }
`;

// --- ICON MAP (mantive) ---
const iconMap: { [key: string]: React.ReactNode } = {
  Divide: <Divide size={36} color="white" weight="light" />,
  Code: <Code size={36} color="white" weight="light" />,
  Atom: <Atom size={36} color="white" weight="light" />,
  Flask: <Flask size={36} color="white" weight="light" />,
  TestTube: <TestTube size={36} color="white" weight="light" />,
  Leaf: <Leaf size={36} color="white" weight="light" />,
  GlobeHemisphereWest: (
    <GlobeHemisphereWest size={36} color="white" weight="light" />
  ),
  Scroll: <Scroll size={36} color="white" weight="light" />,
  Translate: <Translate size={36} color="white" weight="light" />,
  Brain: <Brain size={36} color="white" weight="light" />,
  MusicNotesSimple: <MusicNotesSimple size={36} color="white" weight="light" />,
};
const getIcon = (iconName: string) =>
  iconMap[iconName] || <Book size={36} color="white" weight="light" />;

// --- COMPONENTE PRINCIPAL ---
export const SubjectSelector: React.FC<{
  subjects: readonly SubjectInfo[];
  onSelect: (subject: SubjectInfo) => void;
  onStartBrainstorm: () => void;
  onStartMultiplayer: () => void;
}> = ({ subjects, onSelect, onStartBrainstorm, onStartMultiplayer }) => {
  const groupedSubjects = subjects.reduce((acc, subject) => {
    const category = subject.categoria || 'Outros';
    (acc[category] ||= []).push(subject);
    return acc;
  }, {} as Record<string, SubjectInfo[]>);

  const progress = useProgressStore((s) => s.progress);

  const computeCompletedLevels = (subjectId: string) => {
    const subjectProgress = progress?.[subjectId] ?? {};
    // conta apenas níveis marcados como concluído (true)
    const completed = Object.values(subjectProgress).filter(
      (lvl: any) => lvl?.concluido
    ).length;
    return completed;
  };

  const computeCorrectAnswers = (subjectId: string) => {
    const subjectProgress = progress?.[subjectId] ?? {};

    const totalCorrect = Object.values(subjectProgress).reduce(
      (sum, lvl: any) => sum + (lvl?.acertos || 0),
      0
    );

    return totalCorrect;
  };

  const computeSubjectPercent = (subjectId: string, totalLevels = 3) => {
    // totalLevels default 3; se tiver outro valor podes passar
    const completed = computeCompletedLevels(subjectId);
    // prevenção: totalLevels nunca 0
    const total = Math.max(1, totalLevels);
    const raw = (completed / total) * 100;
    const percent = Math.round(Math.max(0, Math.min(100, raw)));
    return percent;
  };

  return (
    <Container>
      <Title>Bem-vindo ao StudyQuest!</Title>
      <Subtitle style={{ marginBottom: '2.2rem', color: '#c9d1d9' }}>
        Escolha uma matéria e bora detonar a curva de aprendizado.
      </Subtitle>
      {Object.entries(groupedSubjects).map(([category, subjectsInCategory]) => (
        <section key={category}>
          <CategoryTitle>{category}</CategoryTitle>
          <SubjectGrid>
            {subjectsInCategory.map((subject, idx) => {
              const totalLevels = 3;
              const correctAnswers = computeCorrectAnswers(subject.id);
              const completed = computeCompletedLevels(subject.id);
              const percent = computeSubjectPercent(subject.id, totalLevels);
              const textColor = getContrastText(subject.cor.bg || '#111827');
              return (
                <SubjectCard
                  key={subject.id}
                  onClick={() => onSelect(subject)}
                  bg={subject.cor.bg}
                  text={textColor}
                  aria-label={`${subject.nome} - ${percent}% completo`}
                  style={{ animationDelay: `${(idx % 6) * 35}ms` }}
                >
                  <div className="top">
                    <div className="icon-wrap" aria-hidden>
                      {getIcon(subject.iconName)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <h3>{subject.nome}</h3>
                      <div className="meta">
                        {completed}/{totalLevels} níveis • {correctAnswers}{' '}
                        acertos
                      </div>
                    </div>
                    <div style={{ marginLeft: 8, textAlign: 'right' }} />
                  </div>

                  <div
                    className="progress-wrap"
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${subject.nome} progresso`}
                  >
                    <ProgressBarContainer>
                      <ProgressBarFill percent={percent} />
                    </ProgressBarContainer>
                    <ProgressLabel>
                      <span style={{ opacity: 0.9 }}>{percent}%</span>
                    </ProgressLabel>
                  </div>
                </SubjectCard>
              );
            })}
          </SubjectGrid>
        </section>
      ))}
      <Separator />
      <BrainStormTitle>
        {' '}
        {
          <>
            <Brain size={40} weight="bold" />
            BrainStorm
          </>
        }
      </BrainStormTitle>
      <BrainstormSection>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignItems: 'stretch',
            justifyContent: 'center',
          }}
        >
          <div
            style={{ color: '#cbd5df', textAlign: 'center', fontWeight: 700 }}
          >
            Modo rápido e frenético — responda o máximo que puder!
          </div>

          <BrainControls>
            <LargeButton
              onClick={onStartBrainstorm}
              aria-label="Iniciar Brainstorm Solo"
            >
              <Brain size={18} weight="bold" />
              Solo
            </LargeButton>

            <LargeButton
              variant="accent"
              onClick={onStartMultiplayer}
              aria-label="Iniciar Brainstorm Multiplayer"
            >
              <Sword size={18} weight="bold" />
              Multiplayer
            </LargeButton>
          </BrainControls>
        </div>
        <BrainInfo>
          <div className="info-header">
            <Flask size={18} />
            <h4>Como funciona</h4>
          </div>

          <p className="lead">
            Modo de quiz acelerado com tempo limitado — ideal para revisão
            rápida. Responda o máximo que puder com agilidade e mantenha suas
            vidas.
          </p>

          <ul>
            <li>
              <strong>60s</strong> por sessão
            </li>
            <li>
              <strong>10s</strong> por pergunta
            </li>
            <li>
              <strong>3 vidas</strong> por jogo
            </li>
            <li>
              Respostas rápidas dão <strong>XP bônus</strong>
            </li>
          </ul>
        </BrainInfo>
      </BrainstormSection>
    </Container>
  );
};
