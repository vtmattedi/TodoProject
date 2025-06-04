import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { TaskFilterDto } from '../dtos/taskfilter.dto';
// This validates a TaskFilterDto to ensure it meets the required criteria
// it can be empty, but if it has a status, it must be either 'pending' or 'finished'


@Injectable()
export class ValidateTaskFilterPipe implements PipeTransform {
    transform(value: TaskFilterDto): TaskFilterDto {
        const { status } = value;
        // Validate status
        if (status && !['pending', 'finished'].includes(status)) {
             value.status = undefined; // If status is invalid, remove it
             // We dont want to throw an error here, just ignore the invalid status
        }

        return value;

    }
}