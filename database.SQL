
CREATE DATABASE IF NOT EXISTS gamezone;
USE gamezone;

CREATE TABLE jogos (
    id_jogo INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    plataforma VARCHAR(50) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    estoque INT NOT NULL DEFAULT 0
);

CREATE TABLE clientes (
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE compras (
    id_compra INT PRIMARY KEY AUTO_INCREMENT,
    id_cliente INT NOT NULL,
    data_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_cliente)
        REFERENCES clientes(id_cliente)
);

CREATE TABLE itens_compra (
    id_item INT PRIMARY KEY AUTO_INCREMENT,
    id_compra INT NOT NULL,
    id_jogo INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_compra)
        REFERENCES compras(id_compra),
    FOREIGN KEY (id_jogo)
        REFERENCES jogos(id_jogo)
);

INSERT INTO jogos (nome, plataforma, preco, estoque)
VALUES
('Minecraft', 'PC', 99.90, 10),
('Sonic Mania', 'PlayStation', 79.90, 5),
('EA SPORTS FC', 'Xbox', 199.90, 8),
('Stardew Valley', 'PC', 34.90, 12);

-- Consultas SQL para a apresentação

-- 1. Mostrar todos os jogos
SELECT * FROM jogos;

-- 2. Mostrar jogos com preço abaixo de R$ 100
SELECT nome, preco
FROM jogos
WHERE preco < 100;

-- 3. Mostrar jogos disponíveis em estoque
SELECT nome, estoque
FROM jogos
WHERE estoque > 0;

-- 4. Ordenar jogos pelo menor preço
SELECT nome, preco
FROM jogos
ORDER BY preco ASC;

-- 5. Consultar as compras e os clientes
SELECT clientes.nome, compras.total, compras.data_compra
FROM compras
INNER JOIN clientes
ON compras.id_cliente = clientes.id_cliente;
