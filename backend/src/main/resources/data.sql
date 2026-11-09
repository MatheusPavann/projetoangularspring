-- Dados de exemplo (só insere se a tabela estiver vazia)
INSERT INTO passeio (nome, descricao, destino, duracao_horas, preco, capacidade, ativo, imagem_url)
SELECT * FROM (VALUES
 ('Trilha da Cachoeira Azul', 'Trilha guiada de nível moderado até uma cachoeira de águas cristalinas, com parada para banho e lanche.', 'Chapada dos Veadeiros - GO', 6, 180.00, 15, true, 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800'),
 ('City Tour Histórico', 'Passeio de van pelos principais pontos históricos da cidade com guia credenciado.', 'Ouro Preto - MG', 4, 95.00, 20, true, 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800'),
 ('Passeio de Barco pelas Ilhas', 'Roteiro de escuna por 4 ilhas com paradas para mergulho e almoço a bordo.', 'Angra dos Reis - RJ', 8, 250.00, 30, true, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'),
 ('Voo de Balão ao Amanhecer', 'Voo panorâmico de balão com café da manhã e certificado de voo.', 'Boituva - SP', 3, 690.00, 8, true, 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800')
) AS v(nome, descricao, destino, duracao_horas, preco, capacidade, ativo, imagem_url)
WHERE NOT EXISTS (SELECT 1 FROM passeio);
