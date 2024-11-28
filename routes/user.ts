import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import bcrypt from "bcrypt";
import z from "zod";

const prisma = new PrismaClient()
const router = Router()

const usuarioSchema = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string(),
})

router.get("/", async (req, res) => {
    try {
        const users = await prisma.user.findMany()
        res.status(200).json(users)
    } catch (error) {
        res.status(400).json(error)
    }
})

function validatePassword(senha: string) {

    const message: string[] = []
  
    if (senha.length < 8) {
      message.push("Erro... senha deve possuir, no mínimo, 8 caracteres")
    }
  
    let little = 0
    let big = 0
    let numbers = 0
    let simbols = 0
  
    for (const letra of senha) {
      if ((/[a-z]/).test(letra)) {
        little++
      }
      else if ((/[A-Z]/).test(letra)) {
        big++
      }
      else if ((/[0-9]/).test(letra)) {
        numbers++
      } else {
        simbols++
      }
    }
  
    if (little == 0) {
      message.push("Erro... senha deve possuir letra(s) minúscula(s)")
    }
  
    if (big == 0) {
      message.push("Erro... senha deve possuir letra(s) maiúscula(s)")
    }
  
    if (numbers == 0) {
      message.push("Erro... senha deve possuir número(s)")
    }
  
    if (simbols == 0) {
      message.push("Erro... senha deve possuir símbolo(s)")
    }
  
    return message
}

router.post("/", async (req, res) => {

    const validate = usuarioSchema.safeParse(req.body)
    if (!validate.success) {
      res.status(400).json({ erro: validate.error })
      return
    }
  
    const erros = validatePassword(validate.data.password)
    if (erros.length > 0) {
      res.status(400).json({ erro: erros.join("; ") })
      return
    }
  
    const salt = bcrypt.genSaltSync(12)

    const hash = bcrypt.hashSync(validate.data.password, salt)
  

    try {
      const usuario = await prisma.user.create({
        data: { ...validate.data, password: hash }
      })
      res.status(201).json(usuario)
    } catch (error) {
      res.status(400).json(error)
    }
  })
  
  export default router

