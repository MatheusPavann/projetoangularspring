# TurisReserva — Sistema de Reserva de Passeios (Tema 15)

Trabalho Bimestral (2º/2026): sistema web de **Turismo – reserva de passeios**.

**Tecnologias:** Angular 18 + Bootstrap 5 + CSS (frontend) · Spring Boot 3 + Java 17 (backend) · PostgreSQL (banco).

---

## 1. Entidades e relacionamento

```
 Cliente 1 ──────< N  Reserva  N >────── 1 Passeio
```

| Entidade | Campos principais |
|---|---|
| **Passeio** | nome, descrição, destino, duração (h), preço por pessoa, capacidade (vagas por dia), imagem, ativo |
| **Cliente** | nome, CPF (único), e-mail, telefone, data de nascimento |
| **Reserva** | cliente (FK), passeio (FK), data do passeio, nº de participantes, valor total, status (CONFIRMADA/CANCELADA), código do comprovante, observações, data de criação |

## 2. Fluxo de negócio integrado

1. **Catálogo de passeios** (`/`): lista os passeios **ativos**, com busca e ordenação.
2. **Detalhes, data e participantes** (`/passeios/:id`):
   - o cliente escolhe a data e o sistema consulta as **vagas restantes** naquele dia;
   - informa a quantidade de participantes e vê o **valor total** calculado na hora;
   - informa o **CPF**: se já for cliente, o sistema o identifica; se não for, aparece um **cadastro rápido**.
3. **Reserva e comprovante** (`/comprovante/:codigo`): a reserva é criada e o sistema gera o código (ex.: `TUR-8WBTZS`). Dá para imprimir ou cancelar.

O comprovante também pode ser consultado depois, pelo código, em **Minha reserva** (`/consulta`).

### Regras de negócio (no backend, `ReservaService`)
- Só passeios **ativos** aceitam reservas.
- A data do passeio não pode estar no passado.
- A soma de participantes das reservas **confirmadas** numa data não pode passar da **capacidade** do passeio.
- O **valor total** é calculado no servidor: preço × participantes.
- Cada reserva recebe um **código de comprovante único**.
- **Cancelar** uma reserva libera as vagas. Reservas canceladas não podem ser editadas.
- Não é possível excluir um **cliente** ou um **passeio** que tenha reservas. O passeio pode ser **desativado** para sair do catálogo.
- O CPF do cliente é único.

## 3. Divisão por integrante

| Integrante | Backend (Controller + Service + Repository) | Frontend |
|---|---|---|
| **Integrante 1 – Passeios** | `PasseioController`, `PasseioService`, `PasseioRepository`, entidade `Passeio` | Catálogo, Gerenciar Passeios (lista + formulário) |
| **Integrante 2 – Clientes** | `ClienteController`, `ClienteService`, `ClienteRepository`, entidade `Cliente` | Gerenciar Clientes (lista + formulário + histórico), cadastro rápido na tela de reserva |
| **Integrante 3 – Reservas** | `ReservaController`, `ReservaService`, `ReservaRepository`, entidade `Reserva`, `ReservaRequest` | Tela de detalhes/reserva, Comprovante, Minha reserva, Gerenciar Reservas |

Partes compartilhadas: `GlobalExceptionHandler`, `CorsConfig`, `shared/` do Angular (validações e pipe de formatação).

## 4. Endpoints da API REST (`http://localhost:8080/api`)

### Passeios
| Método | Rota | Descrição |
|---|---|---|
| GET | `/passeios?ativos=true` | Lista passeios (todos ou só ativos) |
| GET | `/passeios/{id}` | Busca por id |
| GET | `/passeios/{id}/disponibilidade?data=AAAA-MM-DD` | Vagas restantes na data |
| POST | `/passeios` | Cria |
| PUT | `/passeios/{id}` | Atualiza |
| DELETE | `/passeios/{id}` | Exclui (se não tiver reservas) |

### Clientes
| Método | Rota | Descrição |
|---|---|---|
| GET | `/clientes` | Lista |
| GET | `/clientes/{id}` | Busca por id |
| GET | `/clientes/cpf/{cpf}` | Busca por CPF (usado na tela de reserva) |
| GET | `/clientes/{id}/reservas` | Histórico de reservas do cliente |
| POST | `/clientes` | Cria |
| PUT | `/clientes/{id}` | Atualiza |
| DELETE | `/clientes/{id}` | Exclui (se não tiver reservas) |

### Reservas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/reservas` | Lista |
| GET | `/reservas/{id}` | Busca por id |
| GET | `/reservas/codigo/{codigo}` | Busca pelo código do comprovante |
| POST | `/reservas` | Cria (valida vagas, calcula valor, gera código) |
| PUT | `/reservas/{id}` | Atualiza |
| PATCH | `/reservas/{id}/cancelar` | Cancela e libera as vagas |
| DELETE | `/reservas/{id}` | Exclui |

Formato dos erros: `400` (validação, com o erro de cada campo), `404` (não encontrado), `422` (regra de negócio).

## 5. Como executar

### Pré-requisitos
- Java 17 ou mais recente, Maven (ou use a IDE: IntelliJ, Eclipse ou VS Code)
- Node.js 18 ou mais recente e npm
- PostgreSQL

### 5.1 Banco de dados
Crie o banco (as tabelas são criadas automaticamente pelo Hibernate):
```sql
CREATE DATABASE turismo;
```
Se o seu usuário ou senha do PostgreSQL forem diferentes de `postgres`/`postgres`, ajuste em
`backend/src/main/resources/application.properties`.

### 5.2 Backend
```bash
cd backend
mvn spring-boot:run
```
A API sobe em `http://localhost:8080`. Na primeira execução, 4 passeios de exemplo são inseridos (`data.sql`).

### 5.3 Frontend
```bash
cd frontend
npm install
npm start
```
Acesse `http://localhost:4200`.

## 6. Estrutura

```
backend/src/main/java/br/com/turismo
├── config/        CorsConfig
├── controller/    PasseioController, ClienteController, ReservaController
├── dto/           ReservaRequest, DisponibilidadeResponse
├── exception/     GlobalExceptionHandler + exceções
├── model/         Passeio, Cliente, Reserva, StatusReserva
├── repository/    PasseioRepository, ClienteRepository, ReservaRepository
└── service/       PasseioService, ClienteService, ReservaService

frontend/src/app
├── models/        interfaces TypeScript
├── services/      passeio, cliente e reserva (HttpClient)
├── shared/        validadores (CPF, datas), pipe de CPF/telefone, componente de erro
└── pages/
    ├── catalogo/            TELA 1
    ├── passeio-detalhe/     TELA 2
    ├── comprovante/         TELA 3
    ├── consulta-reserva/
    └── admin/               CRUD de passeios, clientes e reservas
```

## 7. Roteiro sugerido para a apresentação
1. **Integrante 1:** mostra o catálogo, cadastra, edita e desativa um passeio (some do catálogo) e explica o endpoint de disponibilidade.
2. **Integrante 2:** cadastra um cliente (validação de CPF, e-mail e telefone), mostra o histórico de reservas e o bloqueio de exclusão.
3. **Integrante 3:** faz uma reserva completa (data → vagas → CPF → confirmar → comprovante), tenta passar do limite de vagas, cancela e mostra as vagas voltando.
4. **Todos:** explicam a integração: Angular → `HttpClient` → Controller → Service (regras) → Repository → PostgreSQL.
