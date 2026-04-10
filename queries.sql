-- VMS Sample Queries
--Demonstrates basic database operations

-- Retreive all pets for a specific owner
SELECT *
FROM PETS
WHERE owner_id = 1;

-- View appointments with pet and owner info
SELECT
  a.appt_id,
  p.name AS pet_name,
  o.first_name,
  o.last_name,
  a.appt_date,
  a.status
FROM APPOINTMENTS a
JOIN PETS p ON a.pet_id = p.pet_id
JOIN OWNERS o ON p.owner_id = o.owner_id;

-- Get upcoming appointments
SELECT *
FROM APPOINTMENTS
WHERE appt_dat >= CURRENT_DATE;

-- Add a new owner
INSERT INTO OWNERS (first_name, last_name, pphone, email, address)
VALUES ('John', 'Smith', '1234567890', 'john@email.com', '123 ABC St.');

--Mark bill as paid
UPDATE BILLING 
SET status = 'Paid'
WHERE payment_id = 1;

-- Delete an appointment
DELETE FROM APPOINTMENTS
WHERE appt_id = 1;
