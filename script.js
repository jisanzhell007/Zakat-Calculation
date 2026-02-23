const screens = {
  intro: document.getElementById("intro-screen"),
  question: document.getElementById("question-screen"),
  summary: document.getElementById("summary-screen"),
};

const startBtn = document.getElementById("start-btn");
const backBtn = document.getElementById("back-btn");
const nextBtn = document.getElementById("next-btn");
const editFlowBtn = document.getElementById("edit-flow-btn");
const recalculateBtn = document.getElementById("recalculate-btn");

const questionTitle = document.getElementById("question-title");
const questionDescription = document.getElementById("question-description");
const questionExample = document.getElementById("question-example");
const inputWrap = document.getElementById("input-wrap");
const progressText = document.getElementById("progress-text");
const progressBar = document.getElementById("progress-bar");
const summaryGrid = document.getElementById("summary-grid");
const resultBox = document.getElementById("result-box");

const questions = [
  {
    id: "zakatTime",
    type: "select",
    title: "When do you usually give your Zakat?",
    description:
      "Choose a usual period as a reminder point for your annual zakat cycle. This does not replace formal fiqh rulings.",
    example: "Example: Many people prefer Ramadan, Eid al-Fitr period, or a personal fixed date.",
    options: [
      "Ramadan / Eid al-Fitr period",
      "Beginning of Islamic year",
      "Around Eid al-Adha",
      "Specific date (choose below)",
    ],
  },
  {
    id: "zakatDate",
    type: "date",
    title: "If you use a specific date, what date do you follow?",
    description:
      "Optional. Pick the date you use each year to review your zakatable assets after one lunar cycle.",
    example: "Example: 15 Sha'ban equivalent or a regular Gregorian date for reminder purposes.",
  },
  {
    id: "cash",
    type: "number",
    title: "How much cash and bank balance do you currently have?",
    description: "Include checking, savings, and easily accessible cash.",
    example: "Example: $4,000 in checking + $6,000 in savings = $10,000.",
  },
  {
    id: "gold",
    type: "number",
    title: "What is the current market value of your gold?",
    description: "Include zakatable personal or investment gold according to your fiqh opinion.",
    example: "Example: 50g gold × market price per gram.",
  },
  {
    id: "silver",
    type: "number",
    title: "What is the current market value of your silver?",
    description: "Include all zakatable silver assets.",
    example: "Example: 300g silver × market price per gram.",
  },
  {
    id: "investments",
    type: "number",
    title: "What is the zakatable portion of your investments?",
    description: "Include liquid investments and tradable assets considered zakatable.",
    example: "Example: stocks/funds set aside for growth and accessible value.",
  },
  {
    id: "businessAssets",
    type: "number",
    title: "What are your business assets for Zakat?",
    description: "Include inventory, receivables expected to be collected, and business cash.",
    example: "Example: inventory value + receivables due this cycle.",
  },
  {
    id: "debts",
    type: "number",
    title: "What short-term debts/liabilities can be deducted?",
    description: "Enter immediate, due liabilities relevant to your Zakat calculation approach.",
    example: "Example: due bills, payable invoices, and short-term obligations.",
  },
  {
    id: "nisab",
    type: "number",
    title: "What nisab threshold would you like to apply?",
    description:
      "Set your preferred nisab benchmark. Many choose a value based on current 85g gold or 595g silver value.",
    example: "Example: Enter a calculated nisab such as 5000.",
    defaultValue: 5000,
  },
];

const state = {
  step: 0,
  answers: {
    zakatTime: "Ramadan / Eid al-Fitr period",
    zakatDate: "",
    cash: 0,
    gold: 0,
    silver: 0,
    investments: 0,
    businessAssets: 0,
    debts: 0,
    nisab: 5000,
  },
};

function currency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[name].classList.add("active");
}

function createInput(question) {
  if (question.type === "select") {
    const select = document.createElement("select");
    select.id = question.id;
    question.options.forEach((item) => {
      const option = document.createElement("option");
      option.value = item;
      option.textContent = item;
      select.append(option);
    });
    select.value = state.answers[question.id];
    return select;
  }

  const input = document.createElement("input");
  input.id = question.id;
  input.type = question.type;

  if (question.type === "number") {
    input.min = "0";
    input.step = "0.01";
    input.placeholder = "0.00";
    input.value = state.answers[question.id] || question.defaultValue || 0;
  }

  if (question.type === "date") {
    input.value = state.answers[question.id] || "";
  }

  return input;
}

