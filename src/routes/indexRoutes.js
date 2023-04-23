import {Router} from 'express';
import authRouter from './public.routes.js';


const routes = Router();
routes.use(authRouter)

export default routes;