import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { EditTaskDto } from '../dtos/edittask.dto';
// This validates the EditTaskDto to ensure it meets the required criteria
// The rules should be:
// - The task ID must be a positive integer (VAlidated by the router param)
// - The user ID must be a positive integer
// AND at least 1:
// - The title must be a non-empty string
// - The description must be a non-empty string
// - The due date must be a valid date in the future
// - The status must be either 'pending' or 'finished'
// Fields that are empty are ignored
// but at least one field must be updated
// and if a field is provided, it must be of the correct type

@Injectable()
export class ValidateEditTaskPipe implements PipeTransform {
    transform(value: EditTaskDto): EditTaskDto {
        // destructure the value to extract fields.
        const { taskId, userId, title, description, dueDate, status } = value;
        let errors: string[] = [];
        // Validate taskId and userId These are required.
        // taskId is validated by the router param
        if (!Number.isInteger(userId) || userId <= 0) {
            // IF userId is not a positive integer, there was 
            // a problem with the authentication middleware
            // at this point we should throw a proper error and not a BadRequestException
            // This should never happen
            console.error('Invalid userId:', userId);
            throw new Error('Error caught: Invalid userId this is an error on the authentication middleware and should never happen');
        }

        if (!title && !description && !dueDate && !status) {
            errors.push('At least one field must be updated: title, description, dueDate, or status');     
        }

        // Validate title
        if (title && typeof title !== 'string') {
            errors.push('Title must be a string');

        }

        // Validate description
        if (description && typeof description !== 'string') {
            errors.push('Description must be a string');
        }

        // Validate dueDate
        if (dueDate) {
            const parsedDueDate = new Date(dueDate);
            if (isNaN(parsedDueDate.getTime())) {
                errors.push('Due date must be a valid date string');
            }
            else if (parsedDueDate < new Date()) {
                errors.push('Due date cannot be in the past');
            } else {
                value.dueDate = parsedDueDate; // Ensure dueDate is a Date object
            }
        }

        // Validate status
        if (status && !['pending', 'finished'].includes(status)) {
            errors.push("Status must be either 'pending' or 'finished'");
        }
        // If there are any errors, throw a BadRequestException
        if (errors.length > 0) {
            throw new BadRequestException({
                message: errors,
                error: 'Bad Request',
                statusCode: 400,
            });
        }
        return value;

    }
}