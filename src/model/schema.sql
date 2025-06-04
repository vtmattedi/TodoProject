-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh Tokens table
CREATE TABLE refreshtokens (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL,
    token TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refreshtokens_user FOREIGN KEY (userId)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dueDate TIMESTAMP NULL DEFAULT NULL,
    status TEXT DEFAULT 'pending',
    userId INTEGER NOT NULL,
    deletedAt TIMESTAMP NULL DEFAULT NULL,

    CONSTRAINT fk_tasks_user FOREIGN KEY (userId)
        REFERENCES users(id)
        ON DELETE CASCADE
);