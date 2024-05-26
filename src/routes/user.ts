import { FastifyInstance } from "fastify";
import { z } from 'zod' 
import { knex } from "../database";
import { randomUUID } from "crypto";

export const usersRoutes = async (app: FastifyInstance) => {
    app.post('/users', async (request, reply) => {
        const createUsersBodySchema = z.object({
            email: z.string().email(),
            nickName: z.string()
        })

        const { email, nickName } = createUsersBodySchema.parse(request.body)

        let sessionId = request.cookies.sessionId

        if(!sessionId){
            sessionId = randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            })
        }

        await knex('users').insert({
            id: randomUUID(),
            email,
            nickName,
            session_id: sessionId
        })

        return reply.status(201).send()
    })

    app.get('/users', async () => {
        const users = await knex('users').select('*')

        let total = users.length

        return { users , total }
    })
} 