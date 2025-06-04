// Thrown when there is an error related to the registration process, such as duplicate email or username.
export class RegisterError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RegistrationError';
        Object.setPrototypeOf(this, RegisterError.prototype);
    }
}