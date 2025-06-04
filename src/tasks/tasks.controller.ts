import { Body, Controller, Get, Post, Req, Res, Delete, Put, Param, ParseIntPipe, Query } from '@nestjs/common';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Response } from 'express';
import { NewTaskDto } from './dtos/newtask.dto';
import { ValidateEditTaskPipe } from './pipes/validateEditTask.pipe';
import { DbMissSyncError } from './errors/dbmisssync.error';
import { ApiBearerAuth, ApiBody, ApiParam, ApiProperty } from '@nestjs/swagger';
import { TaskReturnDto } from './dtos/taskreturn.dto';
import { ValidateTaskFilterPipe } from './pipes/validateTaskFilter.pipe';
import { TaskFilterDto } from './dtos/taskfilter.dto';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { BadResults } from 'src/common/decorators/badresponse.decorator';
import { BadTaskAccessResult } from 'src/common/decorators/taskaccess.decorator';
import { TaskDeleteDto } from './dtos/taskdelete.dto';
import { EditTaskDto } from './dtos/edittask.dto';
//Controller for managing tasks
@Controller('tasks')
@ApiBearerAuth()
export class TasksController {
    constructor(private tasksService: TasksService) { // Replace 'any' with the actual type of your task service
        // Inject the task service
    }

    // this is a default error handler for the controller
    // Kept using it in every method so might as well make it a method
    // It will let NestJS handle HttpExceptions thrown by the service
    // and log any other unexpected errors
    // custom error handling should be done here (for the whole controller)
    // or before calling this method
    defaulErrorHandler(error: any): void {
        if (error instanceof HttpException) {
            // If an HttpException is thrown, re-throw it
            throw error;
        }
        if (process.env.LOG_ROUTING_ERRORS === 'true') {
            // If we want to log non HttpExceptions
            // This is useful for debugging purposes
            console.error(error);
        }
        if (error instanceof DbMissSyncError ) {
            //This is a fatal error we (porb.) should not recover
            // This means that:
            // 1. we called tasksService.amIOwner and it did not throw
            // any errors AND THEN:
            // 2. we called some other method that modifies the task but the task was not in the db.
            // This is either because of some1 externally modifying the database IN BETWEEN our calls
            // or we did not properly verify the task exists before modifying it
            console.warn('Task asserted in the database was modified.', error);
            throw error; // Rethrow the error to be handled by the global exception filter
        }
        console.warn('An unexpected error occurred:', error.constructor.name);
        if (process.env.DONT_RECOVER_FROM_ERROR === 'true') {
            // If we do not want to recover from the error
            // rethrow it
            throw error;
        }

        throw new HttpException({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'An unexpected error occurred',
        }, HttpStatus.INTERNAL_SERVER_ERROR);

    }

    // Returns all tasks for a specific user ; Soft deleted tasks are not returned
    // If a query is provided with a status, it will return only tasks with that status
    // if a bad status is provided, it will be ignored
    @Get()
    @ApiOperation({ summary: 'Gets all tasks.', description: 'Gets all tasks of the current user (expect deleted ones).' })
    @ApiBearerAuth()
    @BadResults()
    @ApiQuery({
        name: 'status',
        description: 'Filter tasks by status. If not provided or invalid status, all tasks will be returned.',
        example: 'finished',
        required: false,
        type: String,
        enum: ['pending', 'finished'],
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'The user\'s tasks.' })
    @UsePipes()
    async getTasks(@Body() body: { userId: number }, @Query(new ValidateTaskFilterPipe()) query: TaskFilterDto): Promise<TaskReturnDto> {
        try {
            const tasks = query ? await this.tasksService.findAllByUserIdAndStatus(body.userId, query.status)
                : await this.tasksService.findAllByUserId(body.userId);
            return {
                count: tasks.length,
                data: tasks,
            }
        }
        catch (error) {
            this.defaulErrorHandler(error);
        }

    }

