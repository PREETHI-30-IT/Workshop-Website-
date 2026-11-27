const menuButton = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      navLinks.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

const workshopStorageKey = "hayaswa-workshop-details";
const defaultWorkshop = {
  name: "WORKSHOP",
  date: "2026-12-05",
  time: "09:00"
};

function loadWorkshop() {
  try {
    return { ...defaultWorkshop, ...JSON.parse(localStorage.getItem(workshopStorageKey) || "{}") };
  } catch {
    return { ...defaultWorkshop };
  }
}

let workshop = loadWorkshop();

function parseWorkshopDateTime() {
  return new Date(`${workshop.date}T${workshop.time || "09:00"}:00`);
}

function formatDate(date, options) {
  return new Intl.DateTimeFormat("en-GB", options).format(date);
}

function applyWorkshopDetails() {
  const dateTime = parseWorkshopDateTime();
  if (Number.isNaN(dateTime.getTime())) return;

  const displayName = workshop.name.trim().toUpperCase() || defaultWorkshop.name;
  const displayDate = formatDate(dateTime, { day: "2-digit", month: "long", year: "numeric" });
  const fullDate = formatDate(dateTime, { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const displayTime = formatDate(dateTime, { hour: "numeric", minute: "2-digit", hour12: true });

  document.querySelector("#workshop-name").textContent = displayName;
  document.querySelector("#workshop-year").textContent = String(dateTime.getFullYear());
  document.querySelector("#workshop-date").textContent = displayDate;
  document.querySelector("#workshop-date-time").textContent = `${fullDate} · Program begins at ${displayTime}`;
  document.querySelector("#workshop-date-time").dateTime = `${workshop.date}T${workshop.time}`;
  document.querySelector("#countdown").setAttribute("aria-label", `Countdown to ${displayName} ${dateTime.getFullYear()}`);
  document.querySelector("#footer-copyright").textContent = `© ${dateTime.getFullYear()} HAYASWA ACADEMIC`;
  document.title = `HAYASWA ACADEMIC '${String(dateTime.getFullYear()).slice(-2)} | Applied AI & Computational Research ${displayName}`;

  document.querySelector("#workshop-name-input").value = workshop.name;
  document.querySelector("#workshop-date-input").value = workshop.date;
  document.querySelector("#workshop-time-input").value = workshop.time;
}

const workshopDialog = document.querySelector("#workshop-dialog");
const workshopEditor = document.querySelector("#workshop-editor");
const workshopStatus = document.querySelector("#workshop-editor-status");

document.querySelector("#open-workshop-editor")?.addEventListener("click", () => {
  workshopStatus.textContent = "";
  workshopDialog.showModal();
});

document.querySelector("#close-workshop-editor")?.addEventListener("click", () => {
  workshopDialog.close();
});

workshopEditor?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(workshopEditor);
  const name = String(formData.get("name") || "").trim();
  const date = String(formData.get("date") || "");
  const time = String(formData.get("time") || "");

  if (!name || !date || !time) {
    workshopStatus.textContent = "Please complete every workshop field.";
    return;
  }

  workshop = { name, date, time };
  localStorage.setItem(workshopStorageKey, JSON.stringify(workshop));
  applyWorkshopDetails();
  updateCountdown();
  workshopStatus.textContent = "Workshop details saved.";
  window.setTimeout(() => workshopDialog.close(), 250);
});

document.querySelector("#reset-workshop")?.addEventListener("click", () => {
  workshop = { ...defaultWorkshop };
  localStorage.removeItem(workshopStorageKey);
  applyWorkshopDetails();
  updateCountdown();
  workshopStatus.textContent = "Default workshop details restored.";
});

applyWorkshopDetails();

function updateCountdown() {
  const countdown = document.querySelector("#countdown");
  if (!countdown) return;

  const workshopDate = parseWorkshopDateTime();
  if (Number.isNaN(workshopDate.getTime())) return;
  const remaining = workshopDate.getTime() - Date.now();
  if (remaining <= 0) {
    countdown.innerHTML = '<p class="countdown-finished">The workshop is underway. Welcome!</p>';
    return;
  }

  if (!document.getElementById("countdown-days")) {
    countdown.innerHTML = `
      <div><strong id="countdown-days">00</strong><span>Days</span></div>
      <div><strong id="countdown-hours">00</strong><span>Hours</span></div>
      <div><strong id="countdown-minutes">00</strong><span>Minutes</span></div>
      <div><strong id="countdown-seconds">00</strong><span>Seconds</span></div>
    `;
  }

  const units = {
    "countdown-days": Math.floor(remaining / 86400000),
    "countdown-hours": Math.floor((remaining / 3600000) % 24),
    "countdown-minutes": Math.floor((remaining / 60000) % 60),
    "countdown-seconds": Math.floor((remaining / 1000) % 60)
  };

  Object.entries(units).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value).padStart(2, "0");
  });
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

const registrationForm = document.querySelector("#registration-form");

if (registrationForm) {
  const fields = Array.from(registrationForm.querySelectorAll("input, select"));
  const status = document.querySelector("#form-status");

  function validateField(field) {
    const error = document.getElementById(`${field.id}-error`);
    const value = field.value.trim();
    let message = "";

    if (!value) {
      message = "Please complete this field.";
    } else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      message = "Enter a valid email address.";
    }

    field.classList.toggle("invalid", Boolean(message));
    field.setAttribute("aria-invalid", String(Boolean(message)));
    if (error) error.textContent = message;
    return !message;
  }

  fields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.classList.contains("invalid")) validateField(field);
    });
    field.addEventListener("change", () => {
      if (field.classList.contains("invalid")) validateField(field);
    });
  });

  registrationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    status.classList.remove("error-status");

    const isValid = fields.map(validateField).every(Boolean);
    if (!isValid) {
      status.textContent = "Please correct the highlighted fields before submitting.";
      status.classList.add("error-status");
      registrationForm.querySelector(".invalid")?.focus();
      return;
    }

    const attendeeName = registrationForm.elements.name.value.trim();
    status.textContent = `Thank you, ${attendeeName}. Your interest has been recorded for this demo.`;
    registrationForm.reset();
    fields.forEach((field) => {
      field.classList.remove("invalid");
      field.removeAttribute("aria-invalid");
    });
  });
}
