
const catalogo = document.getElementById("catalogo");
const pesquisa = document.getElementById("pesquisa");
const painel = document.getElementById("painelCarrinho");

let jogos = [];
let carrinho = [];

const dinheiro = valor =>
    Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

async function carregarJogos() {
    try {
        const resposta = await fetch("/api/jogos");
        if (!resposta.ok) throw new Error("Erro ao buscar jogos");

        jogos = await resposta.json();
        mostrarJogos(jogos);
    } catch (erro) {
        catalogo.textContent =
            "Não foi possível carregar os jogos. Verifique o servidor e o MySQL.";
    }
}

function mostrarJogos(lista) {
    catalogo.innerHTML = "";

    lista.forEach(jogo => {
        const card = document.createElement("article");
        card.className = "jogo";

        const nome = document.createElement("h3");
        nome.textContent = jogo.nome;

        const plataforma = document.createElement("p");
        plataforma.textContent = "Plataforma: " + jogo.plataforma;

        const preco = document.createElement("p");
        preco.className = "preco";
        preco.textContent = dinheiro(jogo.preco);

        const estoque = document.createElement("p");
        estoque.textContent = Number(jogo.estoque) > 0
            ? "Em estoque: " + jogo.estoque
            : "Sem estoque";

        const botao = document.createElement("button");
        botao.textContent = "Adicionar ao carrinho";
        botao.disabled = Number(jogo.estoque) < 1;
        botao.addEventListener("click", () => adicionar(jogo));

        card.append(nome, plataforma, preco, estoque, botao);
        catalogo.appendChild(card);
    });
}

pesquisa.addEventListener("input", () => {
    const termo = pesquisa.value.toLowerCase();

    mostrarJogos(
        jogos.filter(jogo =>
            jogo.nome.toLowerCase().includes(termo) ||
            jogo.plataforma.toLowerCase().includes(termo)
        )
    );
});

function adicionar(jogo) {
    const item = carrinho.find(
        item => item.id_jogo === jogo.id_jogo
    );

    if (item) {
        if (item.quantidade >= Number(jogo.estoque)) {
            alert("Não há mais unidades disponíveis.");
            return;
        }
        item.quantidade++;
    } else {
        carrinho.push({
            id_jogo: jogo.id_jogo,
            nome: jogo.nome,
            preco: Number(jogo.preco),
            quantidade: 1,
            estoque: Number(jogo.estoque)
        });
    }

    atualizarCarrinho();
}

function atualizarCarrinho() {
    const itens = document.getElementById("itensCarrinho");
    itens.innerHTML = "";

    let total = 0;
    let quantidade = 0;

    carrinho.forEach(item => {
        total += item.preco * item.quantidade;
        quantidade += item.quantidade;

        const linha = document.createElement("div");
        linha.className = "item-carrinho";

        const nome = document.createElement("p");
        nome.textContent = item.nome;

        const valor = document.createElement("p");
        valor.textContent =
            `${item.quantidade} x ${dinheiro(item.preco)}`;

        const remover = document.createElement("button");
        remover.textContent = "Remover uma unidade";
        remover.addEventListener("click", () => {
            item.quantidade--;
            if (item.quantidade <= 0) {
                carrinho = carrinho.filter(
                    outro => outro.id_jogo !== item.id_jogo
                );
            }
            atualizarCarrinho();
        });

        linha.append(nome, valor, remover);
        itens.appendChild(linha);
    });

    document.getElementById("quantidade").textContent = quantidade;
    document.getElementById("total").textContent = dinheiro(total);
}

document.getElementById("abrirCarrinho").addEventListener("click", () => {
    painel.classList.add("aberto");
});

document.getElementById("fecharCarrinho").addEventListener("click", () => {
    painel.classList.remove("aberto");
});

document.getElementById("formCompra").addEventListener(
    "submit",
    async evento => {
        evento.preventDefault();

        if (carrinho.length === 0) {
            document.getElementById("mensagem").textContent =
                "Adicione um jogo antes de registrar o pedido.";
            return;
        }

        const nome = document.getElementById("nomeCliente").value.trim();
        const email = document.getElementById("emailCliente").value.trim();

        try {
            const resposta = await fetch("/api/compras", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome,
                    email,
                    itens: carrinho.map(item => ({
                        id_jogo: item.id_jogo,
                        quantidade: item.quantidade
                    }))
                })
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(resultado.erro || "Erro ao registrar pedido.");
            }

            document.getElementById("mensagem").textContent =
                `${resultado.mensagem} Pedido nº ${resultado.id_compra}. Total: ${dinheiro(resultado.total)}.`;

            carrinho = [];
            atualizarCarrinho();
            evento.target.reset();
            await carregarJogos();

        } catch (erro) {
            document.getElementById("mensagem").textContent = erro.message;
        }
    }
);

carregarJogos();
