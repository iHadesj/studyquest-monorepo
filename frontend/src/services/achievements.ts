// src/services/achievements.ts
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import type { Conquista } from '../interfaces';
import { useProgressStore } from '../hooks/useProgressStore';
import toast from 'react-hot-toast';
import { calculateLevelInfo } from '../style/level';

export const TODAS_AS_CONQUISTAS: Conquista[] = [
  {
    id: 'PRIMEIROS_PASSOS',
    nome: 'Primeiros Passos',
    descricao: 'Complete seu primeiro nível de exercícios.',
    raridade: 'bronze',
    icon: '👣',
  },
  {
    id: 'SOCIALIZANDO',
    nome: 'Socializando',
    descricao: 'Adicione seu primeiro amigo.',
    raridade: 'bronze',
    icon: '🤝',
  },
  {
    id: 'AFIANDO_A_MENTE',
    nome: 'Afiando a Mente',
    descricao: 'Jogue uma partida do modo Brainstorm.',
    raridade: 'bronze',
    icon: '⚡',
  },
  {
    id: 'O_DESAFIANTE',
    nome: 'O Desafiante',
    descricao: 'Participe do seu primeiro duelo multiplayer.',
    raridade: 'bronze',
    icon: '⚔️',
  },
  {
    id: 'NOVA_IDENTIDADE',
    nome: 'Nova Identidade',
    descricao: 'Personalize seu perfil pela primeira vez.',
    raridade: 'bronze',
    icon: '🎨',
  },

  {
    id: 'PERFECCIONISTA',
    nome: 'Perfeccionista',
    descricao: 'Consiga uma pontuação perfeita em qualquer nível.',
    raridade: 'prata',
    icon: '🎯',
  },
  {
    id: 'PRIMEIRA_VITORIA',
    nome: 'Primeira Vitória',
    descricao: 'Vença seu primeiro duelo multiplayer.',
    raridade: 'prata',
    icon: '🏆',
  },
  {
    id: 'VITORIA_IMPECAVEL',
    nome: 'Vitória Impecável',
    descricao: 'Vença um duelo sem que seu oponente pontue.',
    raridade: 'prata',
    icon: '✨',
  },
  {
    id: 'COLECIONADOR_DE_AMIGOS',
    nome: 'Colecionador de Amigos',
    descricao: 'Tenha 10 amigos na sua lista.',
    raridade: 'prata',
    icon: '👨‍👩‍👧‍👦',
  },

  {
    id: 'NIVEL_50',
    nome: 'Meio Caminho Andado',
    descricao: 'Alcance o nível 50.',
    raridade: 'ouro',
    icon: '🚀',
  },
  {
    id: 'LENDA_DOS_DUELOS',
    nome: 'Lenda dos Duelos',
    descricao: 'Vença 25 duelos multiplayer.',
    raridade: 'ouro',
    icon: '👑',
  },
  {
    id: 'MARATONISTA_DO_SABER',
    nome: 'Maratonista do Saber',
    descricao: 'Complete 50 níveis no total.',
    raridade: 'ouro',
    icon: '🏃‍♂️',
  },
];

const conquistasMap = new Map(TODAS_AS_CONQUISTAS.map((c) => [c.id, c]));

export async function verificarEdesbloquearConquistas(
  tipoDeAcao:
    | 'CONCLUIU_NIVEL'
    | 'ADICIONOU_AMIGO'
    | 'JOGOU_BRAINSTORM'
    | 'VENCEU_DUELO'
    | 'JOGOU_DUELO'
    | 'EDITOU_PERFIL'
    | 'GANHOU_XP',
  dados?: any
) {
  const user = auth.currentUser;
  if (!user) return;

  const estadoAtual = useProgressStore.getState();
  const conquistasAtuais = estadoAtual.unlockedAchievements;
  const conquistasParaDesbloquear: Conquista[] = [];

  if (tipoDeAcao === 'CONCLUIU_NIVEL') {
    if (!conquistasAtuais.includes('PRIMEIROS_PASSOS')) {
      conquistasParaDesbloquear.push(conquistasMap.get('PRIMEIROS_PASSOS')!);
    }
    if (
      dados.acertos === dados.total &&
      !conquistasAtuais.includes('PERFECCIONISTA')
    ) {
      conquistasParaDesbloquear.push(conquistasMap.get('PERFECCIONISTA')!);
    }
  }

  if (tipoDeAcao === 'ADICIONOU_AMIGO') {
    const totalAmigos = estadoAtual.friends?.length ?? 0;
    if (totalAmigos >= 1 && !conquistasAtuais.includes('SOCIALIZANDO')) {
      conquistasParaDesbloquear.push(conquistasMap.get('SOCIALIZANDO')!);
    }
    if (
      totalAmigos >= 10 &&
      !conquistasAtuais.includes('COLECIONADOR_DE_AMIGOS')
    ) {
      conquistasParaDesbloquear.push(
        conquistasMap.get('COLECIONADOR_DE_AMIGOS')!
      );
    }
  }

  if (tipoDeAcao === 'JOGOU_BRAINSTORM') {
    if (!conquistasAtuais.includes('AFIANDO_A_MENTE')) {
      conquistasParaDesbloquear.push(conquistasMap.get('AFIANDO_A_MENTE')!);
    }
  }

  if (tipoDeAcao === 'JOGOU_DUELO') {
    if (!conquistasAtuais.includes('O_DESAFIANTE')) {
      conquistasParaDesbloquear.push(conquistasMap.get('O_DESAFIANTE')!);
    }
  }

  if (tipoDeAcao === 'VENCEU_DUELO') {
    if (!conquistasAtuais.includes('PRIMEIRA_VITORIA')) {
      conquistasParaDesbloquear.push(conquistasMap.get('PRIMEIRA_VITORIA')!);
    }
    if (
      dados.pontosOponente === 0 &&
      !conquistasAtuais.includes('VITORIA_IMPECAVEL')
    ) {
      conquistasParaDesbloquear.push(conquistasMap.get('VITORIA_IMPECAVEL')!);
    }
  }

  if (tipoDeAcao === 'EDITOU_PERFIL') {
    if (!conquistasAtuais.includes('NOVA_IDENTIDADE')) {
      conquistasParaDesbloquear.push(conquistasMap.get('NOVA_IDENTIDADE')!);
    }
  }

  if (tipoDeAcao === 'GANHOU_XP') {
    const { level } = calculateLevelInfo(dados.novoXpTotal);
    if (level >= 50 && !conquistasAtuais.includes('NIVEL_50')) {
      conquistasParaDesbloquear.push(conquistasMap.get('NIVEL_50')!);
    }
  }

  if (conquistasParaDesbloquear.length === 0) {
    return;
  }

  const userDocRef = doc(db, 'users', user.uid);
  const idsParaAtualizar = conquistasParaDesbloquear.map((c) => c.id);

  try {
    await updateDoc(userDocRef, {
      unlockedAchievements: arrayUnion(...idsParaAtualizar),
    });

    conquistasParaDesbloquear.forEach((conquista) => {
      console.log(`🎉 Desbloqueou: ${conquista.nome}`);
      toast.success(`Conquista Desbloqueada: ${conquista.nome}!`, {
        icon: conquista.icon,
      });
    });

    useProgressStore.getState().hydrateFromFirestore({
      ...estadoAtual,
      unlockedAchievements: [...conquistasAtuais, ...idsParaAtualizar],
    });
  } catch (error) {
    console.error('Erro ao salvar conquista:', error);
  }
}
