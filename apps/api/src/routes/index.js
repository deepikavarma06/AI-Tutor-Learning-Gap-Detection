import { Router } from "express";
import aiRoutes from "./ai.js";
import quizRoutes from "./quiz.js";

const router = Router();

export default () => {

  router.use("/ai", aiRoutes);
  router.use("/quiz", quizRoutes);

  return router;
};