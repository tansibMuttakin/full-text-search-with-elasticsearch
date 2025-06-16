import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import csv from "csv-parser";
import sql from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load the csv file
const csvFilePath = path.resolve(__dirname, "synthetic_online_retail_data.csv");

// create the table
(async () => {
  try {
    await sql`CREATE TABLE IF NOT EXISTS products (
        customer_id INT,
        order_date DATE,
        product_id INT,
        category_id INT,
        category_name VARCHAR(255),
        product_name VARCHAR(255),
        quantity INT,
        price FLOAT,
        payment_method VARCHAR(255),
        city VARCHAR(255),
        review_score FLOAT,
        gender VARCHAR(255),
        age INT
      )`;
  } catch (error) {
    console.log(error);
  }
})();

let products = [];

// Read and insert data
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on("data", (row) => {
    const sanitizedRow = {};

    for (const col in row) {
      sanitizedRow[col] = sanitizeValue(col, row[col]);
    }

    products.push(sanitizedRow);
  })
  .on("end", async () => {
    await insertData(products);
    await sql.end(); // gracefully close connection pool
    console.log("Data inserted successfully.");
    process.exit(0);
  });

const insertData = async (rows) => {
  if (rows.length == 0) {
    return new Error("No rows to insert");
  }

  try {
    await sql`INSERT INTO products ${sql(products)}`;
  } catch (error) {
    console.log(error);
  }
};

const sanitizeValue = (col, val) => {
  const value = val?.trim();

  // If value is empty or undefined, treat it as null
  if (!value) return null;

  // Handle specific types
  if (
    [
      "customer_id",
      "category_id",
      "quantity",
      "price",
      "review_score",
      "age",
    ].includes(col)
  ) {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  if (col === "order_date") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0]; // 'YYYY-MM-DD'
  }

  return value; // Return string for text columns
};
