import { FastifyRequest, FastifyReply } from 'fastify';
import { getAllUsers, addUser, removeUser, editUser } from '../Services/UserService';
import { User, UserParams } from '../Interfaces';

export const createUser = async (request: FastifyRequest<{ Body: User }>, reply: FastifyReply) => {
    const user = await addUser(request.body);
    reply.status(201).send(user);
};

export const deleteUser = async (request: FastifyRequest<{ Params: UserParams }>, reply: FastifyReply) => {
    const { id } = request.params;
    await removeUser(Number(id));
    reply.status(204).send();
};

export const modifyUser = async (request: FastifyRequest<{ Params: UserParams; Body: User }>, reply: FastifyReply) => {
    const { id } = request.params;
    await editUser(Number(id), request.body);
    reply.status(204).send();
};

export const getUsers = async (request: FastifyRequest, reply: FastifyReply) => {
    const users = await getAllUsers();
    reply.send(users);
};
