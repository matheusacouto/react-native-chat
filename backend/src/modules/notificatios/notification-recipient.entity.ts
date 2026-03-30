import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Notification } from './notification.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'tb_notificacao_destinatarios' })
export class NotificationRecipient {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Notification, (notification) => notification.destinatarios, {
    nullable: false,
  })
  @JoinColumn({ name: 'notificacao_id' })
  notificacao: Notification;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ type: 'boolean', default: false })
  lida: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lida_em: Date | null;

  @Column({ type: 'boolean', default: false })
  entregue_push: boolean;

  @Column({ type: 'timestamp', nullable: true })
  entregue_push_em: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
