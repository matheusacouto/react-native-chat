import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { User } from '../../modules/users/user.entity';

export default class TestUsersSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(User);

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
  }
}
