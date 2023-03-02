/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
    return knex.schema.createTable('schedule', (table) => {
        table.increments('id')
        .primary();
        table.integer('course_id')
        .references('id')
        .inTable('courses');
        table.date('date')
        .notNullable();
        table.time('start_time')
        .notNullable();
        table.time('end_time')
        .notNullable();
        table.timestamps(true, true);
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
    return knex.schema.dropTable('schedule');
}
