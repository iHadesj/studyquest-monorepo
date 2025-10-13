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
  /* NOVO: Fundo principal mais escuro, quase preto com um toque de azul/roxo */
  background-color: #171c26; /* Cor bem escura da ref */
`;

export const AuthBox = styled.div`
  /* NOVO: Fundo do card de login, mais claro que o container, mas ainda escuro */
  background-color: #202736; /* Cor do card da ref */
  padding: 3.5rem 3rem; /* Aumentar o padding pra ficar mais espaçoso */
  border-radius: 8px;
  margin: 1rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
  /* NOVO: Sombra mais sutil e discreta, para dar leve elevação */
  box-shadow: 0px 8px 30px rgba(0, 0, 0, 0.4);
  /* REMOVIDO: Borda, a ref não tem */
`;

// O Logo deve vir de um SVG ou IMG, não de um IconContainer com cor sólida
export const LogoContainer = styled.div`
  margin-bottom: 2.5rem; /* Espaço maior entre o logo e o formulário */
  /* Se você tiver o SVG do logo, coloque ele aqui diretamente */
  /* Por exemplo: <img src="/path/to/gratify-logo.svg" alt="Gratify Logo" /> */
  /* Placeholder para o logo se não tiver imagem: */
  font-family: 'Montserrat', sans-serif; /* Usar uma fonte mais clean */
  font-size: 2.5rem;
  font-weight: 700;
  color: #e0e6ed; /* Cor clara para o texto do logo */
  letter-spacing: -0.05em;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem; /* Espaçamento entre os campos, um pouco mais apertado */
  animation: ${fadeIn} 0.5s ease-in-out;
`;

export const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const InputLabel = styled.label`
  position: absolute;
  top: -10px; /* Posição acima do input */
  left: 10px;
  background: #202736; /* Cor do fundo do card para cobrir a linha do input */
  padding: 0 5px;
  color: #aeb8c9; /* Cor do texto do label */
  font-size: 0.75rem; /* Tamanho da fonte menor */
  pointer-events: none;
  z-index: 1;
`;

export const Input = styled.input`
  width: 100%;
  padding: 1rem 0.75rem; /* Padding maior pra alinhar com a ref */
  box-sizing: border-box;
  background-color: #2a3243; /* Cor do background do input, mais escuro */
  border: 1px solid #3c4456; /* Borda sutil nos inputs */
  border-radius: 4px;
  color: #e0e6ed; /* Cor do texto no input */
  font-family: 'Inter', sans-serif; /* Font mais clean */
  font-size: 0.95rem; /* Tamanho da fonte dos inputs */
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #5865f2; /* Sua cor primária ao focar */
    box-shadow: 0 0 0 2px rgba(88, 101, 242, 0.3); /* Um leve glow ao focar */
  }

  &::placeholder {
    color: #5c677f; /* Cor do placeholder mais discreta */
  }
`;

export const PasswordToggleButton = styled.button`
  position: absolute;
  right: 15px; /* Ajuste a posição para não cortar o ícone */
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #aeb8c9; /* Cor mais clara para o ícone */
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  z-index: 2; /* Para garantir que fique acima do label */
  &:hover {
    color: #5865f2;
  }
`;

export const Button = styled.button`
  background-color: #5865f2; /* Sua cor primária */
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-weight: 600; /* Um pouco mais encorpado */
  padding: 1rem; /* Padding maior pro botão */
  border-radius: 4px;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s, box-shadow 0.2s;

  &:hover {
    background-color: #4f5bd5; /* Um tom ligeiramente mais escuro no hover */
    transform: translateY(-2px); /* Leve levantada */
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
`;

export const ToggleText = styled.p`
  color: #aeb8c9; /* Cor mais clara para links e textos de ação */
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 1.5rem;
  /* NOVO: Link 'forgot password' */
  text-decoration: none; /* Remover underline padrão */
  &:hover {
    color: #e0e6ed; /* Fica mais claro no hover */
    text-decoration: underline; /* Adicionar underline no hover */
  }
`;

export const MessageText = styled.p`
  font-size: 0.875rem;
  margin-top: 1rem;
  min-height: 1.2em;
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

export const ErrorText = styled(MessageText)`
  color: #e65252; /* Um vermelho de erro mais alinhado ao tema escuro */
`;

export const SuccessText = styled(MessageText)`
  color: #43b581;
`;
