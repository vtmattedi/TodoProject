import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
@Entity({ name: 'tasks' })  
export class Task {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ type: 'text', nullable: false })
    title: string;
    @Column({ type: 'text', nullable: false })
    description: string;
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date = new Date();
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date = new Date();
    @Column({type: 'timestamp', default: () => 'null', nullable: true})
    dueDate: Date | null = null;
    @Column({ default: 'pending' })
    status: 'pending' | 'finished' = 'pending';
    @Column({ type: 'int', nullable: false })
    // This is a foreign key to the user who created the task
    @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' } )
    @JoinColumn({ name: 'userId'})
    userId: number;
    @Column({ type: 'timestamp', default: () => 'null', nullable: true })
    deletedAt: Date | null = null; // Soft delete field, nullable


}