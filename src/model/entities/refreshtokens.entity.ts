import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'refreshtokens' })  
export class RefreshToken {
    @PrimaryGeneratedColumn('increment')
    id: number;
    @Column()
    userId: number
    @Column()
    token: string;
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}