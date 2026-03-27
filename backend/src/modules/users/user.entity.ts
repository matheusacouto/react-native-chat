import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tb_usuarios' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  firebase_uid: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nome: string | null;

  @Column({ type: 'date', nullable: true })
  data_nascimento: string | null;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 8, nullable: true })
  telefone_pais: string | null;

  @Column({ type: 'varchar', length: 8, nullable: true })
  telefone_ddd: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  telefone_numero: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  sexo: string | null;

  @Column({ type: 'varchar', length: 50 })
  provider_auth: string;

  @Column({ type: 'varchar', length: 50, default: 'ativo' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  ultimo_login_em: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
