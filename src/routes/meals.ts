import { FastifyInstance, FastifyRequest } from "fastify";
import { z } from 'zod'
import { knex } from "../database";
import { randomUUID } from "crypto";
import { countBestSequence } from "../middlewares/countBestSequence";

export const mealsRoutes = async (app: FastifyInstance) => {
    app.post('/meals', async (request, reply) => {
        const createMealsBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            date_time: z.string().refine((date) => !isNaN(Date.parse(date)), {
                message: 'Invalid date format'
            }),
            is_in_diet: z.boolean(),
        })

        const { name, description, date_time, is_in_diet } = createMealsBodySchema.parse(request.body)

        const sessionId = request.cookies.sessionId

        if(!sessionId) {
            return reply.status(400).send({ error: 'Session ID is required'})
        }

        const user = await knex('users').where({ session_id: sessionId }).first()

        if(!user){
            return reply.status(404).send({ error: 'User not found'})
        }

        await knex('meals').insert({
            id: randomUUID(),
            name,
            description,
            date_time: new Date(date_time),
            is_in_diet: is_in_diet,
            user_id: user.session_id,
        })

        return reply.status(201).send()
    })

    app.get('/meals', async (request) => {
        const { sessionId } = request.cookies
        
        const meals = await knex('meals').where('user_id', sessionId)

        return { meals }
    })

    app.get('/meals/resume', async (request) => {
        const { sessionId } = request.cookies
        
        const meals = await knex('meals').where('user_id', sessionId)

        let inDiet = 0
        let notDiet = 0
        meals.filter(i => i.is_in_diet === 1 ? inDiet++ : notDiet++).length

        const total = meals.length

        const bestSequence = (await countBestSequence(meals)).length

        return { 
            "Total Registration": total,
            "Within the diet": inDiet,
            "Off the diet": notDiet,
            "Best sequence within the diet": bestSequence  
        }
    })

    app.get('/meals/:id', async (request) => {
        const getMealsParamsSchema = z.object({
            id: z.string().uuid()
        })

        const { sessionId } = request.cookies
        const { id } = getMealsParamsSchema.parse(request.params)
        
        const meals = await knex('meals').where({
            'user_id': sessionId,
            id
        })

        return { meals }
    })

    app.put('/meals/:id', async (request, reply) => {
        const updateMealsBodySchema = z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            date_time: z.string().optional().refine((date) => 
                !isNaN(Date.parse(date as string)), 
                {
                    message: 'Invalid date format'
                }
            ),
            is_in_diet: z.boolean().optional(),
        })

        const updateMealsParamsSchema = z.object({
            id: z.string().uuid()
        })

        const { name, description, date_time, is_in_diet } = updateMealsBodySchema.parse(request.body)

        const { id } = updateMealsParamsSchema.parse(request.params)

        const sessionId = request.cookies.sessionId

        if(!sessionId) {
            return reply.status(400).send({ error: 'Session ID is required'})
        }

        const user = await knex('users').where({ session_id: sessionId }).first()

        if(!user){
            return reply.status(404).send({ error: 'User not found'})
        }

        const meal = await knex('meals').where({ id, user_id: user.session_id }).first()

        if(!meal){
            return reply.status(404).send({ error: 'Meal not found'})
        }

        const updateMeal = {
            name: name ,
            description: description ?? meal.description,
            date_time: date_time ? new Date(date_time) : meal.date_time,
            is_in_diet: is_in_diet ?? meal.is_in_diet,
        }

        await knex('meals').where({id}).update(updateMeal)

        return reply.status(200).send(updateMeal)
    })

    app.delete('/meals/:id', async (request, reply) => {
        const getMealsParamsSchema = z.object({
            id: z.string().uuid()
        })

        const { sessionId } = request.cookies
        const { id } = getMealsParamsSchema.parse(request.params)
        
        if(!sessionId) {
            return reply.status(400).send({ error: 'Session ID is required'})
        }

        const user = await knex('users').where({ session_id: sessionId }).first()

        if(!user){
            return reply.status(404).send({ error: 'User not found'})
        }

        const meal = await knex('meals').where({ id, user_id: user.session_id }).first()

        if(!meal){
            return reply.status(404).send({ error: 'Meal not found'})
        }

        await knex('meals').where({ id }).del()

        return reply.status(204).send()
    })
} 