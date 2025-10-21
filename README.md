# Access Control API

API RESTful para controle de acesso com autenticação JWT, desenvolvida com NestJS e MongoDB seguindo princípios de DDD (Domain-Driven Design).

## 🎯 Sobre o Projeto

A Access Control API é uma solução completa para gerenciamento de usuários e controle de acesso com os seguintes recursos:

- ✅ Cadastro e gerenciamento de usuários
- ✅ Autenticação com JWT (JSON Web Token)
- ✅ Controle de acesso baseado em papéis (RBAC)
- ✅ Registro de logs de acesso
- ✅ Validação de dados com class-validator
- ✅ Documentação automática com Swagger
- ✅ Arquitetura DDD modularizada
- ✅ Testes unitários e E2E com TDD
- ✅ Containerização com Docker

## 🚀 Tecnologias Utilizadas

- **Framework**: NestJS 10.x
- **Banco de Dados**: MongoDB 6.x
- **ODM**: Mongoose
- **Autenticação**: JWT (Passport)
- **Validação**: class-validator, class-transformer
- **Documentação**: Swagger/OpenAPI
- **Testes**: Jest
- **Containerização**: Docker & Docker Compose
- **Linguagem**: TypeScript 5.x
- **Node.js**: 18+

## 🏗️ Arquitetura

O projeto segue os princípios de **Domain-Driven Design (DDD)** com organização modular:

```
src/
├── modules/
│   ├── users/              # Módulo de usuários
│   │   ├── domain/         # Entidades e interfaces de repositório
│   │   ├── infrastructure/ # Implementação de repositórios
│   │   ├── application/    # Serviços e DTOs
│   │   └── presentation/   # Controllers
│   │
│   ├── auth/               # Módulo de autenticação
│   │   ├── application/    # Serviços e DTOs
│   │   ├── infrastructure/ # Guards, Strategies, Decorators
│   │   └── presentation/   # Controllers
│   │
│   └── access-logs/        # Módulo de logs de acesso
│       ├── domain/         # Entidades e interfaces
│       ├── infrastructure/ # Repositórios
│       ├── application/    # Serviços e DTOs
│       └── presentation/   # Controllers
│
├── app.module.ts           # Módulo principal
└── main.ts                 # Bootstrap da aplicação
```

### Camadas da Arquitetura

1. **Domain**: Entidades e contratos (interfaces)
2. **Infrastructure**: Implementação concreta (repositórios, guards)
3. **Application**: Lógica de negócio (services, DTOs)
4. **Presentation**: Camada de apresentação (controllers)

## 📦 Pré-requisitos

Antes de começar, você precisará ter instalado:

