import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'refreshtokens' })
export class RefreshToken {
    @PrimaryGeneratedColumn('increment')
    id: number;
    @Column({ type: 'int', nullable: false })
    // This is a foreign key to the user who owns this refresh token
    @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    userId: number;
    @Column()
    token: string;
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}