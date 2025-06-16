import postgres from "postgres";

const sql = postgres({
  host: "db",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "postgres",
});

export default sql;
