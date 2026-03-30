import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../users/user.entity';
import { NotificationRecipient } from './notification-recipient.entity';

export enum Tipo {
  GLOBAL = 'global',
  INDIVIDUAL = 'individual',
}

@Entity({ name: 'tb_notificacoes' })
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  tipo: Tipo;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rota_destino: string | null;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any> | null;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'criado_por_usuario_id' })
  criado_por_usuario: User;

  @OneToMany(() => NotificationRecipient, (recipient) => recipient.notificacao)
  destinatarios: NotificationRecipient[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
