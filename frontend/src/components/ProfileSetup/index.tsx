import { useState } from 'react';
import styled from 'styled-components';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { Title } from '../../style/globalStyle';

// --- COMPONENTES ESTILIZADOS (permanecem os mesmos) ---
const SetupContainer = styled.div`
  display: flex;
  background-color: #36393f;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
`;

const SetupBox = styled.div`
  background-color: #2f3136;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #40444b;
  width: 100%;
  max-width: 500px;
  text-align: center;
`;

const UsernameInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  background-color: #202225;
  border: 1px solid #40444b;
  border-radius: 4px;
  color: #dcddde;
  font-family: 'Fira Code', monospace;
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 1.5rem;
  &:focus {
    outline: none;
    border-color: #5865f2;
  }
`;

//teste deploy vercel

const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const AvatarOption = styled.button<{ isSelected: boolean }>`
  background-color: #36393f;
  border: 2px solid ${(props) => (props.isSelected ? '#5865f2' : '#40444b')};
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  transform: ${(props) => (props.isSelected ? 'scale(1.1)' : 'scale(1)')};

  &:hover {
    border-color: #5865f2;
  }

  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

const SaveButton = styled.button`
  background-color: #43b581;
  color: #ffffff;
  font-family: 'Fira Code', monospace;
  font-weight: bold;
  padding: 0.75rem 3rem;
  border-radius: 4px;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  &:disabled {
    background-color: #40444b;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background-color: #3aa570;
  }
`;

const avatarSeeds = [
  'Max',
  'Bella',
  'Charlie',
  'Lucy',
  'Cooper',
  'Daisy',
  'Milo',
  'Sadie',
  'Rocky',
  'Zoe',
  'Bear',
  'Ruby',
  'Leo',
  'Cleo',
  'Oscar',
  'Penny',
];

// --- COMPONENTE PRINCIPAL ---
export const ProfileSetup = () => {
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatarSeeds[0]);

  const handleSave = async () => {
    const user = auth.currentUser;

    if (user && username.trim()) {
      const userDocRef = doc(db, 'users', user.uid);

      try {
        await updateDoc(userDocRef, {
          username: username.trim(),
          avatarSeed: selectedAvatar,
        });
      } catch (error) {
        console.error('Erro ao guardar o perfil:', error);
      }
    }
  };

  return (
    <SetupContainer>
      <SetupBox>
        <Title style={{ border: 'none', padding: 0, fontSize: '2rem' }}>
          Crie o seu Perfil
        </Title>
        <p
          style={{
            color: '#b9bbbe',
            marginTop: '-0.5rem',
            marginBottom: '2rem',
          }}
        >
          Escolha um nome e um avatar para começar a sua jornada.
        </p>

        <label htmlFor="username" style={{ display: 'none' }}>
          Nome de Utilizador
        </label>
        <UsernameInput
          id="username"
          type="text"
          style={{ width: '90%' }}
          placeholder="Digite o seu nome"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={15}
        />

        <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>
          Escolha o seu Avatar:
        </h3>
        <AvatarGrid>
          {avatarSeeds.map((seed) => (
            <AvatarOption
              key={seed}
              isSelected={selectedAvatar === seed}
              onClick={() => setSelectedAvatar(seed)}
              title={seed}
            >
              <img
                src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${seed}`}
                alt={`Avatar ${seed}`}
              />
            </AvatarOption>
          ))}
        </AvatarGrid>

        <SaveButton onClick={handleSave} disabled={!username.trim()}>
          Salvar e Começar
        </SaveButton>
      </SetupBox>
    </SetupContainer>
  );
};
