import { Task } from "../../model/entities/tasks.entity";
import { ApiProperty } from "@nestjs/swagger";
 
const taskDataExample = JSON.parse(`
 [
		{
			"id": 58,
			"title": "a Task",
			"description": "a task description",
			"createdAt": "2025-06-04T14:47:23.922Z",
			"updatedAt": "2025-06-04T14:47:23.922Z",
			"dueDate": null,
			"status": "pending",
			"userId": 175,
			"deletedAt": null
		}
	]
`)

export class TaskReturnDto {
    @ApiProperty({ name: 'count', description: 'Total number of tasks returned.', example: 1 })
    count: number;
    @ApiProperty({ name: 'data', description: 'Array of tasks returned.', example: taskDataExample })
    data: Array<Task>
}