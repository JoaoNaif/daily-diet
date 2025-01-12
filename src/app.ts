import fastify from "fastify";
import cookie from '@fastify/cookie'

import { usersRoutes } from "./routes/user";
import { mealsRoutes } from "./routes/meals";

export const app = fastify()

app.register(cookie)

app.register(usersRoutes)

app.register(mealsRoutes)