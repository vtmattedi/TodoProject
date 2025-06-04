// Thrown when there is an error validating or processing a refresh token.
export class RefreshTokenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RegistrationError';
        Object.setPrototypeOf(this, RefreshTokenError.prototype);
    }
}