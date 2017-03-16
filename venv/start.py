import sqlite3

conn = sqlite3.connect("User.db");

conn.execute('''create table user(
                id integer primary key autoincrement,
                name string not null,
                pw string not null
                )''');

conn.commit();
conn.close();