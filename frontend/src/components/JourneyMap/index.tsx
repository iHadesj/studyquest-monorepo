import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CheckCircle } from 'phosphor-react';
import { theme } from '../../style/theme';
import { spring } from '../../style/motion';
import * as S from './style';

export type TrailSubject = {
  id: string;
  nome: string;
  accent: string;
  icon: ReactNode;
  percent: number;
  completedLevels: number;
  totalLevels: number;
};

export type TrailGroup = {
  categoria: string;
  subjects: TrailSubject[];
};

type Entry =
  | { kind: 'region'; key: string; label: string; count: number }
  | { kind: 'subject'; key: string; subject: TrailSubject; ordem: number };

/**
 * Métricas da trilha por largura disponível. O nó menor e a amplitude menor no
 * mobile evitam que o rótulo de uma parada encoste na vizinha.
 */
const metricsFor = (width: number) => {
  if (width < 480) return { node: 68, rowSubject: 134, rowRegion: 78, amp: 18 };
  if (width < 768) return { node: 78, rowSubject: 142, rowRegion: 84, amp: 24 };
  return { node: 88, rowSubject: 150, rowRegion: 88, amp: 30 };
};

/**
 * Serpentina: centro, direita, centro, esquerda... O período de 4 paradas faz
 * a direção inverter a cada extremo, que é o que produz curva de verdade.
 * Períodos mais longos deixam os pontos quase colineares e a trilha vira uma
 * diagonal arrastada.
 */
const offsetPercent = (ordem: number, amp: number) =>
  50 + amp * Math.sin(ordem * (Math.PI / 2));

/**
 * Catmull-Rom convertido em bézier cúbica: liga os pontos com uma curva
 * contínua em vez de segmentos retos.
 */
const smoothPath = (pts: { x: number; y: number }[]) => {
  if (pts.length < 2) return '';
  const t = 0.28;
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) * t, y: p1.y + (p2.y - p0.y) * t };
    const c2 = { x: p2.x - (p3.x - p1.x) * t, y: p2.y - (p3.y - p1.y) * t };
    d +=
      ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)},` +
      ` ${c2.x.toFixed(1)} ${c2.y.toFixed(1)},` +
      ` ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
};

const RING_R = 45;
const RING_C = 2 * Math.PI * RING_R;

interface JourneyMapProps {
  groups: TrailGroup[];
  onSelect: (subjectId: string) => void;
}

export function JourneyMap({ groups, onSelect }: JourneyMapProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  const entries = useMemo<Entry[]>(() => {
    const list: Entry[] = [];
    let ordem = 0;
    groups.forEach((group) => {
      list.push({
        kind: 'region',
        key: `region-${group.categoria}`,
        label: group.categoria,
        count: group.subjects.length,
      });
      group.subjects.forEach((subject) => {
        list.push({
          kind: 'subject',
          key: subject.id,
          subject,
          ordem: ordem++,
        });
      });
    });
    return list;
  }, [groups]);

  // Posição atual = primeira parada ainda não concluída. É o mesmo ponto onde
  // a trilha para de estar acesa, para o halo e a luz contarem a mesma história.
  const currentIndex = useMemo(() => {
    const subjects = entries.filter((e) => e.kind === 'subject');
    const idx = subjects.findIndex((e) => e.subject.percent < 100);
    return idx === -1 ? subjects.length - 1 : idx;
  }, [entries]);

  const layout = useMemo(() => {
    const m = metricsFor(width || 1000);
    let y = 0;
    const placed = entries.map((entry) => {
      const rowH = entry.kind === 'region' ? m.rowRegion : m.rowSubject;
      const item = {
        entry,
        top: y,
        leftPct:
          entry.kind === 'region' ? 50 : offsetPercent(entry.ordem, m.amp),
      };
      y += rowH;
      return item;
    });

    // Pontos da trilha = centro de cada nó, no mesmo espaço em px do SVG.
    const points = placed
      .filter((p) => p.entry.kind === 'subject')
      .map((p) => ({
        x: (p.leftPct / 100) * width,
        y: p.top + m.node / 2,
      }));

    return {
      metrics: m,
      placed,
      height: y,
      basePath: smoothPath(points),
      // Acende a trilha até onde o jogador chegou.
      donePath:
        currentIndex > 0 ? smoothPath(points.slice(0, currentIndex + 1)) : '',
    };
  }, [entries, width, currentIndex]);

  return (
    <S.MapWrapper ref={wrapperRef} style={{ height: layout.height }}>
      {width > 0 && (
        <S.Connector
          width={width}
          height={layout.height}
          viewBox={`0 0 ${width} ${layout.height}`}
          aria-hidden
        >
          <defs>
            <linearGradient id="gradiente-trilha" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.color.primary} />
              <stop offset="100%" stopColor={theme.color.cyan} />
            </linearGradient>
          </defs>
          <path className="trilha-base" d={layout.basePath} />
          {layout.donePath && (
            <path className="trilha-feita" d={layout.donePath} />
          )}
        </S.Connector>
      )}

      {layout.placed.map(({ entry, top, leftPct }) => {
        if (entry.kind === 'region') {
          return (
            <S.EntrySlot key={entry.key} style={{ top, left: `${leftPct}%` }}>
              <S.EntryInner
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={spring}
              >
                <S.RegionBanner>
                  <span className="traco" />
                  <span className="pilula">
                    {entry.label}
                    <span className="contagem">{entry.count}</span>
                  </span>
                  <span className="traco" />
                </S.RegionBanner>
              </S.EntryInner>
            </S.EntrySlot>
          );
        }

        const { subject } = entry;
        const done = subject.percent >= 100;
        const isCurrent = entry.ordem === currentIndex;

        return (
          <S.EntrySlot key={entry.key} style={{ top, left: `${leftPct}%` }}>
            <S.EntryInner
              initial={{ opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={spring}
            >
              <S.NodeButton
                $size={layout.metrics.node}
                $accent={subject.accent}
                $done={done}
                onClick={() => onSelect(subject.id)}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.94 }}
                transition={spring}
                aria-label={`${subject.nome} — ${subject.percent}% concluído`}
              >
                <S.Ring viewBox="0 0 100 100">
                  <defs>
                    <linearGradient
                      id={`anel-${subject.id}`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={subject.accent} />
                      <stop offset="100%" stopColor={theme.color.cyan} />
                    </linearGradient>
                  </defs>
                  <circle className="trilho" cx="50" cy="50" r={RING_R} />
                  <circle
                    className="progresso"
                    cx="50"
                    cy="50"
                    r={RING_R}
                    stroke={
                      done ? theme.color.gold : `url(#anel-${subject.id})`
                    }
                    strokeDasharray={RING_C}
                    strokeDashoffset={RING_C * (1 - subject.percent / 100)}
                    style={{
                      transition:
                        'stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  />
                </S.Ring>

                {isCurrent && <S.Halo $accent={subject.accent} />}

                <span className="icone-wrap">{subject.icon}</span>

                {done && (
                  <S.DoneBadge
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ ...spring, delay: 0.25 }}
                  >
                    <CheckCircle size={20} weight="fill" />
                  </S.DoneBadge>
                )}
              </S.NodeButton>

              <S.NodeLabel $current={isCurrent}>
                <div className="nome">{subject.nome}</div>
                <div className="meta">
                  {subject.completedLevels}/{subject.totalLevels} níveis
                </div>
                {isCurrent && <span className="aqui">Você está aqui</span>}
              </S.NodeLabel>
            </S.EntryInner>
          </S.EntrySlot>
        );
      })}
    </S.MapWrapper>
  );
}
