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

  router.put("/change-password", async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
        });

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Senha atual incorreta." });
        }

        const validationErrors = validatePassword(newPassword);
        if (validationErrors.length > 0) {
            return res.status(400).json({ error: validationErrors.join("; ") });
        }

        const salt = bcrypt.genSaltSync(12);
        const hashedPassword = bcrypt.hashSync(newPassword, salt);

        await prisma.user.update({
            where: { id: Number(userId) },
            data: { password: hashedPassword },
        });

        res.status(200).json({ message: "Senha alterada com sucesso." });
    } catch (error) {
        console.error("Erro ao alterar a senha:", error);
        res.status(500).json({ error: "Erro ao alterar a senha." });
    }
});



  export default router

