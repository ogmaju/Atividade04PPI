import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const host = "0.0.0.0";
const porta = 3000;

const server = express();

server.use(bodyParser.urlencoded({ extended: true }));
server.use(cookieParser());
server.use(session({
    secret: "senha-simples",
    resave: false,
    saveUninitialized: true
}));

server.use(express.static(path.join(__dirname, "public", "login.html")));

let produtos = [];

server.get("/", (req, res) => {
    res.send(`
        <h2>Sistema de Cadastro de Produtos</h2>
        <p><a href="/login">Fazer Login</a></p>
        <p><a href="/produtos">Cadastrar Produtos</a></p>
    `);
});

server.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

server.post("/login", (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.send("Preencha usuário e senha.");
    }

    const ultimoAcesso = req.cookies.ultimoAcesso || "Primeiro acesso";

    req.session.usuario = usuario;
    req.session.ultimoAcesso = ultimoAcesso;

    res.cookie("ultimoAcesso", new Date().toLocaleString());

    res.redirect("/produtos");
});

server.get("/produtos", (req, res) => {
    if (!req.session.usuario) {
        return res.send(`
            <h2>Você precisa estar logado!</h2>
            <a href="/login">Clique aqui para fazer login</a>
        `);
    }

    let tabela = `
        <table border="1" cellpadding="5" cellspacing="0">
            <tr>
                <th>Código</th>
                <th>Descrição</th>
                <th>Preço Custo</th>
                <th>Preço Venda</th>
                <th>Validade</th>
                <th>Quantidade</th>
                <th>Fabricante</th>
            </tr>
    `;

    produtos.forEach(p => {
        tabela += `
            <tr>
                <td>${p.codigo}</td>
                <td>${p.descricao}</td>
                <td>${p.custo}</td>
                <td>${p.venda}</td>
                <td>${p.validade}</td>
                <td>${p.qtd}</td>
                <td>${p.fabricante}</td>
            </tr>
        `;
    });

    tabela += `</table>`;

    res.send(`
        <h2>Bem vindo, ${req.session.usuario}!</h2>
        <p>Último acesso registrado: ${req.session.ultimoAcesso}</p>

        <h3>Cadastrar novo produto</h3>
        <form method="POST" action="/produtos">
            <p>Código de barras: <input name="codigo" required></p>
            <p>Descrição: <input name="descricao" required></p>
            <p>Preço de custo: <input name="custo" type="number" step="0.01" required></p>
            <p>Preço de venda: <input name="venda" type="number" step="0.01" required></p>
            <p>Data de validade: <input name="validade" type="date" required></p>
            <p>Quantidade em estoque: <input name="qtd" type="number" required></p>
            <p>Fabricante: <input name="fabricante" required></p>
            <button type="submit">Cadastrar</button>
        </form>

        <h3>Produtos cadastrados</h3>
        ${tabela}

        <br><a href="/">Voltar ao menu</a>
    `);
});

server.post("/produtos", (req, res) => {
    if (!req.session.usuario) {
        return res.send("Faça login primeiro!");
    }

    const { codigo, descricao, custo, venda, validade, qtd, fabricante } = req.body;

    produtos.push({
        codigo,
        descricao,
        custo,
        venda,
        validade,
        qtd,
        fabricante
    });

    res.redirect("/produtos");
});

server.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});
