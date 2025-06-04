import { IsDate, IsDateString, IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BasicBodyDto } from "src/common/dtos/basicbody.dto";
export class NewTaskDto extends BasicBodyDto {
    @ApiProperty({ description: 'Task\'s title.', example: 'Get things done.' })
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    @ApiProperty({ description: 'Task\'s description.', example: 'Do: fix small bug in the app.' })
    description: string;

    // Manually verified that the date can be parsed by the Date constructor
    @ApiPropertyOptional({ description: 'Task\'s due date (converted using js constructor).', example: '01/10/2100' })
    dueDate?: Date ;
}