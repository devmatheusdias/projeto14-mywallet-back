import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { signInSchema, signUpSchema } from '../schemas/auth.schema.js';
import { db } from '../database/database.js';
import { validateSchema } from '../middlewares/validateSchema.middleware.js';


export async function signin(req, res) {
    const { email, password } = req.body;

    const userValidation = { email, password };

    const errors = validateSchema(req.body)
    if(errors) return res.send(422).send(errors)


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
}