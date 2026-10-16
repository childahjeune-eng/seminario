
const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const banco = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "SUA_SENHA_DO_MYSQL",
    database: "gamezone"
});

// Listar e pesquisar jogos
app.get("/api/jogos", async (req, res) => {
    try {
        const termo = "%" + (req.query.busca || "") + "%";

        const [jogos] = await banco.execute(
            `SELECT * FROM jogos
             WHERE nome LIKE ? OR plataforma LIKE ?
             ORDER BY nome`,
            [termo, termo]
        );

        res.json(jogos);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Erro ao consultar o banco de dados."
        });
    }
});

// Registrar uma compra
app.post("/api/compras", async (req, res) => {
    const { nome, email, itens } = req.body;

    if (!nome || !email || !email.includes("@") ||
        !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({
            erro: "Informe nome, e-mail válido e jogos."
        });
    }

    const conexao = await banco.getConnection();

    try {
        await conexao.beginTransaction();

        const [clientes] = await conexao.execute(
            "SELECT id_cliente FROM clientes WHERE email = ?",
            [email]
        );

        let idCliente;

        if (clientes.length > 0) {
            idCliente = clientes[0].id_cliente;
        } else {
            const [cliente] = await conexao.execute(
                "INSERT INTO clientes (nome, email) VALUES (?, ?)",
                [nome, email]
            );
            idCliente = cliente.insertId;
        }

        let total = 0;
        const itensValidos = [];

        for (const item of itens) {
            const id = Number(item.id_jogo);
            const quantidade = Number(item.quantidade);

            if (!Number.isInteger(id) || id < 1 ||
                !Number.isInteger(quantidade) || quantidade < 1) {
                throw new Error("Item inválido.");
            }

            const [jogos] = await conexao.execute(
                "SELECT * FROM jogos WHERE id_jogo = ? FOR UPDATE",
                [id]
            );

            if (jogos.length === 0) {
                throw new Error("Jogo não encontrado.");
            }

            const jogo = jogos[0];

            if (jogo.estoque < quantidade) {
                throw new Error("Estoque insuficiente: " + jogo.nome);
            }

            total += Number(jogo.preco) * quantidade;

            itensValidos.push({
                id,
                quantidade,
                preco: Number(jogo.preco)
            });
        }

        const [compra] = await conexao.execute(
            "INSERT INTO compras (id_cliente, total) VALUES (?, ?)",
            [idCliente, total.toFixed(2)]
        );

        for (const item of itensValidos) {
            await conexao.execute(
                `INSERT INTO itens_compra
                 (id_compra, id_jogo, quantidade, preco_unitario)
                 VALUES (?, ?, ?, ?)`,
                [
                    compra.insertId,
                    item.id,
                    item.quantidade,
                    item.preco.toFixed(2)
                ]
            );

            await conexao.execute(
                "UPDATE jogos SET estoque = estoque - ? WHERE id_jogo = ?",
                [item.quantidade, item.id]
            );
        }

        await conexao.commit();

        res.status(201).json({
            mensagem: "Pedido registrado com sucesso!",
            id_compra: compra.insertId,
            total: Number(total.toFixed(2))
        });

    } catch (erro) {
        await conexao.rollback();

        res.status(400).json({
            erro: erro.message
        });
    } finally {
        conexao.release();
    }
});

app.listen(3000, () => {
    console.log("GameZone rodando em http://localhost:3000");
});
