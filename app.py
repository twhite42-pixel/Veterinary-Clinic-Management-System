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
        name = request.form['name']
        species = request.form['species']
        owner = request.form['owner']

        conn = get_db_connection()
        conn.execute(
            "INSERT INTO pets (name, species, owner) VALUES (?, ?, ?)",
            (name, species, owner)
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
        pet = request.form['pet']
        date = request.form['date']

        conn.execute(
            "INSERT INTO appointments (pet, date) VALUES (?, ?)",
            (pet, date)
        )
        conn.commit()

    appointments = conn.execute("SELECT * FROM appointments").fetchall()
    conn.close()

    return render_template('appointments.html', appointments=appointments)


# Medical Records
@app.route('/records', methods=['GET', 'POST'])
def records():
    conn = get_db_connection()

    if request.method == 'POST':
        pet = request.form['pet']
        diagnosis = request.form['diagnosis']
        treatment = request.form['treatment']

        conn.execute(
            "INSERT INTO medical_records (pet, diagnosis, treatment) VALUES (?, ?, ?)",
            (pet, diagnosis, treatment)
        )
        conn.commit()

    records = conn.execute("SELECT * FROM medical_records").fetchall()
    conn.close()

    return render_template('records.html', records=records)


# Billing
@app.route('/billing', methods=['GET', 'POST'])
def billing():
    conn = get_db_connection()

    if request.method == 'POST':
        pet = request.form['pet']
        amount = request.form['amount']
        status = request.form['status']

        conn.execute(
            "INSERT INTO billing (pet, amount, status) VALUES (?, ?, ?)",
            (pet, amount, status)
        )
        conn.commit()

    bills = conn.execute("SELECT * FROM billing").fetchall()
    conn.close()

    return render_template('billing.html', bills=bills)


if __name__ == '__main__':
    app.run(debug=True)