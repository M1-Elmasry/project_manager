import { Hono } from 'hono';
import AuthController from '../controllers/authControllers';
import { verifyToken } from '../middlewares/authMiddelwares';

const app = new Hono();

app.post('/register', AuthController.createNewUser);
app.post('/login', AuthController.generateToken);
app.get('/me', verifyToken, AuthController.getMe);

export default app;
