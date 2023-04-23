import express from 'express'
import {v4 as uuid} from 'uuid'
import cors from 'cors'
import joi from 'joi'
import dotenv from 'dotenv';
import bcrypt from 'bcrypt'
import { MongoClient } from "mongodb";


const app = express();
app.use(cors());
app.use(express.json());
dotenv.config()

const PORT = 5000;

app.listen(PORT, () => { console.log(`servidor rodando na porta: ${PORT}`) });

const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
    await mongoClient.connect();
    console.log('MongoDB Connected!')
} catch (err) {
    console.log(err.message)
}

const db = mongoClient.db();


const signUpSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(3).required()
});

const signInSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
})


app.post('/cadastro', async (req, res) => {
    const { name, email, password } = req.body;

    const passwordHash = bcrypt.hashSync(password, 10)

    const userValidation = { name, email, password };

    const validation = signUpSchema.validate(userValidation, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(console.log(errors))
    }

    try {
        const emailExists = await db.collection("wallets").findOne({ email: email });

        if (emailExists) return res.status(409).send('email ja cadastrado');

        await db.collection("wallets").insertOne({ name, email, password: passwordHash });

        return res.status(201).send(userValidation);


    } catch (error) {
        return res.sendStatus(422)
    }
});

app.post('/', async (req, res) => {
    const { email, password } = req.body;

    const userValidation = { email, password };

    const validation = signInSchema.validate(userValidation, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(console.log(errors))
    }

    res.status(200).send(console.log(userValidation));


     try {
         const user = await db.collection('wallets').findOne({ email });

         if(!user) return res.status(404).send("usuario nao encontrado")

        
         if (bcrypt.compareSync(password, user.password)) {
          const token = uuid();

             await db.collection("sessions").insertOne({ userId: user._id, token })
             res.status(200).send(token);
         } else {
             res.status(401).send("senha incorreta");
         }

     } catch (error) {
         res.status(401).send(error)
     }
})

app.get('/users', async (req, res) => {
    const users = await db.collection("wallets").find().toArray()

    res.send(users);
})