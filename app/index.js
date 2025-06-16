import express from "express";
import { client } from "./elasticClient.js";
const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/search", async (req, res) => {
  const {
    q, // Full-text search
    category, // Filter by category
    city, // Filter by city
    gender, // Filter by gender
    min_price, // Price filter
    max_price,
    sort_by = "price", // Sort field
    order = "asc", // asc / desc
    page = 1, // Pagination
    size = 10,
  } = req.query;

  const must = [];
  const filter = [];

  // Full-text search on product_name and category_name
  if (q) {
    must.push({
      multi_match: {
        query: q,
        fields: ["product_name", "category_name"],
        fuzziness: "AUTO",
      },
    });
  }

  // Filters
  if (category) filter.push({ term: { category_name: category } });
  if (city) filter.push({ term: { city } });
  if (gender) filter.push({ term: { gender } });
  if (min_price || max_price) {
    filter.push({
      range: {
        price: {
          gte: min_price ? Number(min_price) : undefined,
          lte: max_price ? Number(max_price) : undefined,
        },
      },
    });
  }

  const body = {
    query: {
      bool: {
        must,
        filter,
      },
    },
    from: (page - 1) * size,
    size: Number(size),
    sort: [{ [sort_by]: { order } }],
    aggs: {
      category_counts: { terms: { field: "category_name.keyword", size: 10 } },
      city_counts: { terms: { field: "city.keyword", size: 10 } },
      gender_counts: { terms: { field: "gender.keyword", size: 10 } },
    },
  };

  try {
    const { body: result } = await client.search({
      index: "products",
      body,
    });

    res.json({
      total: result.hits.total.value,
      hits: result.hits.hits.map((hit) => hit._source),
      facets: {
        categories: result.aggregations.category_counts.buckets,
        cities: result.aggregations.city_counts.buckets,
        genders: result.aggregations.gender_counts.buckets,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});
