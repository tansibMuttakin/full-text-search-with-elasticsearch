Full-text search with Elasticsearch

Project Overview

This project uses Docker Compose to orchestrate a web app, PostgreSQL database, Elasticsearch, and Logstash for full-text search. You will import CSV data into PostgreSQL as an initial step.

Prerequisites

•  Docker
•  Docker Compose

Getting Started

1. Clone the Repository

```bash 
git clone https://github.com/tansibMuttakin/full-text-search-with-elasticsearch.git
```

2. Run docker-compose

``` bash 
docker compose up -d --build --no-cache
```

3. Load data to postgresql from a csv file

``` bash 
docker compose exec -it app node data/import_data_to_postgres.js
```

4. Test search functionality in the UI
http://localhost:5173