import { FastifyInstance } from 'fastify';
import { getUsers, createUser, deleteUser, modifyUser } from '../Controllers/UserController';

const userRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', getUsers);
    fastify.post('/', createUser);
    fastify.delete('/:id', deleteUser);
    fastify.put('/:id', modifyUser)
};

export default userRoutes;
