import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity({ name: 'tb_push_tokens' })
export class PushToken {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  usuario: User;

  @Column({ type: 'varchar', length: 512, unique: true })
  token: string;

  @Column({ type: 'varchar', length: 32 })
  plataforma: string;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
