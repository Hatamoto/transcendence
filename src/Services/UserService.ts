import { initDB } from '../database';

// Function to get all users
export const getAllUsers = async () => {
    const db = await initDB();
    return db.all('SELECT * FROM users;');
};

// Function to add a user
export const addUser = async (user: { name: string; email: string }) => {
    const db = await initDB();
    const result = await db.run('INSERT INTO users (name, email) VALUES (?, ?)', [user.name, user.email]);
    return { id: result.lastID, ...user };
};

// Function to delete a user by ID
export const removeUser = async (id: number) => {
    const db = await initDB();
    return db.run('DELETE FROM users WHERE id = ?', [id]);
};

// Function to edit a user by ID
export const editUser = async (id: number, newUser: { name: string; email: string }) => {
    const db = await initDB();
    return db.run('UPDATE users SET user = ? WHERE id = ?', [newUser, id])
};