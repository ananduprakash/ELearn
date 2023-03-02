/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('course_students', (table) => {
    table.integer('course_id')
    .references('id')
    .inTable('courses');
    table.integer('student_id')
    .references('id')
    .inTable('users');
    table.timestamps(true, true);
});
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('course_students');
}
