import sqlite3

con = sqlite3.connect("revalai.db")
cur = con.cursor()
cur.execute("UPDATE users SET email = 'meera.pillai@revalai.demo' WHERE name = 'Dr. Meera Pillai'")
con.commit()
print("Updated count:", cur.rowcount)
rows = cur.execute("SELECT id, name, email, role, department FROM users WHERE role = 'evaluator'").fetchall()
for r in rows:
    print(r)
con.close()

