import { Hono } from "hono";
import AuthController from "../controllers/authControllers";


const app = new Hono();

app.post('/register', AuthController.createNewUser);

export default app;
