"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
require("dotenv/config");
async function main() {
    const client = new pg_1.Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();
    console.log("Connected to DB");
    // Check columns of sessions table
    const sessionsCols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'sessions';
  `);
    console.log("sessions columns:", sessionsCols.rows);
    // Check columns of authorization_codes table
    const authCodesCols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'authorization_codes';
  `);
    console.log("authorization_codes columns:", authCodesCols.rows);
    // Check drizzle migrations table
    try {
        const migrations = await client.query(`SELECT * FROM "__drizzle_migrations";`);
        console.log("drizzle migrations:", migrations.rows);
    }
    catch (e) {
        console.log("Could not query __drizzle_migrations table", e);
    }
    await client.end();
}
main().catch(console.error);
//# sourceMappingURL=check-db.js.map