    // Creates a new task
    @Post()
    @ApiOperation({ summary: 'Creates a new Task.', description: 'Create a new Task with the data in the body of the request if dueDate is not present it will be set to null, representing no due date, However if it is present it must not be in the past.' })
    @ApiBearerAuth()
    @BadResults()
    @ApiQuery({
        name: 'status',
        description: 'Filter tasks by status. If not provided or invalid status, all tasks will be returned.',
        example: 'finished',
        required: false,
        type: String,
        enum: ['pending', 'finished'],
    })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'The created task.', type: TaskReturnDto })
    @UsePipes(new ValidationPipe())
    async createTask(@Body() body: NewTaskDto, @Res({ passthrough: true }) response: Response): Promise<TaskReturnDto> {
        // Lazy validation of dueDate
        // A invalid date will be set to null Which in turn means the task will not have a due date
        const dueDate = !isNaN(Date.parse(String(body.dueDate))) ? new Date(body.dueDate) : null;
        // If the due date is in the past, throw a BAD_REQUEST
        if (dueDate && dueDate < new Date()) {
            throw new HttpException({
                message: ['Due date cannot be in the past'],
                error: 'Bad Request',
                statusCode: HttpStatus.BAD_REQUEST,
            }, HttpStatus.BAD_REQUEST);
        }
        try {
            const task = await this.tasksService.create({ ...body, dueDate: dueDate });
            console.log('Task created with ID:', task.id, 'from user ID:', task.userId);
            response.status(HttpStatus.CREATED); // Set the response status to 201 Created
            return { count: 1, data: [task] };
        }
        catch (error) {
            console.warn('Error creating task. Task data:', { ...body, dueDate: dueDate });
            this.defaulErrorHandler(error);
        }

    }

    // Edit a task by its ID
    @Put(':id')
    @ApiOperation({ summary: 'Edits an existing task.', description: 'Edits the task with id provided in the path and the new values as the request body. You only need to pass what you want to update but at least one field must be present. If the user does not own the task, it is marked as deleted or the task does not exists it will return an error.' })
    @ApiBearerAuth()
    @BadTaskAccessResult()
    @ApiParam({
        name: 'id',
        description: 'The ID of the task to update.',
        example: 1,
        required: true,
        type: Number,
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'The edited task.', type: TaskReturnDto })
    @UsePipes()
    async updateTask(@Param('id', ParseIntPipe) taskId: number, @Body(new ValidateEditTaskPipe()) body: EditTaskDto): Promise<TaskReturnDto> {
        console.log('Updating task with ID:', taskId, 'for user ID:', body.userId);
        try {
            await this.tasksService.amIOwner(taskId, body.userId);// Check if the user can modify the task
            // At this point we know:
            // 1. The taskId is a valid number
            // 2. The task exists
            // 3. The user is the owner of the task
            // 4. At least one field is being updated
            // 5. The task has not been marked as deleted 
            const updatedTask = await this.tasksService.update({ ...body, taskId: taskId });
            return {
                count: 1,
                data: [updatedTask],
            }

        }
        catch (error) {
            console.warn('Error updating task');
            this.defaulErrorHandler(error);
        }

    }
    // Returns all tasks that are soft-deleted for a specific user
    @Get('deleted')
    @ApiOperation({ summary: 'Gets the deleted tasks.', description: 'Gets all deleted tasks by the user.' })
    @ApiBearerAuth()
    @BadTaskAccessResult()
    @ApiResponse({ status: HttpStatus.OK, description: 'The deleted tasks.', type: TaskReturnDto })
    async getdeletedTasks(@Body() body: { userId: number }): Promise<TaskReturnDto> {
        const res = await this.tasksService.findDeletedByUserId(body.userId);
        return {
            count: res.length,
            data: res,
        }
    }

    // Delete a task by its ID (soft delete)
    @Delete(':id')
    @ApiOperation({ summary: 'Deletes an existing task.', description: 'Edits the task with id provideded in the path. ' })
    @ApiBearerAuth()
    @BadTaskAccessResult()
    @ApiParam({
        name: 'id',
        description: 'The ID of the task to delete.',
        example: 1,
        required: true,
        type: Number,
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'The deleted task.', type: TaskDeleteDto })
    @UsePipes(new ValidationPipe())
    async deleteTask(@Param('id', ParseIntPipe) taskId: number, @Body() body: { userId: number }): Promise<TaskDeleteDto> {
        try {
            await this.tasksService.amIOwner(taskId, body.userId);// Check if the user can modify the task
            // After ^ we know that task exists and user is the owner of the task and it is not deleted
            console.log('Deleting task with ID:', taskId);
            const deleted = await this.tasksService.softDelete(taskId);
            return {
                message: `Task with ID: ${taskId} has been deleted.`,
                count: deleted.affected,
            }
        }
        catch (error) {
            console.warn('Failed to delete task:', taskId, 'for user ID:', body.userId);
            this.defaulErrorHandler(error);
        }
    }

    @Put('restore/:id')
    @ApiOperation({ summary: 'Restores a deleted task.', description: 'Restores a deleted task by the task ID provided in the path. If the Task was not deleted if has no effect.' })
    @ApiBearerAuth()
    @BadTaskAccessResult()
    @ApiParam({
        name: 'id',
        description: 'The ID of the task to delete.',
        example: 1,
        required: true,
        type: Number,
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'The deleted task.', type: TaskDeleteDto })
    async restoreTask(@Param('id', ParseIntPipe) taskId: number, @Body() body: { userId: number }): Promise<TaskDeleteDto> {
        console.log('Restoring task with ID:', taskId, 'for user ID:', body.userId);
        try {
            await this.tasksService.amIOwner(taskId, body.userId, true); // Check if the user can restore the task
            // After ^ we know that task exists and user is the owner of the task
            const restored = await this.tasksService.restore(taskId);
            return {
                message: `Task with ID: ${taskId} has been restored.`,
                count: restored.affected,
            }
        }
        catch (error) {
            console.warn('Failed to restore task:', taskId, 'for user ID:', body.userId);
            this.defaulErrorHandler(error);
        }

    }

}
