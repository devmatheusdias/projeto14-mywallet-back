import {Router} from "express";
import { home, novaTransacao, signin, signup } from "../controllers/authController.js";
import { signInSchema, signUpSchema } from "../schemas/auth.schema.js";
import { newTransactionSchema } from "../schemas/newTransaction.schema.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
const authRouter = Router();

authRouter.post('/', validateSchema(signInSchema), signin)

authRouter.post('/cadastro', validateSchema(signUpSchema), signup)

authRouter.get('/home', home)

authRouter.post('/nova-transacao/:tipo', validateSchema(newTransactionSchema), novaTransacao)

export default authRouter;