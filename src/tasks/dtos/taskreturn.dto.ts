import { IsInt } from "class-validator";
import { Task } from "../../model/entities/tasks.entity";
import { ApiParam } from "@nestjs/swagger";
export class TaskReturnDto {
    count: number;
    data: Array<Task>
}