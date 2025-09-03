// src/controllers/UserController.ts
import { Request, Response } from "express";

// No futuro, a gente vai importar nosso banco de dados aqui.
// Por enquanto, vamos só simular.

// Função pra gerar um número aleatório entre min e max
const getRandomTag = (min = 1000, max = 9999) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const createUserController = async (req: Request, res: Response) => {
  // A gente vai pegar o email, senha e username do corpo da requisição
  const { email, password, username } = req.body;

  // --- LÓGICA IMPORTANTE AQUI ---
  // 1. Validar os dados com o Zod (a gente instala depois)
  // 2. Criar o usuário no Firebase Authentication

  // 3. Gerar a tag e garantir que ela é única
  let userTag;
  let isTagUnique = false;

  while (!isTagUnique) {
    userTag = getRandomTag();
    const fullTag = `${username}#${userTag}`;

    // 4. AQUI a gente checaria no banco de dados (Firestore) se 'fullTag' já existe.
    // Como a gente não tem o banco aqui ainda, vamos fingir que é sempre única.
    console.log(
      `Verificando se a tag ${fullTag} existe... (por enquanto, sempre tá livre)`
    );
    isTagUnique = true; // Simulação
  }

  // 5. Salvar o usuário no Firestore com o username e a userTag
  const newUser = {
    email,
    username,
    userTag,
    fullTag: `${username}#${userTag}`,
    xp: 0,
    // ...outros dados
  };

  console.log("Novo usuário a ser salvo no banco:", newUser);

  // 6. Retornar sucesso
  return res.status(201).json({
    message: "Usuário criado com sucesso!",
    user: newUser,
  });
};
