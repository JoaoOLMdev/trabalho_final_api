import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'stdout',
            level: 'error',
        },
        {
            emit: 'stdout',
            level: 'info',
        },
        {
            emit: 'stdout',
            level: 'warn',
        },
    ],
});

prisma.$on('query', (e) => {
    console.log('Query: ' + e.query);
    console.log('Params: ' + e.params);
    console.log('Duration: ' + e.duration + 'ms');
});

const router = Router();

router.post("/", async (req, res) => {
    const { email, password } = req.body;

    const defaultMessage = "Login ou senha incorretos";

    if (!email || !password) {
        res.status(400).json({ error: defaultMessage });
        return;
    }

    try {
        const user = await prisma.user.findFirst({
            where: { email },
        });

        if (user == null) {
            res.status(400).json({ error: defaultMessage });
            return;
        }

        if (bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign(
                {
                    userLogadoId: user.id,
                    userLogadoNome: user.name,
                },
                process.env.JWT_KEY as string,
                {
                    expiresIn: "1h",
                }
            );

            const previousLogin = user.lastLogin;
            const currentLogin = new Date();


            await prisma.user.update({
                where: { id: user.id },
                data: { lastLogin: currentLogin },
            });

 
            const welcomeMessage = previousLogin
                ? `Bem-vindo ${user.name}. Seu último acesso ao sistema foi em ${previousLogin.toLocaleString()}.`
                : `Bem-vindo ${user.name}. Este é o seu primeiro acesso ao sistema.`;

            res.status(200).json({
                id: user.id,
                name: user.name,
                email: user.email,
                token,
                message: welcomeMessage,
            });
        } else {
            await prisma.log.create({
                data: {
                    description: `Tentativa de acesso inválida`,
                    complement: `Funcionário: ${user.email}`,
                    userId: user.id,
                },
            });

            res.status(400).json({ error: defaultMessage });
        }
    } catch (error) {
        res.status(400).json(error);
    }
});


export default router;