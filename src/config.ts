const { DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME, DATABASE_HOST, DATABASE_PORT, BOT_TOKEN } = process.env


if ( BOT_TOKEN === undefined || DATABASE_USERNAME === undefined || DATABASE_PASSWORD === undefined || DATABASE_NAME === undefined || DATABASE_HOST === undefined || DATABASE_PORT === undefined) {
    console.log('No ENV')
    process.exit(1)
}


export default {
    discord: {
        botToken: BOT_TOKEN
    },
    database: {
        username: DATABASE_USERNAME,
        password: DATABASE_PASSWORD,
        name: DATABASE_NAME,
        host: DATABASE_HOST,
        port: DATABASE_PORT
    }
}