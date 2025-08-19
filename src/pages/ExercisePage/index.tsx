import { useState } from 'react';
import styled from 'styled-components';
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
  max-height: 200px;
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

type WrongAnswer = Exercicio & { userAnswer?: string };

export const ExercisePage = ({
  subject,
  level,
  onBack,
}: {
  subject: Materia;
  level: Nivel;
  onBack: () => void;
}) => {
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

  const { addXP, completeLevel, progress } = useProgressStore();
  const currentProgress = progress[subject.id]?.[level.id];
  const currentAttempts = currentProgress?.tentativas || 0;

  const handleAnswerChange = (exerciseId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [exerciseId]: answer }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    const wrongAnswersList: WrongAnswer[] = [];

    level.exercicios.forEach((ex) => {
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

    const totalQuestions = level.exercicios.length;
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
    addXP(totalXp);
    completeLevel(subject.id, level.id, correctCount, estrelas, newAttempts);
    setShowResults(true);
  };

  const allAnswered = Object.keys(answers).length === level.exercicios.length;

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
            Você acertou {results.acertos} de {level.exercicios.length}{' '}
            perguntas.
          </Subtitle>

          <XPResultsContainer>
            <XPDisplayModal style={{ margin: 0 }}>
              <StarIcon />
              <span>+{results.xpGanhos} XP Ganhos</span>
            </XPDisplayModal>
            {results.bonusXP > 0 && (
              <BonusXPText>+{results.bonusXP} XP Bônus!</BonusXPText>
            )}
          </XPResultsContainer>

          {results.wrongAnswers.length > 0 && (
            <WrongAnswersContainer>
              <h4 style={{ marginTop: 0 }}>
                {results.passou
                  ? 'Questões para revisar:'
                  : 'Respostas Erradas:'}
              </h4>
              {results.wrongAnswers.map((q) => (
                <WrongAnswerItem key={q.id}>
                  <p>
                    <strong>Pergunta:</strong> {q.pergunta}
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

          <ContinueButton onClick={onBack}>Continuar Jornada</ContinueButton>
        </ModalContent>
      </ModalOverlay>
    );
  }

  return (
    <LessonWrapper>
      <BackButton onClick={onBack}>&larr; Voltar</BackButton>
      <Title
        as="h2"
        style={{
          fontSize: '1.75rem',
          border: 'none',
          padding: 0,
          textAlign: 'left',
          marginBottom: '1.5rem',
        }}
      >
        Exercícios: {level.nome} ({3 - currentAttempts} tentativas restantes)
      </Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {level.exercicios.map((ex, index) => (
          <ExerciseBox key={ex.id}>
            <QuestionText>
              {index + 1}. {ex.pergunta}
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
