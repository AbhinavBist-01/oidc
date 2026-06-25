"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./src/db");
const schema_1 = require("./src/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
async function main() {
    const users = await db_1.db
        .select()
        .from(schema_1.usersTable)
        .where((0, drizzle_orm_1.eq)(schema_1.usersTable.email, "test@test.in"))
        .limit(1);
    console.log("Drizzle user query output:", users[0]);
}
main().catch(console.error);
//# sourceMappingURL=test-drizzle.js.map