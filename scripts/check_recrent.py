import sqlite3
conn = sqlite3.connect('backend/sql_app.db')
rows = conn.execute("SELECT id, name FROM products WHERE name LIKE '%Recrent%'").fetchall()
for r in rows:
    print(r)
conn.close()
