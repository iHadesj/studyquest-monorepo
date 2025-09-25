import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import {
  BackButton,
  ContinueButton,
  ExerciseBox,
  LessonWrapper,
  ModalContent,
  ModalOverlay,
  OptionLabel,
  QuestionText,
  RadioInput,
  SubmitButton,
  Subtitle,
  TextInput,
  Title,
  TitleExercise,
  XPDisplayModal,
} from '../../style/globalStyle';
import { useProgressStore } from '../../hooks/useProgressStore';
import { CheckCircleIcon, StarIcon, XCircleIcon } from '../../style/icons';
import type { Exercicio, Materia, Nivel } from '../../interfaces';
import { Star } from 'phosphor-react';

// --- COMPONENTES ESTILIZADOS ADICIONAIS ---
const StarsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const XPResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const BonusXPText = styled.p`
  font-size: 1rem;
  font-weight: bold;
  color: #43b581;
  margin: 0;
`;

const WrongAnswersContainer = styled.div`
  margin-top: 1.5rem;
  text-align: left;
  max-height: 150px;
  overflow-y: auto;
  background-color: #202225;
  padding: 1rem;
  border-radius: 4px;
`;

const WrongAnswerItem = styled.div`
  & + & {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #40444b;
  }
  p {
    margin: 0.25rem 0;
  }
`;

const EncouragementText = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #202225;
  border-radius: 4px;
  color: #b9bbbe;
