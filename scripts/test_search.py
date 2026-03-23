import sqlite3
conn = sqlite3.connect('backend/sql_app.db')

# Проверяем все товары
all_products = conn.execute("SELECT id, name FROM products").fetchall()
print(f"Всего товаров: {len(all_products)}")
for p in all_products:
    print(p)

print()

# Проверяем поиск ilike
search = conn.execute(
    "SELECT id, name FROM products WHERE LOWER(name) LIKE '%recrent%'"
).fetchall()
print(f"По поиску 'recrent': {len(search)}")
for p in search:
    print(p)

conn.close()
