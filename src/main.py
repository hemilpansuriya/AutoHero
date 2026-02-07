from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

app = FastAPI()

# this allows your website to talk to your API(CORS)
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


def get_db_connection():
    conn = sqlite3.connect("src/autohero.db")
    conn.row_factory = sqlite3.Row  # this returns data as a dictionary
    return conn


@app.get("/inventory")
def get_inventory():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inventory")
    rows = cursor.fetchall()
    conn.close()

    # convert SQL rows into a list of dictionaries from JSON
    return [dict(row) for row in rows]


# specific route for just cars or just bikes
@app.get("/inventory/{v_type}")
def get_by_type(
    v_type: str,
    limit: int = 10,
    skip: int = 0,
    brand: Optional[str] = None,
    year: Optional[int] = None,
    max_price: Optional[float] = None,
    max_km: Optional[float] = None,
):
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Build the Filter string
    query_filter = "WHERE vehicle_type = ?"
    params = [v_type]

    if brand:
        query_filter += " AND brand LIKE ?"
        params.append(f"%{brand}%")
    if year:
        query_filter += " AND year = ?"
        params.append(year)
    if max_price:
        query_filter += " AND price <= ?"
        params.append(max_price)
    if max_km:
        query_filter += " AND odometer <= ?"
        params.append(max_km)

    # 2. Get the TOTAL COUNT for these filters (Crucial for the counter!)
    count_query = f"SELECT COUNT(*) FROM inventory {query_filter}"
    cursor.execute(count_query, params)
    total_count = cursor.fetchone()[0]

    # 3. Get the actual DATA
    data_query = f"SELECT * FROM inventory {query_filter} LIMIT ? OFFSET ?"
    cursor.execute(data_query, params + [limit, skip])
    rows = cursor.fetchall()
    conn.close()

    # Return as an object so the frontend knows the total
    return {"total": total_count, "results": [dict(row) for row in rows]}


if __name__ == "__main__":
    import uvicorn
    import os

    # Azure sets a specific "PORT" environment variable; we must use it!
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
