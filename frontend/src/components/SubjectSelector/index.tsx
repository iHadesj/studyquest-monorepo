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
  Target,
  Trophy,
  Fire,
  FlagBanner,
} from 'phosphor-react';
import { Subtitle, Title } from '../../style/globalStyle';
import type { Materia } from '../../interfaces';
import { useProgressStore } from '../../hooks/useProgressStore';
import { theme } from '../../style/theme';
import { fadeUp, popIn, spring, staggerContainer } from '../../style/motion';
import { JourneyMap, type TrailGroup } from '../JourneyMap';
import * as S from './style';

type SubjectInfo = Omit<Materia, 'niveis'> & {
  categoria: string;
  iconName: string;
  qtdQuestoes?: number;
};

const TOTAL_LEVELS = 3;

const iconMap: { [key: string]: React.ReactNode } = {
  Divide: <Divide size={30} weight="duotone" />,
  Code: <Code size={30} weight="duotone" />,
  Atom: <Atom size={30} weight="duotone" />,
  Flask: <Flask size={30} weight="duotone" />,
  TestTube: <TestTube size={30} weight="duotone" />,
  Leaf: <Leaf size={30} weight="duotone" />,
  GlobeHemisphereWest: <GlobeHemisphereWest size={30} weight="duotone" />,
  Scroll: <Scroll size={30} weight="duotone" />,
  Translate: <Translate size={30} weight="duotone" />,
  Brain: <Brain size={30} weight="duotone" />,
  MusicNotesSimple: <MusicNotesSimple size={30} weight="duotone" />,
};

const getIcon = (iconName: string): React.ReactNode => {
  const icon = iconMap[iconName] || <Book size={30} weight="duotone" />;
  return React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
    className: 'icone',
  });
};

export const SubjectSelector: React.FC<{
  subjects: readonly SubjectInfo[];
  onSelect: (subject: SubjectInfo) => void;
  onStartBrainstorm: () => void;
  onStartMultiplayer: () => void;
}> = ({ subjects, onSelect, onStartBrainstorm, onStartMultiplayer }) => {
  const progress = useProgressStore((s) => s.progress);
  const username = useProgressStore((s) => s.username);

  const completedLevels = (subjectId: string) =>
    Object.values(progress?.[subjectId] ?? {}).filter(
      (lvl: any) => lvl?.concluido
    ).length;

  const correctAnswers = (subjectId: string) =>
    Object.values(progress?.[subjectId] ?? {}).reduce(
      (sum, lvl: any) => sum + (lvl?.acertos || 0),
      0
    );

  // As paradas da trilha, já agrupadas por região (categoria).
  const groups = useMemo<TrailGroup[]>(() => {
    const byCategory = new Map<string, TrailGroup>();
    subjects.forEach((subject) => {
      const categoria = subject.categoria || 'Outros';
      if (!byCategory.has(categoria)) {
        byCategory.set(categoria, { categoria, subjects: [] });
      }
      const completed = completedLevels(subject.id);
      byCategory.get(categoria)!.subjects.push({
        id: subject.id,
        nome: subject.nome,
        accent: subject.cor?.bg || theme.color.primary,
        icon: getIcon(subject.iconName),
        percent: Math.round(
          Math.max(0, Math.min(100, (completed / TOTAL_LEVELS) * 100))
        ),
        completedLevels: completed,
        totalLevels: TOTAL_LEVELS,
      });
    });
    return Array.from(byCategory.values());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, progress]);

  const overview = useMemo(() => {
    const totalAcertos = subjects.reduce(
      (sum, s) => sum + correctAnswers(s.id),
      0
    );
    const niveisConcluidos = subjects.reduce(
      (sum, s) => sum + completedLevels(s.id),
      0
    );
    const materiasIniciadas = subjects.filter(
      (s) => Object.keys(progress?.[s.id] ?? {}).length > 0
    ).length;
    return { totalAcertos, niveisConcluidos, materiasIniciadas };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, progress]);

  const handleSelectById = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    if (subject) onSelect(subject);
  };

  const isLoading = subjects.length === 0;

  return (
    <S.Container>
      <S.Hero
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.08)}
      >
        <S.HeroBadge variants={fadeUp}>
          <Sparkle size={14} weight="fill" />
          {username ? `Bom te ver, ${username}` : 'Bem-vindo de volta'}
        </S.HeroBadge>

        <Title>Sua jornada</Title>

        <Subtitle style={{ marginBottom: 0 }}>
          Cada parada é uma matéria. Siga a trilha e chegue ao Brainstorm.
        </Subtitle>

        <S.StatStrip variants={popIn}>
          <S.Stat $accent={theme.color.success}>
            <Target size={20} weight="duotone" />
            <div>
              <div className="value">{overview.totalAcertos}</div>
              <div className="label">acertos</div>
            </div>
          </S.Stat>
          <S.Stat $accent={theme.color.gold}>
            <Trophy size={20} weight="duotone" />
            <div>
              <div className="value">{overview.niveisConcluidos}</div>
              <div className="label">níveis</div>
            </div>
          </S.Stat>
          <S.Stat $accent={theme.color.pink}>
            <Fire size={20} weight="duotone" />
            <div>
              <div className="value">
                {overview.materiasIniciadas}/{subjects.length || '–'}
              </div>
              <div className="label">em curso</div>
            </div>
          </S.Stat>
        </S.StatStrip>
      </S.Hero>

      {isLoading ? (
        <S.LoaderWrapper>
          <S.Loader />
          <p style={{ color: theme.color.textMuted, marginTop: '1.25rem' }}>
            Traçando a sua trilha...
          </p>
        </S.LoaderWrapper>
      ) : (
        <>
          <S.TrailStart
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <FlagBanner size={18} weight="fill" />
            Largada
            <span className="linha" />
          </S.TrailStart>

          <JourneyMap groups={groups} onSelect={handleSelectById} />
          <S.TrailEnd />
        </>
      )}

      <S.PortalSection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer(0.08)}
      >
        <S.PortalRing>
          <Brain size={52} weight="duotone" />
        </S.PortalRing>

        <S.PortalTitle>Brainstorm</S.PortalTitle>

        <S.PortalDescription>
          O fim da trilha. Quiz rápido e frenético contra o relógio, para testar
          tudo o que você aprendeu sob pressão e ganhar XP bônus.
        </S.PortalDescription>

        <S.PortalMeta>
          {[
            {
              icon: <Timer size={15} weight="duotone" />,
              node: (
                <>
                  <strong>60s</strong> por sessão
                </>
              ),
            },
            {
              icon: <Question size={15} weight="duotone" />,
              node: (
                <>
                  <strong>10s</strong> por pergunta
                </>
              ),
            },
            {
              icon: <Heart size={15} weight="duotone" />,
              node: (
                <>
                  <strong>3 vidas</strong>
                </>
              ),
            },
            {
              icon: <Lightning size={15} weight="duotone" />,
              node: (
                <>
                  Rápido = <strong>XP bônus</strong>
                </>
              ),
            },
          ].map((item, i) => (
            <S.MetaChip key={i} variants={fadeUp}>
              {item.icon} {item.node}
            </S.MetaChip>
          ))}
        </S.PortalMeta>

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
      </S.PortalSection>
    </S.Container>
  );
};
