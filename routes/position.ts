import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from 'zod'
import { verifyToken } from '../middlewares/VerifyToken'

const prisma = new PrismaClient()
const router = Router()

const positionSchema = z.object({
    positionName: z.string(),
    salary: z.number(),
    userId: z.number(),
})

router.get("/", async (req, res) => {
    try {
        const positions = await prisma.position.findMany({
            where: { deleted: false },
            orderBy: { id: 'desc' },
            select: {
                id: true,
                positionName: true,
                salary: true,
                userId: true,
        }
    })
        res.status(200).json(positions)
    } catch (error) {
        res.status(400).json(error)
    }
})

router.post("/", verifyToken, async (req, res) => {

    const validate = positionSchema.safeParse(req.body)
    if(!validate.success) {
        res.status(400).json(validate.error)
        return
    }

    try {
        const position = await prisma.position.create({
            data: validate.data
        })
        res.status(200).json(position)
        } catch (error) {
        res.status(400).json(error)
    }
})

router.delete("/:id", verifyToken, async (req: any, res) => {
    const { id } = req.params
    try {
        const position = await prisma.position.update({
            where: { id: Number(id) },
            data: { deleted: true }
        })

        await prisma.log.create({
            data: {
                description: `Exclusão de cargo com id ${id}`,
                complement: `Usuário ${req.userLogadoNome} deletou o cargo ${position.positionName}`,
                userId: req.userLogadoId
            }
        })
        res.status(200).json(position)
    } catch (error) {
        res.status(400).json(error)
    }
})

router.put("/:id", verifyToken, async (req, res) => {
    const { id } = req.params
    
    const validate = positionSchema.safeParse(req.body)
    if(!validate.success) {
        res.status(400).json(validate.error)
        return
    }
    try {
        const position = await prisma.position.update({
            where: { id: Number(id) },
            data: validate.data
        })
        res.status(200).json(position)
    } catch (error) {
        res.status(400).json(error)
    }
})

export default router