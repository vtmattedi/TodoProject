// Thrown when there is an error during login, such as invalid credentials or account issues.
export class LoginError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'LoginError';
        Object.setPrototypeOf(this, LoginError.prototype);
    }
}