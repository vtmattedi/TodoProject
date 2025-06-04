import { IsDate, IsDateString, IsNotEmpty } from "class-validator";

export class NewTaskDto {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    description: string;

    // Manually verified that the date can be parsed by the Date constructor
    dueDate?: Date ;

    @IsNotEmpty()
    userId: number;
}