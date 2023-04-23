import {Router} from "express";
import { signin, signup } from "../controllers/authController.js";
import { signInSchema, signUpSchema } from "../schemas/auth.schema.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
const authRouter = Router();

authRouter.post('/', validateSchema(signInSchema), signin)

authRouter.post('/cadastro', validateSchema(signUpSchema), signup)

export default authRouter;