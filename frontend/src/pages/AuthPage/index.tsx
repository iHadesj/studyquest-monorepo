import React, { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
// A correção está aqui: Adicionado 'getDoc'
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { z } from 'zod';
import { auth, db } from '../../config/firebase';
import { Brain, Eye, EyeSlash } from 'phosphor-react';
import { Subtitle, Title } from '../../style/globalStyle';
import {
  AuthBox,
  AuthContainer,
  Button,
  ErrorText,
  Form,
  IconContainer,
  Input,
  InputWrapper,
  PasswordToggleButton,
  SuccessText,
  ToggleText,
} from './style';

interface UserProfile {
  uid: string;
  email: string | null;
  createdAt: any;
  username: string | null;
  avatarSeed: string | null;
  xp: number;
  progress: object;
}
const getRandomTag = (min = 1000, max = 9999) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const authSchema = z.object({
  email: z.string().email({ message: 'Isso aí não parece um e-mail válido.' }),
  password: z
    .string()
    .min(6, { message: 'A senha precisa ter no mínimo 6 caracteres.' }),
});

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
    setMessage({ type: null, text: null });
    setEmail('');
    setPassword('');
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: null, text: null });

    try {
      authSchema.parse({ email, password });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setMessage({ type: 'error', text: err.issues[0].message });
        return;
      }
    }
    try {
      if (isLogin) {
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
        } else {
          throw new Error('Perfil não encontrado no banco de dados.');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        const tempUsername = user.email!.split('@')[0];
        const userTag = getRandomTag();
        const fullTag = `${tempUsername}#${userTag}`;

        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          createdAt: new Date(),
          username: null,
          avatarSeed: null,
          xp: 0,
          progress: {},
          userTag: userTag,
          fullTag: fullTag,
          friends: [],
          friendRequestsSent: [],
          friendRequestsReceived: [],
        });

        setIsLogin(true);
        setMessage({
          type: 'success',
          text: 'Conta criada! Agora pode fazer o login.',
        });
      }
    } catch (err: any) {
      let errorMessage = 'Ocorreu um erro inesperado. Tente novamente.';
      if (err.code) {
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
