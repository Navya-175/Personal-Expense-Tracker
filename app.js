const STORAGE_KEY = "personal-expense-tracker-v1";
const form = document.getElementById("expenseForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const list = document.getElementById("expenseList");
const filter = document.getElementById("filterCategory");
const message = document.getElementById("formMessage");

const today = new Date();
dateInput.value = today.toISOString().slice(0, 10);
let expenses = loadExpenses();

function loadExpenses() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}
function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}
function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
}
function render() {
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const monthKey = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0");
  const monthTotal = expenses.filter(item => item.date.startsWith(monthKey))
    .reduce((sum, item) => sum + item.amount, 0);
  document.getElementById("totalAmount").textContent = money(total);
  document.getElementById("monthAmount").textContent = money(monthTotal);
  document.getElementById("transactionCount").textContent = expenses.length;

  const selected = filter.value;
  const visible = expenses.filter(item => selected === "All" || item.category === selected)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

  list.replaceChildren();
  if (!visible.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = expenses.length ? "No expenses in this category." : "No expenses yet. Add your first expense.";
    list.append(empty);
    return;
  }
  const icons = {Food:"🍽️",Travel:"🚕",Shopping:"🛍️",Bills:"🧾",Health:"💊",Other:"📌"};
  visible.forEach(item => {
    const row = document.createElement("article");
    row.className = "expense-item";
    const main = document.createElement("div");
    main.className = "expense-main";
    const icon = document.createElement("span");
    icon.className = "category-icon";
    icon.textContent = icons[item.category] || "📌";
    const details = document.createElement("div");
    const name = document.createElement("div");
    name.className = "expense-title";
    name.textContent = item.title;
    const meta = document.createElement("div");
    meta.className = "expense-meta";
    meta.textContent = item.category + " · " + item.date;
    details.append(name, meta);
    main.append(icon, details);

    const side = document.createElement("div");
    side.className = "expense-side";
    const amount = document.createElement("div");
    amount.className = "expense-amount";
    amount.textContent = money(item.amount);
    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.type = "button";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", "Delete " + item.title);
    remove.addEventListener("click", () => {
      expenses = expenses.filter(expense => expense.id !== item.id);
      saveExpenses();
      render();
    });
    side.append(amount, remove);
    row.append(main, side);
    list.append(row);
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  if (!title || !Number.isFinite(amount) || amount <= 0 || !dateInput.value) {
    message.textContent = "Enter a description, valid amount and date.";
    return;
  }
  expenses.push({
    id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
    title,
    amount: Math.round(amount * 100) / 100,
    category: categoryInput.value,
    date: dateInput.value,
    createdAt: Date.now()
  });
  saveExpenses();
  form.reset();
  dateInput.value = today.toISOString().slice(0, 10);
  message.textContent = "Expense added successfully.";
  render();
  titleInput.focus();
});
filter.addEventListener("change", render);
render();
