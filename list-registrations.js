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
    const regs = await client.query("SELECT * FROM client_registrations;");
    console.log("Client Registrations in database:", regs.rows);
    await client.end();
}
main().catch(console.error);
//# sourceMappingURL=list-registrations.js.map