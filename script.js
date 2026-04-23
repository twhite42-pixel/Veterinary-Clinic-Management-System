const STORAGE_KEYS = {
  patients: "vetcare_patients",
  appointments: "vetcare_appointments",
  bills: "vetcare_bills",
  medical: "vetcare_medical"
};

function getPatients() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.patients)) || [];
}

function getAppointments() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.appointments)) || [];
}

function getBills() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.bills)) || [];
}

function getMedicalRecords() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.medical)) || [];
}

function savePatients(patients) {
  localStorage.setItem(STORAGE_KEYS.patients, JSON.stringify(patients));
}

function saveAppointments(appointments) {
  localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(appointments));
}

function saveBills(bills) {
  localStorage.setItem(STORAGE_KEYS.bills, JSON.stringify(bills));
}

function saveMedicalRecords(records) {
  localStorage.setItem(STORAGE_KEYS.medical, JSON.stringify(records));
}

function populatePatientDropdowns() {
  const patients = getPatients();
  const apptSelect = document.getElementById("apptPetSelect");
  const billSelect = document.getElementById("billPetSelect");

  if (!apptSelect || !billSelect) return;

  apptSelect.innerHTML = '<option value="">Choose a patient</option>';
  billSelect.innerHTML = '<option value="">Choose a patient</option>';

  patients.forEach((patient) => {
    const label = `${patient.petName} - ${patient.ownerName}`;

    const apptOption = document.createElement("option");
    apptOption.value = patient.id;
    apptOption.textContent = label;
    apptSelect.appendChild(apptOption);

    const billOption = document.createElement("option");
    billOption.value = patient.id;
    billOption.textContent = label;
    billSelect.appendChild(billOption);
  });
}

function getLatestAppointment(patientId) {
  const appointments = getAppointments().filter((a) => a.patientId === patientId);
  return appointments.length ? appointments[appointments.length - 1] : null;
}

function getLatestBill(patientId) {
  const bills = getBills().filter((b) => b.patientId === patientId);
  return bills.length ? bills[bills.length - 1] : null;
}

function getMedicalRecordByPatientId(patientId) {
  const medicalRecords = getMedicalRecords();
  return medicalRecords.find((record) => record.patientId === patientId) || null;
}

function isValidAppointmentTime(time) {
  return time >= "06:00" && time <= "19:00";
}

function isTimeSlotTaken(date, time) {
  const appointments = getAppointments();

  return appointments.some((appointment) => {
    return (
      appointment.date === date &&
      appointment.time === time &&
      appointment.status !== "Cancelled" &&
      appointment.status !== "No Appointment"
    );
  });
}

function calculateRemainingBalance(totalAmount, amountPaid) {
  const total = parseFloat(totalAmount) || 0;
  const paid = parseFloat(amountPaid) || 0;
  return Math.max(total - paid, 0).toFixed(2);
}

function determineInvoiceStatus(totalAmount, amountPaid) {
  const total = parseFloat(totalAmount) || 0;
  const paid = parseFloat(amountPaid) || 0;

  if (paid <= 0) return "Unpaid";
  if (paid >= total) return "Paid";
  return "Partially Paid";
}

