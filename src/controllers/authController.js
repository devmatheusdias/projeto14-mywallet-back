import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { db } from '../database/database.js';
import { getDate } from '../middlewares/getDate.middleware.js';


export async function signin(req, res) {
    const { email, password } = req.body;

    try {
        const user = await db.collection('wallets').findOne({ email });

        if (!user) return res.status(404).send("usuario nao encontrado")


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
}

export async function signup(req, res) {
    const { name, email, password } = req.body;

    const passwordHash = bcrypt.hashSync(password, 10)

    try {
        const emailExists = await db.collection("wallets").findOne({ email: email });

        if (emailExists) return res.status(409).send('email ja cadastrado');

        await db.collection("wallets").insertOne({ name, email, password: passwordHash });

        return res.sendStatus(201)


    } catch (error) {
        return res.sendStatus(422)
    }
}

export async function home(req, res) {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer', '').trim();

    if (!token) return res.status(401).send('Unauthorized')

    const session = await db.collection("sessions").findOne({ token });
    if (!session) return res.send('sessao nao encontrada')

    const user = await db.collection("wallets").findOne({ _id: session.userId });
    const transactions = await db.collection("transactions").find({ userId: session.userId }).toArray()


    if (user) {
        // delete user.password;
        res.send(transactions)
    } else {
        res.sendStatus(401)
    }
}

export async function novaTransacao(req, res) {

    const currentDate = getDate();
    const { value, description } = req.body;
    const { tipo } = req.params;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer', '').trim();

    if (!token) return res.status(401).send('unauthorized');
    const session = await db.collection("sessions").findOne({ token });

    if (!session) return res.send('sessao nao encontrada');

    try {

        await db.collection("transactions").insertOne({ currentDate, value: Number(value), description, tipo, userId: session.userId });

        return res.status(201).send('transação inserida com sucesso!');

    } catch (error) {
        return res.sendStatus(422)
    }
}

