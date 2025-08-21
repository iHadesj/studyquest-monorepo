import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { z } from 'zod';
import { auth, db } from '../../config/firebase'; // Ajuste o caminho se necessário
import { Brain, Eye, EyeSlash } from 'phosphor-react';
import { Subtitle, Title } from '../../style/globalStyle'; // Ajuste o caminho se necessário

// --- 1. ESTILOS (Toda a parte de Styled Components) ---
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const AuthContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #36393f;
  background-image: linear-gradient(to top right, #090b3c, #8f94fb);
`;

const AuthBox = styled.div`
  background: rgb(47 49 54 / 28%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 2.5rem;
  border-radius: 2rem;
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
  gap: 1.5rem;
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  padding-right: 3rem;
  box-sizing: border-box;
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
    color: #1a27de;
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
  margin-top: 1.5rem;
  &:hover {
    text-decoration: underline;
  }
`;

const MessageText = styled.p`
  font-size: 0.875rem;
  margin-top: 1rem;
  min-height: 1.2em; /* Garante que o layout não pule quando a mensagem aparece */
`;

const ErrorText = styled(MessageText)`
  color: #ed4245;
`;

const SuccessText = styled(MessageText)`
  color: #43b581;
`;

// --- 2. TIPOS E VALIDAÇÃO (Regras do jogo) ---

// O "RG" do nosso usuário
interface UserProfile {
  uid: string;
  email: string | null;
  createdAt: any; // Firestore Timestamp pode ser complexo, simplificando por agora
  username: string | null;
  avatarSeed: string | null;
  xp: number;
  progress: object;
}

// O "Segurança" Zod
const authSchema = z.object({
  email: z.string().email({ message: 'Isso aí não parece um e-mail válido.' }),
  password: z
    .string()
    .min(6, { message: 'A senha precisa ter no mínimo 6 caracteres.' }),
});

// --- 3. O COMPONENTE (O cérebro da operação) ---

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: 'error' | 'success' | null;
    text: string | null;
  }>({ type: null, text: null });

  useEffect(() => {
    // Limpa a mensagem e os campos ao trocar entre Login e Registro
    setMessage({ type: null, text: null });
    setEmail('');
    setPassword('');
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: null, text: null });

    // 1. Validação Zod na entrada
    try {
      authSchema.parse({ email, password });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setMessage({ type: 'error', text: err.issues[0].message });
        return;
      }
    }
    // 2. Lógica com Firebase
    try {
      if (isLogin) {
        // Lógica de LOGIN
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          console.log('Login bem-sucedido! Dados do usuário:', userData);
          // Daqui pra frente, você guardaria `userData` num estado global e redirecionaria
        } else {
          throw new Error('Perfil não encontrado no banco de dados.');
        }
      } else {
        // Lógica de REGISTRO
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

        setIsLogin(true);
        setMessage({
          type: 'success',
          text: 'Conta criada! Agora pode fazer o login.',
        });
      }
    } catch (err: any) {
      // 3. Tratamento de erros (Firebase ou outros)
      let errorMessage = 'Ocorreu um erro inesperado. Tente novamente.';
      if (err.code) {
        // Erros do Firebase têm um 'code'
        switch (err.code) {
          case 'auth/invalid-credential':
            errorMessage = 'E-mail ou senha inválidos. Confere aí.';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'Opa! Esse e-mail já tá sendo usado.';
            break;
          default:
            errorMessage = 'Erro de autenticação. Verifique suas credenciais.';
        }
      } else if (err.message) {
        // Erros gerais
        errorMessage = err.message;
      }
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  return (
    <AuthContainer>
      <AuthBox>
        <IconContainer>
          <Brain size={42} weight="fill" color="white" />
        </IconContainer>
        <Title style={{ border: 'none', padding: 0, fontSize: '2rem' }}>
          {isLogin ? 'Bem-vindo de Volta!' : 'Crie a sua Conta'}
        </Title>
        <Subtitle style={{ marginBottom: '1.5rem' }}>
          {isLogin
            ? 'Insira suas credenciais para continuar.'
            : 'Preencha os campos para criar sua conta.'}
        </Subtitle>

        <Form key={isLogin ? 'login' : 'register'} onSubmit={handleSubmit}>
          <InputWrapper>
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Palavra-passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        {message.text &&
          (message.type === 'error' ? (
            <ErrorText>{message.text}</ErrorText>
          ) : (
            <SuccessText>{message.text}</SuccessText>
          ))}

        <ToggleText onClick={() => setIsLogin(!isLogin)}>
          {isLogin
            ? 'Não tem uma conta? Registe-se'
            : 'Já tem uma conta? Entre'}
        </ToggleText>
      </AuthBox>
    </AuthContainer>
  );
};
