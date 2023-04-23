import express from 'express'
import cors from 'cors'
import routes from './routes/indexRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes)


const PORT = 5000;
app.listen(PORT, () => { console.log(`servidor rodando na porta: ${PORT}`) });


app.get('/users', async (req, res) => {
    const users = await db.collection("wallets").find().toArray()
    res.send(users);
})