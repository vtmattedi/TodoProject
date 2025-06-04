import { Body, Controller, Get, Post, Req, Res, Delete, Put, Param, ParseIntPipe, Query } from '@nestjs/common';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Response } from 'express';
import { count } from 'console';
import { NewTaskDto } from './dtos/newtask.dto';
import { EditTaskDto } from './dtos/edittask.dto';
import { BasicBodyDto } from 'src/common/dtos/basicbody.dto';
import { Validator } from 'class-validator';
import { ValidateEditTaskPipe } from './pipes/validateEditTask.pipe';
import { DbMissSyncError } from './errors/dbmisssync.error';
import { ApiBearerAuth } from '@nestjs/swagger';
import { TaskReturnDto } from './dtos/taskreturn.dto';
import { ValidateTaskFilterPipe } from './pipes/validateTaskFilter.pipe';
import { TaskFilterDto } from './dtos/taskfilter.dto';
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
        if (error instanceof DbMissSyncError) {
            //This is a fatal error we (porb.) should not recover
            // This means that:
            // 1. we called tasksService.amIOwner and it did not throw
            // any errors AND THEN:
            // 2. we called some other method that modifies the task but the task was not in the db.
            // This is either because of some1 externally modifying the database
            // or we did not properly verify the task exists before modifying it
            console.warn('Task asserted in the database was modified.', error);
            throw error; // Rethrow the error to be handled by the global exception filter
        }
        console.warn('An unexpected error occurred:', error);
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
    @UsePipes()
    async updateTask(@Param('id', ParseIntPipe) taskId: number, @Body(new ValidateEditTaskPipe()) body: any): Promise<TaskReturnDto> {
        console.log('Updating task with ID:', taskId, 'for user ID:', body.userId);
        try {
            await this.tasksService.amIOwner(taskId, body.userId);// Check if the user can modify the task
            console.log('Updating task with ID:', taskId, 'for user ID:', body.userId);
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
    async getdeletedTasks(@Body() body: any): Promise<any> {
        const res = await this.tasksService.findDeletedByUserId(body.userId);
        return {
            count: res.length,
            data: res,
        }
    }

    // Delete a task by its ID (soft delete)
    @Delete(':id')
    @UsePipes(new ValidationPipe())
    async deleteTask(@Param('id', ParseIntPipe) taskId: any, @Body() body: BasicBodyDto): Promise<any> {
        try {
            await this.tasksService.amIOwner(taskId, body.userId);// Check if the user can modify the task
            // After ^ we know that task exists and user is the owner of the task and it is not deleted
            console.log('Deleting task with ID:', taskId);
            const deleted = await this.tasksService.softDelete(taskId);
            return {
                message: 'Task deleted successfully',
                count: deleted.affected,
            }
        }
        catch (error) {
            console.warn('Failed to delete task:', taskId, 'for user ID:', body.userId);
            this.defaulErrorHandler(error);
        }
    }

    @Put('restore/:id')
    async restoreTask(@Param('id', ParseIntPipe) taskId: number, @Body() body: BasicBodyDto): Promise<any> {
        console.log('Restoring task with ID:', taskId, 'for user ID:', body.userId);
        await this.tasksService.amIOwner(taskId, body.userId, true); // Check if the user can restore the task
        // After ^ we know that task exists and user is the owner of the task
        try {
            const restored = await this.tasksService.restore(taskId);
            return {
                message: 'Task restored successfully',
                count: restored.affected,
            }
        }
        catch (error) {
            console.warn('Failed to restore task:', taskId, 'for user ID:', body.userId);
            this.defaulErrorHandler(error);
        }

    }

}
