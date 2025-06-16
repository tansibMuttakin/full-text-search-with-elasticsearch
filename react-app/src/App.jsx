import { useState } from "react";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:3000/search?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data.hits || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <h1>🔎 Product Search</h1>

      <form onSubmit={handleSearch} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Type your search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: "0.5rem", width: "70%" }}
        />
        <button
          type="submit"
          style={{ padding: "0.5rem 1rem", marginLeft: "0.5rem" }}
        >
          Search
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {results.map((item, idx) => (
          <li key={idx} style={{ marginBottom: "0.5rem" }}>
            <strong>{item.product_name}</strong> — <em>{item.category_name}</em>{" "}
            — ${item.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
