import { IsInt } from "class-validator";

export class EditTaskDto {
    taskId: number;
    description?: string;
    dueDate?: Date;
    title?: string;
    status?: 'pending' | 'finished';
    @IsInt()
    userId: number;
}