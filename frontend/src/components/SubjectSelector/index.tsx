// SubjectSelector.tsx
import React, { useMemo } from 'react';
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
  Timer,
  Question,
  Heart,
  Lightning,
  Sparkle,
  CheckCircle,
  Target,
  Trophy,
  Fire,
} from 'phosphor-react';
import { Subtitle, Title } from '../../style/globalStyle';
import type { Materia } from '../../interfaces';
import { useProgressStore } from '../../hooks/useProgressStore';
import { theme } from '../../style/theme';
import {
  fadeUp,
  popIn,
  spring,
  staggerContainer,
} from '../../style/motion';
import * as S from './style';

type SubjectInfo = Omit<Materia, 'niveis'> & {
  categoria: string;
  iconName: string;
  qtdQuestoes?: number;
};

const TOTAL_LEVELS = 3;

const iconMap: { [key: string]: React.ReactNode } = {
  Divide: <Divide size={30} color="white" weight="duotone" />,
  Code: <Code size={30} color="white" weight="duotone" />,
  Atom: <Atom size={30} color="white" weight="duotone" />,
  Flask: <Flask size={30} color="white" weight="duotone" />,
  TestTube: <TestTube size={30} color="white" weight="duotone" />,
  Leaf: <Leaf size={30} color="white" weight="duotone" />,
  GlobeHemisphereWest: (
    <GlobeHemisphereWest size={30} color="white" weight="duotone" />
  ),
  Scroll: <Scroll size={30} color="white" weight="duotone" />,
  Translate: <Translate size={30} color="white" weight="duotone" />,
  Brain: <Brain size={30} color="white" weight="duotone" />,
  MusicNotesSimple: <MusicNotesSimple size={30} color="white" weight="duotone" />,
};

const getIcon = (iconName: string) =>
  iconMap[iconName] || <Book size={30} color="white" weight="duotone" />;

