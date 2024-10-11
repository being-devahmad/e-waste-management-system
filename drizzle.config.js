export default {
    dialect: 'postgresql',
    schema: './utils/db/schema.ts',
    output: './drizzle',

    dbCredentials: {
        url: process.env.DB_URL,
        connectionString: process.env.DB_URL,
    }
}