function renderRecords(list) {
  const table = document.getElementById("recordsTable");
  if (!table) return;

  table.innerHTML = "";

  if (list.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="9">No patient records found.</td>
      </tr>
    `;
    return;
  }

  list.forEach((patient) => {
    const latestAppointment = getLatestAppointment(patient.id);
    const latestBill = getLatestBill(patient.id);

    const appointmentText = latestAppointment
      ? `${latestAppointment.date || "-"} ${latestAppointment.time || ""}`.trim()
      : "No appointment";

    const billText = latestBill
      ? `${latestBill.serviceType || "Service"} - $${latestBill.amount || "0.00"} | Balance: $${latestBill.remainingBalance || "0.00"}`
      : "No invoice";

    const appointmentDropdown = `
      <select onchange="updateAppointmentStatus(${patient.id}, this.value)">
        <option value="No Appointment" ${!latestAppointment || latestAppointment?.status === "No Appointment" ? "selected" : ""}>No Appointment</option>
        <option value="Scheduled" ${latestAppointment?.status === "Scheduled" ? "selected" : ""}>Scheduled</option>
        <option value="Checked In" ${latestAppointment?.status === "Checked In" ? "selected" : ""}>Checked In</option>
        <option value="Cancelled" ${latestAppointment?.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
        <option value="No Show" ${latestAppointment?.status === "No Show" ? "selected" : ""}>No Show</option>
        <option value="In Progress" ${latestAppointment?.status === "In Progress" ? "selected" : ""}>In Progress</option>
        <option value="Completed" ${latestAppointment?.status === "Completed" ? "selected" : ""}>Completed</option>
      </select>
    `;

    const invoiceDropdown = `
      <select onchange="updateInvoiceStatus(${patient.id}, this.value)">
        <option value="No Invoice" ${!latestBill || latestBill?.invoiceStatus === "No Invoice" ? "selected" : ""}>No Invoice</option>
        <option value="Unpaid" ${latestBill?.invoiceStatus === "Unpaid" ? "selected" : ""}>Unpaid</option>
        <option value="Paid" ${latestBill?.invoiceStatus === "Paid" ? "selected" : ""}>Paid</option>
        <option value="Partially Paid" ${latestBill?.invoiceStatus === "Partially Paid" ? "selected" : ""}>Partially Paid</option>
        <option value="Cancelled" ${latestBill?.invoiceStatus === "Cancelled" ? "selected" : ""}>Cancelled</option>
      </select>
    `;

    table.innerHTML += `
      <tr>
        <td>${patient.petName}</td>
        <td>${patient.petType}</td>
        <td>${patient.ownerName}</td>
        <td>${patient.ownerPhone}</td>
        <td>${appointmentText}</td>
        <td>${appointmentDropdown}</td>
        <td>${billText}</td>
        <td>${invoiceDropdown}</td>
        <td><a class="table-link-btn" href="medical.html?id=${patient.id}">Open</a></td>
      </tr>
    `;
  });
}

function updateAppointmentStatus(patientId, newStatus) {
  const appointments = getAppointments();
  let appointment = appointments.filter((a) => a.patientId === patientId).pop();

  if (newStatus === "No Appointment") {
    if (!appointment) {
      appointments.push({
        id: Date.now(),
        patientId,
        date: "",
        time: "",
        doctor: "",
        reason: "",
        status: "No Appointment"
      });
    } else {
      appointment.status = "No Appointment";
    }

    saveAppointments(appointments);
    refreshPages();
    return;
  }

  if (!appointment) {
    appointment = {
      id: Date.now(),
      patientId,
      date: "",
      time: "",
      doctor: "",
      reason: "",
      status: newStatus
    };
    appointments.push(appointment);
  } else {
    appointment.status = newStatus;
  }

  saveAppointments(appointments);
  refreshPages();
}

function updateInvoiceStatus(patientId, newStatus) {
  const bills = getBills();
  let bill = bills.filter((b) => b.patientId === patientId).pop();

  if (newStatus === "No Invoice") {
    if (!bill) {
      bills.push({
        id: Date.now(),
        patientId,
        serviceType: "",
        amount: "0.00",
        amountPaid: "0.00",
        remainingBalance: "0.00",
        paymentMethod: "",
        invoiceStatus: "No Invoice"
      });
    } else {
      bill.invoiceStatus = "No Invoice";
    }

    saveBills(bills);
    refreshPages();
    return;
  }

  if (!bill) {
    bill = {
      id: Date.now(),
      patientId,
      serviceType: "",
      amount: "0.00",
      amountPaid: "0.00",
      remainingBalance: "0.00",
      paymentMethod: "",
      invoiceStatus: newStatus
    };
    bills.push(bill);
  } else {
    bill.invoiceStatus = newStatus;
  }

  saveBills(bills);
  refreshPages();
}

function updateDashboard() {
  const totalPatients = document.getElementById("totalPatients");
  const totalAppointments = document.getElementById("totalAppointments");
  const completedCount = document.getElementById("completedCount");
  const unpaidCount = document.getElementById("unpaidCount");

  if (!totalPatients || !totalAppointments || !completedCount || !unpaidCount) return;

  const patients = getPatients();
  const appointments = getAppointments();
  const bills = getBills();

  totalPatients.textContent = patients.length;
  totalAppointments.textContent = appointments.filter(a => a.status !== "No Appointment").length;
  completedCount.textContent = appointments.filter((a) => a.status === "Completed").length;
  unpaidCount.textContent = bills.filter((b) => b.invoiceStatus === "Unpaid").length;
}

function searchRecords() {
  const input = document.getElementById("searchInput");
  const message = document.getElementById("recordMessage");
  if (!input) return;

  const search = input.value.trim().toLowerCase();
  const patients = getPatients();

  if (search === "") {
    renderRecords(patients);
    if (message) {
      message.textContent = "Please enter a pet name or owner phone number to search.";
      message.style.color = "red";
    }
    return;
  }

  const filteredPatients = patients.filter((patient) =>
    patient.petName.toLowerCase().includes(search) ||
    patient.ownerPhone.toLowerCase().includes(search)
  );

  renderRecords(filteredPatients);

  if (message) {
    if (filteredPatients.length > 0) {
      message.textContent = "Showing search results for: " + input.value.trim();
      message.style.color = "#16a34a";
    } else {
      message.textContent = "No records found.";
      message.style.color = "red";
    }
  }
}

function showAllRecords() {
  const patients = getPatients();
  const input = document.getElementById("searchInput");
  const message = document.getElementById("recordMessage");

  renderRecords(patients);

  if (input) input.value = "";
  if (message) message.textContent = "";
}

function refreshPages() {
  updateDashboard();
  const recordsTable = document.getElementById("recordsTable");
  if (recordsTable) {
    renderRecords(getPatients());
  }
}

function setupBillingAutoCalc() {
  const amountInput = document.getElementById("amount");
  const amountPaidInput = document.getElementById("amountPaid");
  const remainingBalanceInput = document.getElementById("remainingBalance");
  const invoiceStatusSelect = document.getElementById("invoiceStatus");

  if (!amountInput || !amountPaidInput || !remainingBalanceInput || !invoiceStatusSelect) return;

  function updateBalanceFields() {
    const totalAmount = amountInput.value;
    const amountPaid = amountPaidInput.value;

    remainingBalanceInput.value = calculateRemainingBalance(totalAmount, amountPaid);
    invoiceStatusSelect.value = determineInvoiceStatus(totalAmount, amountPaid);
  }

  amountInput.addEventListener("input", updateBalanceFields);
  amountPaidInput.addEventListener("input", updateBalanceFields);
}

function setupIndexPage() {
  const petForm = document.getElementById("petForm");
  const appointmentForm = document.getElementById("appointmentForm");
  const billingForm = document.getElementById("billingForm");
  const apptPetSelect = document.getElementById("apptPetSelect");
  const billPetSelect = document.getElementById("billPetSelect");

  if (petForm) {
    petForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const patients = getPatients();
      const patient = {
        id: Date.now(),
        petName: document.getElementById("petName").value.trim(),
        petType: document.getElementById("petType").value.trim(),
        breed: document.getElementById("breed").value.trim(),
        age: document.getElementById("age").value.trim(),
        ownerName: document.getElementById("ownerName").value.trim(),
        ownerPhone: document.getElementById("ownerPhone").value.trim()
      };

      const alreadyExists = patients.some((p) =>
        p.petName.toLowerCase() === patient.petName.toLowerCase() &&
        p.ownerPhone === patient.ownerPhone
      );

      const message = document.getElementById("petMessage");

      if (alreadyExists) {
        if (message) {
          message.textContent = "This patient is already registered.";
          message.style.color = "red";
        }
        return;
      }

      patients.push(patient);
      savePatients(patients);
      populatePatientDropdowns();
      updateDashboard();

      if (message) {
        message.textContent = "Patient registered successfully.";
        message.style.color = "#16a34a";
      }

      this.reset();
    });
  }

  if (apptPetSelect) {
    apptPetSelect.addEventListener("change", function () {
      const patient = getPatients().find((p) => p.id == this.value);
      document.getElementById("apptOwnerPhone").value = patient ? patient.ownerPhone : "";
    });
  }

  if (billPetSelect) {
    billPetSelect.addEventListener("change", function () {
      const patient = getPatients().find((p) => p.id == this.value);
      document.getElementById("billOwnerPhone").value = patient ? patient.ownerPhone : "";
    });
  }

  if (appointmentForm) {
    appointmentForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const patientId = document.getElementById("apptPetSelect").value;
      const date = document.getElementById("apptDate").value;
      const time = document.getElementById("apptTime").value;
      const message = document.getElementById("appointmentMessage");

      if (!patientId) {
        if (message) {
          message.textContent = "Please select a patient first.";
          message.style.color = "red";
        }
        return;
      }

      if (!isValidAppointmentTime(time)) {
        if (message) {
          message.textContent = "Appointments must be scheduled between 6:00 AM and 7:00 PM only.";
          message.style.color = "red";
        }
        return;
      }

      if (isTimeSlotTaken(date, time)) {
        if (message) {
          message.textContent = "That time is already booked for that day. Please choose another available time.";
          message.style.color = "red";
        }
        return;
      }

      const appointments = getAppointments();
      appointments.push({
        id: Date.now(),
        patientId: Number(patientId),
        date: date,
        time: time,
        doctor: document.getElementById("doctor").value.trim(),
        reason: document.getElementById("reason").value.trim(),
        status: document.getElementById("apptStatus").value
      });

      saveAppointments(appointments);
      updateDashboard();

      if (message) {
        message.textContent = "Appointment scheduled successfully.";
        message.style.color = "#16a34a";
      }

      this.reset();
      document.getElementById("apptOwnerPhone").value = "";
    });
  }

  if (billingForm) {
    billingForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const patientId = document.getElementById("billPetSelect").value;
      const message = document.getElementById("billingMessage");
      const totalAmount = document.getElementById("amount").value.trim();
      const amountPaid = document.getElementById("amountPaid").value.trim();
      const remainingBalance = calculateRemainingBalance(totalAmount, amountPaid);
      const invoiceStatus = determineInvoiceStatus(totalAmount, amountPaid);

      if (!patientId) {
        if (message) {
          message.textContent = "Please select a patient first.";
          message.style.color = "red";
        }
        return;
      }

      const bills = getBills();
      bills.push({
        id: Date.now(),
        patientId: Number(patientId),
        serviceType: document.getElementById("serviceType").value.trim(),
        amount: totalAmount,
        amountPaid: amountPaid,
        remainingBalance: remainingBalance,
        paymentMethod: document.getElementById("paymentMethod").value,
        invoiceStatus: invoiceStatus
      });

      saveBills(bills);
      updateDashboard();

      if (message) {
        message.textContent = "Billing information saved successfully.";
        message.style.color = "#16a34a";
      }

      this.reset();
      document.getElementById("billOwnerPhone").value = "";
      document.getElementById("remainingBalance").value = "";
      document.getElementById("invoiceStatus").value = "Unpaid";
    });
  }

  populatePatientDropdowns();
  setupBillingAutoCalc();
  updateDashboard();
}

function renderMedicalPage() {
  const params = new URLSearchParams(window.location.search);
  const patientId = Number(params.get("id"));

  const petNameEl = document.getElementById("medicalPetName");
  const ownerNameEl = document.getElementById("medicalOwnerName");
  const ownerPhoneEl = document.getElementById("medicalOwnerPhone");
  const breedAgeEl = document.getElementById("medicalBreedAge");
  const medicalForm = document.getElementById("medicalForm");
  const summaryTable = document.getElementById("medicalSummaryTable");

  if (!petNameEl || !medicalForm || !summaryTable) return;

  const patients = getPatients();
  const patient = patients.find((p) => p.id === patientId);

  if (!patient) {
    petNameEl.textContent = "Patient not found";
    ownerNameEl.textContent = "-";
    ownerPhoneEl.textContent = "-";
    breedAgeEl.textContent = "-";
    summaryTable.innerHTML = `
      <tr>
        <td colspan="5">No medical record found.</td>
      </tr>
    `;
    return;
  }

  petNameEl.textContent = patient.petName;
  ownerNameEl.textContent = patient.ownerName;
  ownerPhoneEl.textContent = patient.ownerPhone;
  breedAgeEl.textContent = `${patient.breed || "-"} / ${patient.age || "-"}`;

  const medicalRecord = getMedicalRecordByPatientId(patientId);

  document.getElementById("medicalHistory").value = medicalRecord?.medicalHistory || "";
  document.getElementById("diagnosis").value = medicalRecord?.diagnosis || "";
  document.getElementById("treatmentPlan").value = medicalRecord?.treatmentPlan || "";
  document.getElementById("medication").value = medicalRecord?.medication || "";
  document.getElementById("dosage").value = medicalRecord?.dosage || "";

  renderMedicalSummary(patientId);

  medicalForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const medicalRecords = getMedicalRecords();
    const existingIndex = medicalRecords.findIndex((record) => record.patientId === patientId);

    const updatedRecord = {
      patientId,
      medicalHistory: document.getElementById("medicalHistory").value.trim(),
      diagnosis: document.getElementById("diagnosis").value.trim(),
      treatmentPlan: document.getElementById("treatmentPlan").value.trim(),
      medication: document.getElementById("medication").value.trim(),
      dosage: document.getElementById("dosage").value.trim()
    };

    if (existingIndex >= 0) {
      medicalRecords[existingIndex] = updatedRecord;
    } else {
      medicalRecords.push(updatedRecord);
    }

    saveMedicalRecords(medicalRecords);
    renderMedicalSummary(patientId);

    const message = document.getElementById("medicalMessage");
    if (message) {
      message.textContent = "Medical record saved successfully.";
      message.style.color = "#16a34a";
    }
  });
}

function renderMedicalSummary(patientId) {
  const summaryTable = document.getElementById("medicalSummaryTable");
  if (!summaryTable) return;

  const medicalRecord = getMedicalRecordByPatientId(patientId);

  if (!medicalRecord) {
    summaryTable.innerHTML = `
      <tr>
        <td colspan="5">No medical information saved yet.</td>
      </tr>
    `;
    return;
  }

  summaryTable.innerHTML = `
    <tr>
      <td>${medicalRecord.medicalHistory || "-"}</td>
      <td>${medicalRecord.diagnosis || "-"}</td>
      <td>${medicalRecord.treatmentPlan || "-"}</td>
      <td>${medicalRecord.medication || "-"}</td>
      <td>${medicalRecord.dosage || "-"}</td>
    </tr>
  `;
}

function setupRecordsPage() {
  if (document.getElementById("recordsTable")) {
    renderRecords(getPatients());
  }
}

document.addEventListener("DOMContentLoaded", function () {
  setupIndexPage();
  setupRecordsPage();
  renderMedicalPage();
  updateDashboard();
});