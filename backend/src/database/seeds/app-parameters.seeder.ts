import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { AppParameter } from '../../modules/app-parameters/app-parameters.entity';

export default class AppParametersSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(AppParameter);

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
      {
        chave: 'notification_routes',
        valor: JSON.stringify([
          {
            label: 'Home',
            value: '/home',
            icon: 'home',
          },
          {
            label: 'Notificações',
            value: '/notification',
            icon: 'notifications',
          },
          {
            label: 'Chat',
            value: '/chat',
            icon: 'chat',
          },
        ]),
        descricao:
          'Lista de rotas disponíveis para envio de notificações com ícone associado.',
        tipo: 'json',
        grupo: 'notifications',
        ativo: true,
      },
    ];

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
  }
}
