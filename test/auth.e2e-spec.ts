import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src/modules/users/domain/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userModel: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    userModel = moduleFixture.get(getModelToken(User.name));
  });

  afterAll(async () => {
    // Limpar banco de dados de teste
    if (userModel) {
      await userModel.deleteMany({});
    }
    await app.close();
  });

  beforeEach(async () => {
    // Limpar usuários antes de cada teste
    if (userModel) {
      await userModel.deleteMany({});
    }
  });

  describe('/auth/login (POST)', () => {
    it('deve fazer login com credenciais válidas', async () => {
      // Criar usuário de teste
      const hashedPassword = await bcrypt.hash('password123', 10);
      await userModel.create({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('token_type', 'Bearer');
      expect(response.body).toHaveProperty('expires_in');
      expect(typeof response.body.access_token).toBe('string');
    });

    it('deve retornar 401 com senha incorreta', async () => {
      // Criar usuário de teste
      const hashedPassword = await bcrypt.hash('password123', 10);
      await userModel.create({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user',
      });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('deve retornar 401 com email inexistente', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('deve validar formato do email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('deve validar campos obrigatórios', async () => {
      await request(app.getHttpServer()).post('/auth/login').send({}).expect(400);
    });
  });
});
