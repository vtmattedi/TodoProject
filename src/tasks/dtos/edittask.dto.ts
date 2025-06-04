import { ApiProperty } from "@nestjs/swagger";

export class EditTaskDto {
    taskId: number; // do not use @ApiProperty here as this is the path parameter
    userId: number;// do not use @ApiProperty here as this is injected by the middleware
    @ApiProperty({ description: 'New description', example: 'The new description', required: false })
    description?: string;
    @ApiProperty({ description: 'New due date (converted using js Date constructor)', example: '2023-10-01T00:00:00Z', required: false })
    dueDate?: Date;
    @ApiProperty({ description: 'New title', example: 'New Task Title', required: false })
    title?: string;
    @ApiProperty({ description: 'New status', example: 'finished', required: false })
    status?: 'pending' | 'finished';
}