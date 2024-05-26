import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table) => {
        table.uuid('id').primary();
        table.text('name').notNullable();
        table.text('description').notNullable();
        table.timestamp('date_time').notNullable();
        table.boolean('is_in_diet').notNullable();
        table.uuid('user_id').notNullable().references('session_id').inTable('users').onDelete('CASCADE');
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('meals');
}


