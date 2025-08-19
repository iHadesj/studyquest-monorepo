import React, { useState } from 'react';
import styled from 'styled-components';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Title } from '../../style/globalStyle';
import { auth, db } from '../../config/firebase';

// --- COMPONENTES ESTILIZADOS ---
const AuthContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #36393f;
`;

const AuthBox = styled.div`
  background-color: #2f3136;
  padding: 2rem;
  border-radius: 8px;
  margin: 10px;
  border: 1px solid #40444b;
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background-color: #202225;
  border: 1px solid #40444b;
  border-radius: 4px;
  color: #dcddde;
  font-family: 'Fira Code', monospace;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #5865f2;
  }
`;

const Button = styled.button`
  background-color: #5865f2;
  color: #ffffff;
  font-family: 'Fira Code', monospace;
  font-weight: bold;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #4f5bd5;
  }
`;

const ToggleText = styled.p`
  color: #b9bbbe;
  cursor: pointer;
  font-size: 0.875rem;
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorText = styled.p`
  color: #ed4245;
  font-size: 0.875rem;
  margin-top: 1rem;
`;

// --- COMPONENTE PRINCIPAL ---
export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          createdAt: new Date(),
          username: null,
          avatarSeed: null,
          xp: 0,
          progress: {},
        });
      }
    } catch (err: any) {
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        setError('E-mail ou palavra-passe inválidos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está a ser utilizado.');
      } else if (err.code === 'auth/weak-password') {
        setError('A palavra-passe deve ter pelo menos 6 caracteres.');
      } else {
        setError('Ocorreu um erro. Tente novamente.');
      }
    }
  };

  return (
    <AuthContainer>
      <AuthBox>
        <Title style={{ border: 'none', padding: 0, fontSize: '2rem' }}>
          {isLogin ? 'Bem-vindo de Volta!' : 'Crie sua Conta'}
        </Title>
        <Form onSubmit={handleSubmit}>
          <Input
            style={{ width: '93%' }}
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            style={{ width: '93%' }}
            type="password"
            placeholder="Palavra-passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit">{isLogin ? 'Entrar' : 'Registar'}</Button>
        </Form>
        {error && <ErrorText>{error}</ErrorText>}
        <ToggleText onClick={() => setIsLogin(!isLogin)}>
          {isLogin
            ? 'Não tem uma conta? Registe-se'
            : 'Já tem uma conta? Entre'}
        </ToggleText>
      </AuthBox>
    </AuthContainer>
  );
};
