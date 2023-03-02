/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  
    return Promise.all([
     knex.schema.createTable('users', (table) => {
        table.increments('id')
        .primary();
        table.string('name')
        .notNullable();
        table.string('email')
        .unique()
        .notNullable();
        table.string('password')
        .notNullable();
        table.timestamp('created_at')
        .defaultTo(knex.fn.now());
    }),

    knex.schema.createTable('roles', (table) => {
        table.increments('id')
        .primary();
        table.string('name')
        .notNullable();
        table.timestamp('created_at')
        .defaultTo(knex.fn.now());
    }),

    knex.schema.createTable('users_roles', (table) => {
        table.integer('user_id')
        .primary()
        .references('id')
        .inTable('users');
        table.integer('role_id')
        .references('id')
        .inTable('roles');
        table.timestamps(true, true);
    }),

    knex.schema.createTable('courses', (table) => {
        table.increments('id')
        .primary();
        table.string('name')
        .notNullable();
        table.integer('teacher_id')
        .references('id')
        .inTable('users');
        table.timestamp('created_at')
        .defaultTo(knex.fn.now());
    }),

    knex.schema.createTable('schedule', (table) => {
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
    }),

    knex.schema.createTable('students_schedule', (table) => {
        table.integer('student_id')
        .references('id')
        .inTable('users');
        table.uuid('schedule_id')
        .references('id')
        .inTable('schedule');
        table.timestamps(true, true);
    })
])
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
    return Promise.all([
        knex.schema.dropTable('students_schedule'),
        knex.schema.dropTable('schedule'),
        knex.schema.dropTable('courses'),
        knex.schema.dropTable('users_roles'),
        knex.schema.dropTable('roles'),
        knex.schema.dropTable('users'),
    ])
}
