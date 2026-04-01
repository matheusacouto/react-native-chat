import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../modules/users/user.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT ?? 5432),
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
  entities: [User],
});

const users = [
  {
    firebase_uid: '1YK3iil3Y6ZpoeGc5RSCCPuo7Q43',
    nome: 'Usuário Teste 1',
    data_nascimento: null,
    email: 'usertest@teste.com',
    telefone_pais: null,
    telefone_ddd: null,
    telefone_numero: null,
    sexo: null,
    provider_auth: 'password',
    status: 'ativo',
    ultimo_login_em: null,
  },
  {
    firebase_uid: 'q69TSPNRiiWXPZffBDulbNwAAa73',
    nome: 'Usuário Teste 2',
    data_nascimento: null,
    email: 'usertest2@teste.com',
    telefone_pais: null,
    telefone_ddd: null,
    telefone_numero: null,
    sexo: null,
    provider_auth: 'password',
    status: 'ativo',
    ultimo_login_em: null,
  },
];

async function seedTestUsers() {
  await dataSource.initialize();

  const repository = dataSource.getRepository(User);

  for (const userData of users) {
    const existingUser = await repository.findOne({
      where: [
        { firebase_uid: userData.firebase_uid },
        { email: userData.email },
      ],
    });

    if (existingUser) {
      existingUser.firebase_uid = userData.firebase_uid;
      existingUser.nome = userData.nome;
      existingUser.email = userData.email;
      existingUser.provider_auth = userData.provider_auth;
      existingUser.status = userData.status;

      await repository.save(existingUser);
      continue;
    }

    await repository.save(repository.create(userData));
  }

  await dataSource.destroy();

  console.log(
    'Test users seeded successfully. Passwords must exist in Firebase Auth.',
  );
}

seedTestUsers().catch(async (error) => {
  console.error('Failed to seed test users.', error);

  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }

  process.exit(1);
});
