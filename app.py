from flask import Flask, render_template, request, redirect
import sqlite3

app = Flask(__name__)

# Database connection
def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn


# Home Page
@app.route('/')
def home():
    return render_template('index.html')


# Pet Registration
@app.route('/register_pet', methods=['GET', 'POST'])
def register_pet():
    if request.method == 'POST':
        conn = get_db_connection()

        # get form data
        pet_name = request.form['name']
        species = request.form['species']
        owner_name = request.form['owner']
        phone = request.form['phone']

        # split owner name safely
        parts = owner_name.split(" ", 1)
        first = parts[0]
        last = parts[1] if len(parts) > 1 else ""

        # insert owner
        conn.execute(
            "INSERT INTO OWNERS (first_name, last_name, phone) VALUES (?, ?, ?)",
            (first, last, phone)
        )

        # get owner_id
        owner_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]

        # insert pet
        conn.execute(
            "INSERT INTO PETS (owner_id, name, species) VALUES (?, ?, ?)",
            (owner_id, pet_name, species)
        )

        conn.commit()
        conn.close()

        return redirect('/')

    return render_template('register_pet.html')


# Appointment Scheduling
@app.route('/appointments', methods=['GET', 'POST'])
def appointments():
    conn = get_db_connection()

    if request.method == 'POST':
        pet_id = request.form['pet_id']
        appt_date = request.form['date']
        status = request.form['status']

        conn.execute(
            "INSERT INTO appointments (pet_id, staff_id, appt_date, status) VALUES (?, ?, ?, ?)",
            (pet_id, 1, appt_date, status)
        )
        conn.commit()

    pets = conn.execute("SELECT pet_id, name FROM PETS").fetchall()

    appointments = conn.execute("SELECT * FROM appointments").fetchall()
    conn.close()

    return render_template('appointments.html', pets=pets, appointments=appointments)


# Medical Records
@app.route('/records', methods=['GET', 'POST'])
def records():
    conn = get_db_connection()

    data = conn.execute("""
        SELECT 
            p.pet_id,
            p.name AS pet_name,
            p.species,
            o.first_name || ' ' || o.last_name AS owner_name,
            o.phone,
            a.appt_date,
            a.status AS appt_status,
            b.amount,
            b.status AS billing_status
        FROM PETS p
        LEFT JOIN OWNERS o ON p.owner_id = o.owner_id
        LEFT JOIN APPOINTMENTS a ON p.pet_id = a.pet_id
        LEFT JOIN BILLING b ON a.appt_id = b.appt_id
        """).fetchall()

    conn.close()

    return render_template('records.html', records=records)


# Billing
@app.route('/billing', methods=['GET', 'POST'])
def billing():
    conn = get_db_connection()

    if request.method == 'POST':
        pet_id = request.form['pet_id']
        amount = request.form['amount']
        status = request.form['status']

        conn.execute(
            "INSERT INTO billing (pet_id, amount, status) VALUES (?, ?, ?)",
            (pet_id, amount, status)
        )
        conn.commit()

    bills = conn.execute("SELECT * FROM billing").fetchall()
    conn.close()

    return render_template('billing.html', bills=bills)


if __name__ == '__main__':
    app.run(debug=True)
