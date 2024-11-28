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
    const { email, password } = req.body

    const defaultMesage = "Login ou senha incorretos"

    if (!email || !password) {
        res.status(400).json({ error: defaultMesage })
        return
    }

    try{
        const user = await prisma.user.findFirst({
            where: {
                email
            }
        })

        if(user == null){
            res.status(400).json({ error: defaultMesage })
            return
        }

        if(bcrypt.compareSync(password, user.password)){
            const token = jwt.sign({
                userLogadoId: user.id,
                userLogadoNome: user.name
            }, process.env.JWT_KEY as string, {
                expiresIn: "1h"
            })

            res.status(200).json({ 
                id: user.id,
                name: user.name,
                email: user.email,
                token
             }) 
    } else{
        await prisma.log.create({
            data: {
                description: `Tentativa acesso inválida`,
                complement: `Funcionario: ${user.email}`,
                userId: user.id
            }
        })

        res.status(400).json({ error: defaultMesage })
        }
    } catch(error){
        res.status(400).json(error)
    }
})

export default router;