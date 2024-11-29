"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function verifyToken(req, res, next) {
    const { authorization } = req.headers;
    if (!authorization) {
        res.sendStatus(401).json({ error: 'Token não informado' });
        return;
    }
    const token = authorization.split(" ")[1];
    try {
        const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
        console.log(decode);
        const { userLogadoId, userLogadoNome } = decode;
        req.userLogadoId = userLogadoId;
        req.userLogadoNome = userLogadoNome;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
}
