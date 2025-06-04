export class DbMissSyncError extends Error {
    constructor( where: string) {
        const message = 'We did not find a Task on the Database that we had assert it was there. Task was there on amIOwner and it is not here.';
        super(message);
        this.name = 'DbMissSyncError';
        Object.setPrototypeOf(this, DbMissSyncError.prototype);
    }
}