function readInput(question, input) {
  if (question.type === "number") {
    const value = Number.parseFloat(input.value);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  return input.value;
}

function renderStep() {
  const question = questions[state.step];
  const total = questions.length;

  questionTitle.textContent = question.title;
  questionDescription.textContent = question.description;
  questionExample.textContent = question.example;
  progressText.textContent = `Question ${state.step + 1} of ${total}`;
  progressBar.style.width = `${((state.step + 1) / total) * 100}%`;

  inputWrap.innerHTML = "";
  const input = createInput(question);
  inputWrap.append(input);

  backBtn.disabled = state.step === 0;
  nextBtn.textContent = state.step === total - 1 ? "See Summary" : "Next";
}

function saveCurrentStep() {
  const question = questions[state.step];
  const input = document.getElementById(question.id);
  state.answers[question.id] = readInput(question, input);
}

function calculate() {
  const totalAssets =
    state.answers.cash +
    state.answers.gold +
    state.answers.silver +
    state.answers.investments +
    state.answers.businessAssets;

  const net = Math.max(totalAssets - state.answers.debts, 0);
  const due = net * 0.025;
  const eligible = net >= state.answers.nisab;

  return { totalAssets, net, due, eligible };
}

function renderSummary() {
  const rows = [
    ["Zakat period", state.answers.zakatTime],
    ["Specific reminder date", state.answers.zakatDate || "Not specified"],
    ["Cash & bank", state.answers.cash, "cash"],
    ["Gold value", state.answers.gold, "gold"],
    ["Silver value", state.answers.silver, "silver"],
    ["Investments", state.answers.investments, "investments"],
    ["Business assets", state.answers.businessAssets, "businessAssets"],
    ["Debts", state.answers.debts, "debts"],
    ["Nisab threshold", state.answers.nisab, "nisab"],
  ];

  summaryGrid.innerHTML = "";

  rows.forEach(([label, value, key]) => {
    const row = document.createElement("div");
    row.className = "summary-row";

    const labelEl = document.createElement("label");
    labelEl.textContent = label;

    let field;
    if (key) {
      field = document.createElement("input");
      field.type = "number";
      field.min = "0";
      field.step = "0.01";
      field.value = String(value);
      field.dataset.key = key;
      field.addEventListener("input", (event) => {
        const numeric = Number.parseFloat(event.target.value);
        state.answers[key] = Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
      });
    } else {
      field = document.createElement("p");
      field.className = "plain";
      field.textContent = String(value);
    }

    row.append(labelEl, field);
    summaryGrid.append(row);
  });

  const calc = calculate();

  resultBox.className = calc.eligible ? "result good" : "result warn";
  resultBox.innerHTML = `
    <p><strong>Total assets:</strong> ${currency(calc.totalAssets)}</p>
    <p><strong>Net zakatable wealth:</strong> ${currency(calc.net)}</p>
    <p><strong>Nisab used:</strong> ${currency(state.answers.nisab)}</p>
    <p><strong>Zakat due (2.5%):</strong> ${calc.eligible ? currency(calc.due) : "$0.00"}</p>
    <p>${
      calc.eligible
        ? "Your net wealth is above nisab, so Zakat is due."
        : "Your net wealth is below nisab, so Zakat is not due in this estimate."
    }</p>
  `;
}

startBtn.addEventListener("click", () => {
  state.step = 0;
  renderStep();
  showScreen("question");
});

backBtn.addEventListener("click", () => {
  saveCurrentStep();
  state.step = Math.max(state.step - 1, 0);
  renderStep();
});

nextBtn.addEventListener("click", () => {
  saveCurrentStep();

  if (state.step === questions.length - 1) {
    renderSummary();
    showScreen("summary");
    return;
  }

  state.step += 1;
  renderStep();
});

editFlowBtn.addEventListener("click", () => {
  showScreen("question");
  renderStep();
});

recalculateBtn.addEventListener("click", renderSummary);
