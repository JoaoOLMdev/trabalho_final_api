import express from "express"
import routesLogin from "./routes/login"
import routesUser from "./routes/user"
import routesPosition from "./routes/position"

const app = express()
const port = 3000

app.use(express.json())

app.use("/login", routesLogin)
app.use("/user", routesUser)
app.use("/position", routesPosition)

app.get("/", (req, res) => {
    res.send("Hello World")
})

app.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}`)
})