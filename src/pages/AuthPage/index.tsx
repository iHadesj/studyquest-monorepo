import React, { useState } from 'react';
import styled from 'styled-components';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Title } from '../../style/globalStyle';
import { auth, db } from '../../config/firebase';
import { Book, Eye, EyeSlash } from 'phosphor-react';

// --- COMPONENTES ESTILIZADOS ---
const AuthContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #36393f;
  /* Adiciona um fundo com gradiente para o efeito de vidro funcionar */
  background-image: linear-gradient(to top right, #4e54c8, #8f94fb);
`;

const AuthBox = styled.div`
  /* Efeito de Vidro (Glassmorphism) */
  background: rgba(47, 49, 54, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  padding: 2.5rem;
  border-radius: 16px;
  margin: 1rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
`;

const IconContainer = styled.div`
  background-color: #5865f2;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
  box-shadow: 0 4px 15px rgba(88, 101, 242, 0.4);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Aumenta o espaçamento */
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  padding-right: 3rem; /* Espaço para o ícone do olho */
  background-color: #202225;
  border: 1px solid #40444b;
  border-radius: 4px;
  color: #dcddde;
  font-family: 'Fira Code', monospace;
  font-size: 1rem;
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: #5865f2;
  }
`;

const PasswordToggleButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #72767d;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  &:hover {
    color: #ffffff;
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
  transition: all 0.2s;
  &:hover {
    background-color: #4f5bd5;
    transform: scale(1.02);
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
  const [showPassword, setShowPassword] = useState(false); // Estado para visualizar a senha
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
        <IconContainer>
          <Book size={32} color="white" weight="bold" />
        </IconContainer>
        <Title style={{ border: 'none', padding: 0, fontSize: '2rem' }}>
          {isLogin ? 'Bem-vindo de Volta!' : 'Crie a sua Conta'}
        </Title>
        <Form onSubmit={handleSubmit}>
          <InputWrapper>
            <Input
              type="email"
              style={{ width: '80%' }}
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              type={showPassword ? 'text' : 'password'} // Altera o tipo do input
              placeholder="Palavra-passe"
              style={{ width: '80%' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordToggleButton
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
            </PasswordToggleButton>
          </InputWrapper>
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