export const SubjectSelector: React.FC<{
  subjects: readonly SubjectInfo[];
  onSelect: (subject: SubjectInfo) => void;
  onStartBrainstorm: () => void;
  onStartMultiplayer: () => void;
}> = ({ subjects, onSelect, onStartBrainstorm, onStartMultiplayer }) => {
  const progress = useProgressStore((s) => s.progress);
  const username = useProgressStore((s) => s.username);

  const groupedSubjects = useMemo(
    () =>
      subjects.reduce((acc, subject) => {
        const category = subject.categoria || 'Outros';
        (acc[category] ||= []).push(subject);
        return acc;
      }, {} as Record<string, SubjectInfo[]>),
    [subjects]
  );

  const computeCompletedLevels = (subjectId: string) => {
    const subjectProgress = progress?.[subjectId] ?? {};
    return Object.values(subjectProgress).filter((lvl: any) => lvl?.concluido)
      .length;
  };

  const computeCorrectAnswers = (subjectId: string) => {
    const subjectProgress = progress?.[subjectId] ?? {};
    return Object.values(subjectProgress).reduce(
      (sum, lvl: any) => sum + (lvl?.acertos || 0),
      0
    );
  };

  const computeSubjectPercent = (subjectId: string) => {
    const completed = computeCompletedLevels(subjectId);
    const raw = (completed / Math.max(1, TOTAL_LEVELS)) * 100;
    return Math.round(Math.max(0, Math.min(100, raw)));
  };

  // Números do topo: dão ao usuário uma leitura imediata de onde ele está.
  const overview = useMemo(() => {
    const totalAcertos = subjects.reduce(
      (sum, s) => sum + computeCorrectAnswers(s.id),
      0
    );
    const niveisConcluidos = subjects.reduce(
      (sum, s) => sum + computeCompletedLevels(s.id),
      0
    );
    const materiasIniciadas = subjects.filter(
      (s) => Object.keys(progress?.[s.id] ?? {}).length > 0
    ).length;
    return { totalAcertos, niveisConcluidos, materiasIniciadas };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, progress]);

  const isLoading = subjects.length === 0;

  return (
    <S.Container>
      <S.Hero initial="hidden" animate="visible" variants={staggerContainer(0.08)}>
        <S.HeroBadge variants={fadeUp}>
          <Sparkle size={14} weight="fill" />
          {username ? `Bom te ver, ${username}` : 'Bem-vindo de volta'}
        </S.HeroBadge>

        <Title>Bem-vindo ao StudyQuest!</Title>

        <Subtitle style={{ marginBottom: 0 }}>
          Escolha uma matéria e bora detonar a curva de aprendizado.
        </Subtitle>

        <S.HeroStats variants={staggerContainer(0.07, 0.15)}>
          <S.StatChip
            variants={popIn}
            whileHover={{ y: -4 }}
            transition={spring}
            $accent={theme.color.success}
          >
            <Target size={22} weight="duotone" />
            <div>
              <div className="value">{overview.totalAcertos}</div>
              <div className="label">acertos</div>
            </div>
          </S.StatChip>

          <S.StatChip
            variants={popIn}
            whileHover={{ y: -4 }}
            transition={spring}
            $accent={theme.color.gold}
          >
            <Trophy size={22} weight="duotone" />
            <div>
              <div className="value">{overview.niveisConcluidos}</div>
              <div className="label">níveis concluídos</div>
            </div>
          </S.StatChip>

          <S.StatChip
            variants={popIn}
            whileHover={{ y: -4 }}
            transition={spring}
            $accent={theme.color.pink}
          >
            <Fire size={22} weight="duotone" />
            <div>
              <div className="value">
                {overview.materiasIniciadas}/{subjects.length || '–'}
              </div>
              <div className="label">matérias em curso</div>
            </div>
          </S.StatChip>
        </S.HeroStats>
      </S.Hero>

      {isLoading ? (
        <S.LoaderWrapper>
          <S.Loader />
          <p style={{ color: theme.color.textMuted, marginTop: '1.25rem' }}>
            Carregando matérias...
          </p>
        </S.LoaderWrapper>
      ) : (
        <>
          {Object.entries(groupedSubjects).map(
            ([category, subjectsInCategory]) => (
              <section key={category}>
                <S.CategoryHeader
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.6 }}
                  variants={fadeUp}
                >
                  <S.CategoryTitle>{category}</S.CategoryTitle>
                  <S.CategoryCount>{subjectsInCategory.length}</S.CategoryCount>
                  <S.CategoryRule />
                </S.CategoryHeader>

                <S.SubjectGrid
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  variants={staggerContainer(0.05)}
                >
                  {subjectsInCategory.map((subject) => {
                    const correctAnswers = computeCorrectAnswers(subject.id);
                    const completed = computeCompletedLevels(subject.id);
                    const percent = computeSubjectPercent(subject.id);
                    const accent = subject.cor?.bg || theme.color.primary;
                    const isDone = percent === 100;

                    return (
                      <S.SubjectCard
                        key={subject.id}
                        onClick={() => onSelect(subject)}
                        $accent={accent}
                        variants={popIn}
                        whileHover={{ y: -6, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={spring}
                        aria-label={`${subject.nome} - ${percent}% completo`}
                      >
                        {isDone && (
                          <S.DoneBadge
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ ...spring, delay: 0.15 }}
                          >
                            <CheckCircle size={20} weight="fill" />
                          </S.DoneBadge>
                        )}

                        <div className="top">
                          <S.IconWrap $accent={accent} aria-hidden>
                            {getIcon(subject.iconName)}
                          </S.IconWrap>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3>{subject.nome}</h3>
                            <div className="meta">
                              {completed}/{TOTAL_LEVELS} níveis •{' '}
                              {correctAnswers} acertos
                            </div>
                          </div>
                        </div>

                        <div
                          className="progress-wrap"
                          role="progressbar"
                          aria-valuenow={percent}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${subject.nome} progresso`}
                        >
                          <S.ProgressBarContainer>
                            <S.ProgressBarFill
                              $accent={accent}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${percent}%` }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.9,
                                ease: [0.22, 1, 0.36, 1],
                                delay: 0.15,
                              }}
                            />
                          </S.ProgressBarContainer>
                          <S.ProgressLabel>
                            <span>
                              {isDone ? 'Concluída' : 'Progresso'}
                            </span>
                            <span>{percent}%</span>
                          </S.ProgressLabel>
                        </div>
                      </S.SubjectCard>
                    );
                  })}
                </S.SubjectGrid>
              </section>
            )
          )}
          <S.Separator />
        </>
      )}

      {/* A seção Brainstorm fica fora da checagem para ser um CTA de destaque */}
      <S.BrainstormSection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={staggerContainer(0.08)}
      >
        <S.BrainstormOrb aria-hidden />

        <S.BrainstormContent>
          <S.BrainStormTitle>
            <Brain size={38} weight="duotone" />
            Brainstorm
          </S.BrainStormTitle>

          <S.BrainstormDescription>
            Modo de quiz rápido e frenético contra o relógio. Ideal para testar
            seus conhecimentos sob pressão e ganhar XP bônus!
          </S.BrainstormDescription>

          <S.BrainControls>
            <S.LargeButton
              onClick={onStartBrainstorm}
              variants={fadeUp}
              whileHover={{ y: -4, scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={spring}
            >
              <Brain size={18} weight="bold" />
              Solo
            </S.LargeButton>

            <S.LargeButton
              $variant="accent"
              onClick={onStartMultiplayer}
              variants={fadeUp}
              whileHover={{ y: -4, scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={spring}
            >
              <Sword size={18} weight="bold" />
              Multiplayer
              <S.PulseDot />
            </S.LargeButton>
          </S.BrainControls>
        </S.BrainstormContent>

        <S.BrainInfo>
          <h4>
            <Flask size={16} weight="bold" />
            Como funciona
          </h4>
          <ul>
            {[
              {
                icon: <Timer size={20} weight="duotone" />,
                node: (
                  <>
                    <strong>60s</strong> por sessão
                  </>
                ),
              },
              {
                icon: <Question size={20} weight="duotone" />,
                node: (
                  <>
                    <strong>10s</strong> por pergunta
                  </>
                ),
              },
              {
                icon: <Heart size={20} weight="duotone" />,
                node: (
                  <>
                    <strong>3 vidas</strong> por jogo
                  </>
                ),
              },
              {
                icon: <Lightning size={20} weight="duotone" />,
                node: (
                  <>
                    Respostas rápidas dão <strong>XP bônus</strong>
                  </>
                ),
              },
            ].map((item, i) => (
              <S.InfoItem key={i} variants={fadeUp}>
                {item.icon} {item.node}
              </S.InfoItem>
            ))}
          </ul>
        </S.BrainInfo>
      </S.BrainstormSection>
    </S.Container>
  );
};
