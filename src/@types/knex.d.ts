import 'knex'

declare module 'knex/types/tables' {
    export interface Tables {
        users: {
            id: string
            email:string
            nickName: string
            created_at: string
            session_id?: string
        },
        meals: {
            id: string
            name: string
            description: string
            date_time: Date 
            is_in_diet: boolean | number
            user_id: string
            created_at: string
        }
    }
}