### Opção 1: Docker (Recomendado)
- [Docker](https://www.docker.com/get-started) 20.x ou superior
- [Docker Compose](https://docs.docker.com/compose/install/) 2.x ou superior

### Opção 2: Instalação Manual
- [Node.js](https://nodejs.org/) 18.x ou superior
- [MongoDB](https://www.mongodb.com/try/download/community) 6.x ou superior
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

## 🔧 Instalação

### Clone o repositório

```bash
git clone https://github.com/marcelloJr/access-control-api.git
cd access-control-api
```

### Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/access-control

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=1d

# Application
PORT=3000
NODE_ENV=development
```

## ▶️ Execução

### Opção 1: Com Docker (Recomendado)

```bash
# Construir e iniciar os containers
docker-compose up --build

# Ou em modo detached (background)
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Parar os containers
docker-compose down
```

A API estará disponível em: `http://localhost:3000`

### Opção 2: Instalação Manual

#### 1. Instalar dependências

```bash
npm install
```

#### 2. Certifique-se de que o MongoDB está rodando

```bash
# Verifique se o MongoDB está ativo
mongosh --eval "db.version()"
```

#### 3. Iniciar a aplicação

```bash
# Modo desenvolvimento
npm run start:dev

# Modo produção
npm run build
npm run start:prod

# Modo debug
npm run start:debug
```

## 🧪 Testes

O projeto implementa **TDD (Test-Driven Development)** com cobertura completa do módulo de autenticação.

### Executar todos os testes

```bash
npm test
```

### Testes em modo watch

```bash
npm run test:watch
```

### Testes com cobertura

```bash
npm run test:cov
```

### Testes E2E (End-to-End)

```bash
npm run test:e2e
```

### Testes implementados

- ✅ Geração de JWT válido
- ✅ Validação de JWT
- ✅ Autenticação com senha incorreta
- ✅ Autenticação com usuário inexistente
- ✅ Registro de logs de acesso
- ✅ Tempo de expiração do token

## 📚 Documentação da API

A documentação completa da API está disponível via Swagger/OpenAPI.

### Acessar a documentação

Após iniciar a aplicação, acesse:

```
http://localhost:3000/api/docs
```

A interface interativa do Swagger permite:
- Visualizar todos os endpoints
- Testar requisições diretamente
- Ver schemas de dados
- Autenticar com JWT

## 🔌 Endpoints

### 👤 Users

| Método | Endpoint | Descrição | Autenticação | Autorização |
|--------|----------|-----------|--------------|-------------|
| POST | `/users` | Criar novo usuário | Não | Pública |
| GET | `/users` | Listar todos os usuários | Sim | Admin |

### 🔐 Auth

| Método | Endpoint | Descrição | Autenticação | Autorização |
|--------|----------|-----------|--------------|-------------|
| POST | `/auth/login` | Realizar login | Não | Pública |

### 📊 Logs

| Método | Endpoint | Descrição | Autenticação | Autorização |
|--------|----------|-----------|--------------|-------------|
| GET | `/logs` | Listar logs de acesso | Sim | Admin |

## 📝 Exemplos de Requisições

### 1. Criar Usuário

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123",
    "role": "user"
  }'
```

**Resposta (201 Created):**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "João Silva",
  "email": "joao@example.com",
  "role": "user"
}
```

### 2. Criar Administrador

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### 3. Realizar Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

**Resposta (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

### 4. Listar Usuários (Requer autenticação Admin)

```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Resposta (200 OK):**

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "user"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
]
```

### 5. Listar Logs de Acesso (Requer autenticação Admin)

```bash
curl -X GET http://localhost:3000/logs \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Resposta (200 OK):**

```json
[
  {
    "id": "507f1f77bcf86cd799439013",
    "userId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "João Silva",
      "email": "joao@example.com"
    },
    "ip": "192.168.1.1",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
]
```

### Exemplos com HTTPie

Se preferir usar o [HTTPie](https://httpie.io/):

```bash
# Criar usuário
http POST :3000/users name="João Silva" email="joao@example.com" password="senha123" role="user"

# Login
http POST :3000/auth/login email="joao@example.com" password="senha123"

# Listar usuários (com token)
http GET :3000/users "Authorization: Bearer <seu-token>"

# Listar logs (com token)
http GET :3000/logs "Authorization: Bearer <seu-token>"
```

## 🔒 Segurança

- **Senhas**: Hash com bcrypt (salt rounds: 10)
- **JWT**: Tokens assinados com chave secreta configurável
- **Validação**: Validação automática de entrada com class-validator
- **CORS**: Habilitado para desenvolvimento (configurar em produção)
- **Guards**: Proteção de rotas com Guards do NestJS

## 🎨 Estrutura de Dados

### User

```typescript
{
  id: string (ObjectId);
  name: string;
  email: string (unique);
  password: string (hashed);
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}
```

### AccessLog

```typescript
{
  id: string (ObjectId);
  userId: ObjectId (ref: User);
  ip: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### JWT Payload

```typescript
{
  sub: string (userId);
  email: string;
  role: 'admin' | 'user';
  iat: number;
  exp: number;
}
```

## 🔄 Papéis e Permissões

| Papel | Criar Usuário | Login | Listar Usuários | Listar Logs |
|-------|---------------|-------|-----------------|-------------|
| **Anônimo** | ✅ | ✅ | ❌ | ❌ |
| **User** | - | ✅ | ❌ | ❌ |
| **Admin** | - | ✅ | ✅ | ✅ |

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev       # Inicia em modo watch
npm run start:debug     # Inicia em modo debug

# Produção
npm run build           # Compila o projeto
npm run start:prod      # Inicia a aplicação compilada

# Testes
npm test                # Executa testes unitários
npm run test:watch      # Testes em modo watch
npm run test:cov        # Testes com cobertura
npm run test:e2e        # Testes end-to-end

# Qualidade de código
npm run lint            # Executa ESLint
npm run format          # Formata código com Prettier
```

## 🐛 Troubleshooting

### Erro de conexão com MongoDB

```bash
# Verifique se o MongoDB está rodando
docker ps  # Se usando Docker
# ou
sudo systemctl status mongod  # Linux
```

### Porta 3000 já em uso

```bash
# Mude a porta no .env
PORT=3001
```

### Erro ao instalar dependências

```bash
# Limpe o cache do npm e reinstale
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 📈 Melhorias Futuras (Diferenciais)

- [ ] Redis para cache de autenticação
- [ ] RabbitMQ para mensageria de logs
- [ ] Pipeline CI/CD com GitHub Actions
- [ ] Rate limiting
- [ ] Refresh tokens
- [ ] Soft delete de usuários
- [ ] Histórico de alterações

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Autor

Desenvolvido como desafio técnico para avaliação de habilidades em:
- Arquitetura de software (DDD)
- Boas práticas de desenvolvimento
- Testes automatizados (TDD)
- Documentação técnica

---

**Documentação da API**: http://localhost:3000/api/docs

**Repositório**: [https://github.com/marcelloJr/access-control-api](https://github.com/marcelloJr/access-control-api)
