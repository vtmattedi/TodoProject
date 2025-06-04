
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult, IsNull, Not } from 'typeorm';
import { Task } from 'src/model/entities/tasks.entity';
import { EditTaskDto } from './dtos/edittask.dto';
import { NewTaskDto } from './dtos/newtask.dto';
import { DbMissSyncError } from './errors/dbmisssync.error';
import { TaskFilterDto } from './dtos/taskfilter.dto';
@Injectable()

export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
    ) { }
    // Find all tasks for a specific user, ordered by creation date
    findAllByUserId(uid: number): Promise<Task[]> {
        return this.tasksRepository.find(
            {
                where: {
                    userId: uid,
                    deletedAt: IsNull()  // Ensures we only get tasks that are not soft-deleted

                },
                order: { createdAt: 'DESC' }
            });
    }

    findAllByUserIdAndStatus(uid: number, status: 'pending' | 'finished'): Promise<Task[]> {
        return this.tasksRepository.find(
            {
                where: {
                    userId: uid,
                    status: status, // Filter by status
                    deletedAt: IsNull()  // Ensures we only get tasks that are not soft-deleted

                },
                order: { createdAt: 'DESC' }
            });
    }

    // Find a task by its ID
    findOne(id: number): Promise<Task | null> {
        return this.tasksRepository.findOneBy({ id });
    }

    // Check if the user is the owner of the task
    // If:
    // - The task does not exist, throws a 404 error
    // - The task is soft-deleted and allowSoftDelete is false, throws a 403 error
    // - The userId does not match the task's userId, throws a 403 error
    // - The Id's match returns without any errors
    async amIOwner(id: number, userId: number, allowSoftDeleted: boolean = false): Promise<void> {
        const task = await this.tasksRepository.findOneBy({ id: id });
        console.log('amIOwner called with taskId:', id, 'and userId:', userId);
        if (!task) {
            throw new HttpException({
                message: ['Task not found'],
                statusCode: HttpStatus.NOT_FOUND,
                error: 'Not Found',
            }, HttpStatus.NOT_FOUND); // Handle the case where the task does not exist
        }
        else if (!allowSoftDeleted && task.deletedAt !== null) {
            throw new HttpException({
                message: ['You are not authorized to modify this task'],
                statusCode: HttpStatus.FORBIDDEN,
                error: 'Forbidden',
            }, HttpStatus.FORBIDDEN);
        }
        else if (task.userId !== userId) {
            throw new HttpException({
                message: ['You are not authorized to modify this task'],
                statusCode: HttpStatus.FORBIDDEN,
                error: 'Forbidden',
            }, HttpStatus.FORBIDDEN);
        }
        return;
    }

    // Soft delete a task by setting deletedAt to the current date
    async softDelete(id: number): Promise<UpdateResult> {
        return this.tasksRepository.update({
            id: id,
        },
            {
                deletedAt: new Date(), // Ensure we only update tasks that are not already soft-deleted
            });
        //TODO:
        // Clean up the task if it is deleted longer than 30 days

    }

    // Finds all soft-deleted tasks for a specific user
    async findDeletedByUserId(uid: number): Promise<Task[]> {
        return this.tasksRepository.find({
            where: { userId: uid, deletedAt: Not(IsNull()) }, // Find tasks that are soft-deleted

        })
    }
    // Restore a soft-deleted task by setting deletedAt to null
    async restore(id: number): Promise<UpdateResult> {
        return this.tasksRepository.update({
            id: id,
        },
            {
                deletedAt: null, // Ensure we only update tasks that are not already soft-deleted
            });
    }
    // Create a new task with the provided data
    // This should include the userId of the user creating the task
    async create(taskData: NewTaskDto): Promise<Task> {
        const task = new Task();
        task.title = taskData.title;
        task.description = taskData.description;
        task.userId = taskData.userId; // Assuming userId is passed in taskData
        if (taskData.dueDate) {
            task.dueDate = taskData.dueDate; // Optional field
        }

        return this.tasksRepository.save(task);
    }

    // Update an existing task with the provided data
    async update(taskDto: EditTaskDto): Promise<Task> {
        const task = await this.findOne(taskDto.taskId);
        // by calling amIOwner we ensure that the task exists and the user is the owner
        if (!task) {
            // At this point throw a regular error
            // not an HttpException
            throw new DbMissSyncError('Updating task with ID ' + taskDto.taskId + ' and Owner ID ' + taskDto.userId);
        }
        // Only makes sense if at least one field is being updated
        if (taskDto.title)
            task.title = taskDto.title
        if (taskDto.dueDate)
            task.dueDate = taskDto.dueDate;
        if (taskDto.description)
            task.description = taskDto.description;
        if (taskDto.status)
            task.status = taskDto.status;

        // Task already exists, so save will update the existing task
        // Useful since we may be updating only one field at a time
        return this.tasksRepository.save(task);
    }
}

