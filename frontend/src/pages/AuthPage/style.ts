import styled, { keyframes } from 'styled-components';

// --- 1. ESTILOS (Toda a parte de Styled Components) ---
export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const AuthContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #36393f;
  background-image: linear-gradient(to top right, #090b3c, #8f94fb);
`;

export const AuthBox = styled.div`
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

export const IconContainer = styled.div`
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

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: ${fadeIn} 0.5s ease-in-out;
`;

export const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const Input = styled.input`
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

export const PasswordToggleButton = styled.button`
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

export const Button = styled.button`
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

export const ToggleText = styled.p`
  color: #b9bbbe;
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 1.5rem;
  &:hover {
    text-decoration: underline;
  }
`;

export const MessageText = styled.p`
  font-size: 0.875rem;
  margin-top: 1rem;
  min-height: 1.2em;
`;

export const ErrorText = styled(MessageText)`
  color: #ed4245;
`;

export const SuccessText = styled(MessageText)`
  color: #43b581;
`;
