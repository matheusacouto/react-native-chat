import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AppParameter } from '../modules/app-parameters/app-parameters.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT ?? 5432),
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
  entities: [AppParameter],
});

const parameters = [
  {
    chave: 'home_title',
    valor: 'Central do Chat',
    descricao: 'Titulo principal exibido na tela inicial do aplicativo.',
    tipo: 'string',
    grupo: 'home',
    ativo: true,
  },
  {
    chave: 'home_subtitle',
    valor:
      'Acompanhe conversas, notificacoes e atalhos do desafio em um lugar so.',
    descricao: 'Subtitulo exibido abaixo do titulo da home.',
    tipo: 'string',
    grupo: 'home',
    ativo: true,
  },
  {
    chave: 'home_notice',
    valor:
      'Os parametros desta tela vem do PostgreSQL para demonstrar a composicao dinamica do app.',
    descricao: 'Mensagem de destaque mostrada na home quando ativa.',
    tipo: 'string',
    grupo: 'home',
    ativo: true,
  },
];

async function seedAppParameters() {
  await dataSource.initialize();

  const repository = dataSource.getRepository(AppParameter);

  for (const parameter of parameters) {
    const existingParameter = await repository.findOneBy({
      chave: parameter.chave,
    });

    if (existingParameter) {
      existingParameter.valor = parameter.valor;
      existingParameter.descricao = parameter.descricao;
      existingParameter.tipo = parameter.tipo;
      existingParameter.grupo = parameter.grupo;
      existingParameter.ativo = parameter.ativo;

      await repository.save(existingParameter);
      continue;
    }

    await repository.save(repository.create(parameter));
  }

  await dataSource.destroy();
  console.log('App parameters seeded successfully.');
}

seedAppParameters().catch(async (error) => {
  console.error('Failed to seed app parameters.', error);

  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }

  process.exit(1);
});
