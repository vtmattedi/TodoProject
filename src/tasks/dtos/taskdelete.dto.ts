import { ApiProperty } from "@nestjs/swagger";
 

export class TaskDeleteDto {
    @ApiProperty({ name: 'message', description: 'The action on the task.', example: 'Task has been deleted.' })
    message: String;
    @ApiProperty({ name: 'count', description: 'Total number of tasks returned.', example: 1 })
    count: number;
}