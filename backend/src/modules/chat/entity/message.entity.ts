import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '../../users/user.entity';

@Entity({ name: 'tb_mensagens' })
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Conversation)
  @JoinColumn({ name: 'conversa_id' })
  conversa: Conversation;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'remetente_usuario_id' })
  remetente: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'destinatario_usuario_id' })
  destinatario: User;

  @Column({ type: 'varchar' })
  mensagem: string;

  @Column({ type: 'boolean', default: false })
  lida: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lida_em: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
