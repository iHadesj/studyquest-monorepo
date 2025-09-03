import { Router } from "express";
import { createUserController } from "../controllers/UserController";

const routes = Router();

// Rota de teste
routes.get("/", (req, res) => {
  res.json({ message: "API do StudyQuest tá voando!" });
});

// Rota pra criar um usuário novo
// Quando o front mandar um POST pra '/users', a gente chama o controller
routes.post("/users", createUserController);

export default routes;
