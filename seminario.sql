CREATE DATABASE IF NOT EXISTS gamestore;

USE gamestore;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS jogos (
    id_jogo INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    genero VARCHAR(50) NOT NULL,
    plataforma VARCHAR(50) NOT NULL,
    preco DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS compras (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_jogo INT NOT NULL,
    data_compra DATE NOT NULL,

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    FOREIGN KEY (id_jogo)
        REFERENCES jogos(id_jogo),

    UNIQUE (id_usuario, id_jogo, data_compra)
);

INSERT IGNORE INTO usuarios (nome, email, senha)
VALUES
('Ana', 'ana@email.com', 'senha123'),
('Pedro', 'pedro@email.com', 'senha456'),
('Maria', 'maria@email.com', 'senha789');

INSERT IGNORE INTO jogos (nome, genero, plataforma, preco)
VALUES
('Minecraft', 'Sandbox', 'PC', 99.90),
('FIFA 26', 'Esporte', 'PC', 299.90),
('The Sims 4', 'Simulacao', 'PC', 0.00),
('Resident Evil 4', 'Terror', 'PC', 249.90),
('Stardew Valley', 'RPG', 'PC', 39.90);

INSERT IGNORE INTO compras
(id_usuario, id_jogo, data_compra)
VALUES
(1, 1, '2026-11-19'),
(2, 2, '2026-11-19'),
(3, 5, '2026-11-19');

SELECT * FROM usuarios;

SELECT * FROM jogos;

SELECT * FROM jogos
WHERE genero = 'Terror';

SELECT * FROM jogos
WHERE preco < 100;

SELECT * FROM jogos
ORDER BY preco ASC;

SELECT * FROM jogos
WHERE nome LIKE '%Minecraft%';

SELECT * FROM compras;

SELECT
    usuarios.nome AS usuario,
    jogos.nome AS jogo,
    jogos.preco,
    compras.data_compra
FROM compras
INNER JOIN usuarios
    ON compras.id_usuario = usuarios.id_usuario
INNER JOIN jogos
    ON compras.id_jogo = jogos.id_jogo;

