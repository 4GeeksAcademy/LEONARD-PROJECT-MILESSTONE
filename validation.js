const form = document.getElementById("applicationForm");
const statusBox = document.getElementById("formStatus");
const clearButton = document.getElementById("clearFormButton");

const fields = [
  "requesterName",
  "department",
  "workEmail",
  "workPhone",
  "locationId",
  "countryMarket",
  "challengeType",
  "targetDate",
  "weeklyIncidents",
  "currentProcess",
  "expectedOutcome",
  "confirmData",
];

const patterns = {
  requesterName: /^[A-Za-zÀ-ÿ'\-\s]{3,80}$/,
  workPhone: /^\+?[0-9\s()-]{10,20}$/,
};

function getInput(id) {
  return document.getElementById(id);
}

function getErrorElement(id) {
  return document.getElementById(`${id}Error`);
}

function setError(id, message) {
  const input = getInput(id);
  const error = getErrorElement(id);

  if (!input || !error) {
    return;
  }

  error.textContent = message;
  input.setAttribute("aria-invalid", "true");
  input.classList.add("border-red-500", "ring-red-500");
  input.classList.remove("border-slate-300");
}

function clearError(id) {
  const input = getInput(id);
  const error = getErrorElement(id);

  if (!input || !error) {
    return;
  }

  error.textContent = "";
  input.setAttribute("aria-invalid", "false");
  input.classList.remove("border-red-500", "ring-red-500");
  if (!input.classList.contains("border-slate-300")) {
    input.classList.add("border-slate-300");
  }
}

function validateRequesterName() {
  const id = "requesterName";
  const value = getInput(id).value.trim();

  if (!value) {
    setError(id, "Full name is required.");
    return false;
  }

  if (!patterns.requesterName.test(value)) {
    setError(id, "Use at least 3 letters and only valid name characters.");
    return false;
  }

  clearError(id);
  return true;
}

function validateRequiredSelect(id, label) {
  const value = getInput(id).value;
  if (!value) {
    setError(id, `${label} is required.`);
    return false;
  }

  clearError(id);
  return true;
}

function validateWorkEmail() {
  const id = "workEmail";
  const value = getInput(id).value.trim();

  if (!value) {
    setError(id, "Work email is required.");
    return false;
  }

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  if (!validEmail) {
    setError(id, "Enter a valid email format, for example name@brasaland.com.");
    return false;
  }

  if (!/@brasaland\.(com|co)$/i.test(value)) {
    setError(id, "Use your Brasaland corporate email (@brasaland.com or @brasaland.co).");
    return false;
  }

  clearError(id);
  return true;
}

function validateWorkPhone() {
  const id = "workPhone";
  const value = getInput(id).value.trim();

  if (!value) {
    setError(id, "Work phone is required.");
    return false;
  }

  if (!patterns.workPhone.test(value)) {
    setError(id, "Enter a valid phone with country code and at least 10 digits.");
    return false;
  }

  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) {
    setError(id, "Phone must include at least 10 digits.");
    return false;
  }

  clearError(id);
  return true;
}

function validateTargetDate() {
  const id = "targetDate";
  const value = getInput(id).value;

  if (!value) {
    setError(id, "Target launch date is required.");
    return false;
  }

  const selectedDate = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    setError(id, "Target launch date cannot be in the past.");
    return false;
  }

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 180);

  if (selectedDate > maxDate) {
    setError(id, "Target launch date must be within the next 180 days.");
    return false;
  }

  clearError(id);
  return true;
}

function validateWeeklyIncidents() {
  const id = "weeklyIncidents";
  const input = getInput(id);
  const value = input.value.trim();

  if (!value) {
    setError(id, "Weekly incidents affected is required.");
    return false;
  }

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 1 || amount > 50000) {
    setError(id, "Weekly incidents must be a number between 1 and 50000.");
    return false;
  }

  clearError(id);
  return true;
}

function validateMinText(id, label, minLength) {
  const value = getInput(id).value.trim();

  if (!value) {
    setError(id, `${label} is required.`);
    return false;
  }

  if (value.length < minLength) {
    setError(id, `${label} must be at least ${minLength} characters.`);
    return false;
  }

  clearError(id);
  return true;
}

function validateConfirmData() {
  const id = "confirmData";
  const checked = getInput(id).checked;

  if (!checked) {
    setError(id, "You must confirm the request information before submitting.");
    return false;
  }

  clearError(id);
  return true;
}

function validateField(id) {
  switch (id) {
    case "requesterName":
      return validateRequesterName();
    case "department":
      return validateRequiredSelect(id, "Department");
    case "workEmail":
      return validateWorkEmail();
    case "workPhone":
      return validateWorkPhone();
    case "locationId":
      return validateRequiredSelect(id, "Location ID");
    case "countryMarket":
      return validateRequiredSelect(id, "Country market");
    case "challengeType":
      return validateRequiredSelect(id, "Challenge type");
    case "targetDate":
      return validateTargetDate();
    case "weeklyIncidents":
      return validateWeeklyIncidents();
    case "currentProcess":
      return validateMinText(id, "Current process and tools", 20);
    case "expectedOutcome":
      return validateMinText(id, "Expected business outcome", 20);
    case "confirmData":
      return validateConfirmData();
    default:
      return true;
  }
}

function validateForm() {
  let isValid = true;

  for (const id of fields) {
    const fieldIsValid = validateField(id);
    if (!fieldIsValid) {
      isValid = false;
    }
  }

  return isValid;
}

function showStatus(type, message) {
  statusBox.classList.remove("hidden", "border-red-300", "bg-red-50", "text-red-700", "border-emerald-300", "bg-emerald-50", "text-emerald-700");

  if (type === "error") {
    statusBox.classList.add("border-red-300", "bg-red-50", "text-red-700");
  } else {
    statusBox.classList.add("border-emerald-300", "bg-emerald-50", "text-emerald-700");
  }

  statusBox.textContent = message;
}

function clearStatus() {
  statusBox.textContent = "";
  statusBox.classList.add("hidden");
}

fields.forEach((id) => {
  const input = getInput(id);

  if (!input) {
    return;
  }

  const eventName = input.type === "checkbox" || input.tagName === "SELECT" ? "change" : "input";

  input.addEventListener(eventName, () => {
    validateField(id);
    clearStatus();
  });

  input.addEventListener("blur", () => {
    validateField(id);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearStatus();

  const isValid = validateForm();

  if (!isValid) {
    showStatus("error", "Please fix the highlighted fields before submitting this request.");

    const firstInvalid = fields.find((id) => getInput(id).getAttribute("aria-invalid") === "true");
    if (firstInvalid) {
      getInput(firstInvalid).focus();
    }

    return;
  }

  showStatus("success", "Application submitted successfully. Brasaland Digital will review your request.");
  form.reset();
  fields.forEach(clearError);
});

clearButton.addEventListener("click", () => {
  form.reset();
  fields.forEach(clearError);
  clearStatus();
});