`;

type WrongAnswer = Exercicio & { userAnswer?: string };

const parseText = (text: string) => {
  if (!text) return null;

  const regex = /(\*[^*]+\*)|(_[^_]+_)|(~[^~]+~)|(`[^`]+`)|(\$[^$]+\$)/g;

  const parts = text.split(regex).filter(Boolean);

  return parts.map((part, idx) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <strong key={idx}>{part.slice(1, -1)}</strong>;
    }
    if (part.startsWith('_') && part.endsWith('_')) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('~') && part.endsWith('~')) {
      return <del key={idx}>{part.slice(1, -1)}</del>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          style={{
            backgroundColor: '#2f3136',
            color: '#f8f8f2',
            padding: '0 4px',
            borderRadius: '4px',
            fontFamily: 'monospace',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('$') && part.endsWith('$')) {
      return (
        <span
          key={idx}
          style={{
            fontFamily: 'monospace',
            backgroundColor: '#1e1e1e',
            color: '#ffd700',
            padding: '0 4px',
            borderRadius: '3px',
          }}
        >
          {part.slice(1, -1)}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
};

export const ExercisePage = ({
  subject,
  level,
  onBack,
}: {
  subject: Materia;
  level: Nivel;
  onBack: () => void;
}) => {
  const [shuffledExercises, setShuffledExercises] = useState<Exercicio[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({
    acertos: 0,
    xpGanhos: 0,
    bonusXP: 0,
    estrelas: 0,
    passou: false,
    wrongAnswers: [] as WrongAnswer[],
  });

  const { progress } = useProgressStore();
  const currentProgress = progress[subject.id]?.[level.id];
  const currentAttempts = currentProgress?.tentativas || 0;

  useEffect(() => {
    if (level.exercicios.length > 10) {
      const shuffled = [...level.exercicios].sort(() => 0.5 - Math.random());
      setShuffledExercises(shuffled.slice(0, 10));
    } else {
      setShuffledExercises([...level.exercicios]);
    }
  }, [level.exercicios]);

  const handleAnswerChange = (exerciseId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [exerciseId]: answer }));
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return;

    let correctCount = 0;
    const wrongAnswersList: WrongAnswer[] = [];

    shuffledExercises.forEach((ex) => {
      const userAnswer = answers[ex.id]?.trim().toLowerCase();
      const correctAnswer = ex.respostaCorreta.trim().toLowerCase();
      if (userAnswer === correctAnswer) {
        correctCount++;
      } else {
        wrongAnswersList.push({
          ...ex,
          userAnswer: answers[ex.id] || 'Não respondido',
        });
      }
    });

    const totalQuestions = shuffledExercises.length;
    const percentage = (correctCount / totalQuestions) * 100;
    let estrelas = 0;
    let bonusXP = 0;

    if (percentage === 100) {
      estrelas = 3;
      bonusXP = 50;
    } else if (percentage >= 60) {
      estrelas = 2;
      bonusXP = 25;
    } else if (correctCount > 0) {
      estrelas = 1;
      bonusXP = 10;
    }

    const xpEarned = correctCount * level.xpPorAcerto;
    const totalXp = xpEarned + bonusXP;
    const newAttempts = currentAttempts + 1;

    const passouNosAcertos =
      level.minAcertosParaDesbloquearProximo !== null &&
      correctCount >= level.minAcertosParaDesbloquearProximo;
    const pontuacaoPerfeita = correctCount === totalQuestions;
    const passou = passouNosAcertos || pontuacaoPerfeita;

    setResults({
      acertos: correctCount,
      xpGanhos: xpEarned,
      bonusXP,
      estrelas,
      passou,
      wrongAnswers: wrongAnswersList,
    });

    const userDocRef = doc(db, 'users', user.uid);
    const bestStars = Math.max(currentProgress?.estrelas || 0, estrelas);

    try {
      if (passou) {
        await updateDoc(userDocRef, {
          xp: increment(totalXp),
          [`progress.${subject.id}.${level.id}`]: {
            acertos: correctCount,
            concluido: true,
            estrelas: bestStars,
            tentativas: newAttempts,
          },
        });
      } else {
        await updateDoc(userDocRef, {
          [`progress.${subject.id}.${level.id}`]: {
            acertos: correctCount,
            concluido: false,
            estrelas: bestStars,
            tentativas: newAttempts,
          },
        });
      }
    } catch (error) {
      console.error('Erro ao guardar o progresso:', error);
    }

    setShowResults(true);
  };

  const allAnswered = Object.keys(answers).length === shuffledExercises.length;

  if (showResults) {
    return (
      <ModalOverlay>
        <ModalContent>
          {results.passou ? <CheckCircleIcon /> : <XCircleIcon />}
          <Title as="h2" style={{ fontSize: '1.875rem', marginTop: '1rem' }}>
            {results.passou ? 'Nível Concluído!' : 'Tente Novamente!'}
          </Title>

          <StarsContainer>
            {[1, 2, 3].map((i) => (
              <Star
                key={i}
                size={40}
                color={i <= results.estrelas ? '#f1c40f' : '#72767d'}
                weight="fill"
              />
            ))}
          </StarsContainer>

          <Subtitle as="p" style={{ fontSize: '1rem', marginBottom: 0 }}>
            Você acertou {results.acertos} de {shuffledExercises.length}{' '}
            perguntas.
          </Subtitle>

          {results.passou && (
            <XPResultsContainer>
              <XPDisplayModal style={{ margin: 0 }}>
                <StarIcon />
                <span>+{results.xpGanhos} XP Ganhos</span>
              </XPDisplayModal>
              {results.bonusXP > 0 && (
                <BonusXPText>+{results.bonusXP} XP Bônus!</BonusXPText>
              )}
            </XPResultsContainer>
          )}

          {results.passou && results.wrongAnswers.length > 0 && (
            <WrongAnswersContainer>
              <h4 style={{ marginTop: 0 }}>Questões para revisar:</h4>
              {results.wrongAnswers.map((q) => (
                <WrongAnswerItem key={q.id}>
                  <p>
                    <strong>Pergunta:</strong> {parseText(q.pergunta)}
                  </p>
                  <p style={{ color: '#ed4245' }}>
                    <strong>Sua resposta:</strong> {q.userAnswer}
                  </p>
                  <p style={{ color: '#43b581' }}>
                    <strong>Resposta correta:</strong> {q.respostaCorreta}
                  </p>
                </WrongAnswerItem>
              ))}
            </WrongAnswersContainer>
          )}

          {!results.passou && (
            <EncouragementText>
              <p>
                Reveja o material de estudo para encontrar as respostas corretas
                e tente novamente!
              </p>
            </EncouragementText>
          )}

          <ContinueButton onClick={onBack}>Continuar Jornada</ContinueButton>
        </ModalContent>
      </ModalOverlay>
    );
  }

  return (
    <LessonWrapper>
      <BackButton onClick={onBack}>&larr; Voltar</BackButton>
      <TitleExercise
        as="h2"
        style={{
          border: 'none',
          padding: 0,
          textAlign: 'left',
          marginBottom: '1.5rem',
        }}
      >
        Exercícios: {level.nome} ({3 - currentAttempts} tentativas restantes)
      </TitleExercise>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Map over the shuffled exercises instead of the full list */}
        {shuffledExercises.map((ex, index) => (
          <ExerciseBox key={ex.id}>
            <QuestionText>
              {index + 1}. {parseText(ex.pergunta)}
            </QuestionText>
            {ex.tipo === 'multipla_escolha' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {ex.opcoes?.map((option) => (
                  <OptionLabel key={option}>
                    <RadioInput
                      type="radio"
                      name={`ex-${ex.id}`}
                      value={option}
                      onChange={(e) =>
                        handleAnswerChange(ex.id, e.target.value)
                      }
                    />
                    <span>{option}</span>
                  </OptionLabel>
                ))}
              </div>
            )}
            {ex.tipo === 'preenchimento' && (
              <TextInput
                type="text"
                onChange={(e) => handleAnswerChange(ex.id, e.target.value)}
                placeholder="Digite sua resposta aqui"
              />
            )}
          </ExerciseBox>
        ))}
      </div>
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <SubmitButton onClick={handleSubmit} disabled={!allAnswered}>
          Finalizar e Corrigir
        </SubmitButton>
      </div>
    </LessonWrapper>
  );
};
