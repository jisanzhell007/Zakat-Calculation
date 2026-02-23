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

const OUNCE_TO_GRAMS = 31.1034768;
const DEFAULT_COUNTRIES = [
  { name: "United States", code: "US", currency: "USD" },
  { name: "United Kingdom", code: "GB", currency: "GBP" },
  { name: "Pakistan", code: "PK", currency: "PKR" },
  { name: "India", code: "IN", currency: "INR" },
  { name: "Saudi Arabia", code: "SA", currency: "SAR" },
  { name: "United Arab Emirates", code: "AE", currency: "AED" },
  { name: "Malaysia", code: "MY", currency: "MYR" },
  { name: "Canada", code: "CA", currency: "CAD" },
];

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
    id: "countryCode",
    type: "country",
    title: "What is your country of residence?",
    description:
      "We use this to apply your local currency and estimate nisab from live metal prices in that currency.",
    example: "Example: If you choose Pakistan, the app will present values in PKR.",
  },
  {
    id: "cash",
    type: "number",
    title: "How much cash and bank balance do you currently have?",
    description: "Include checking, savings, and easily accessible cash.",
    example: "Example: 4,000 in checking + 6,000 in savings = 10,000.",
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
    id: "nisabStandard",
    type: "select",
    title: "Choose your nisab standard",
    description:
      "Select one standard only: 85g of gold or 595g of silver. The threshold is auto-calculated from live market prices.",
    example: "Example: Many calculators allow choosing either the gold standard or silver standard.",
    options: ["85g gold", "595g silver"],
  },
];

const state = {
  step: 0,
  countries: DEFAULT_COUNTRIES,
  answers: {
    zakatTime: "Ramadan / Eid al-Fitr period",
    zakatDate: "",
    countryCode: "US",
    cash: 0,
    gold: 0,
    silver: 0,
    investments: 0,
    businessAssets: 0,
    debts: 0,
    nisabStandard: "85g gold",
  },
  pricing: {
    currency: "USD",
    countryName: "United States",
    goldPerGram: 0,
    silverPerGram: 0,
    nisabValue: 0,
    source: "Live market feed unavailable",
    timestamp: "",
    warning: "",
  },
};

function getCurrencyCode() {
  return state.pricing.currency || "USD";
}

function currency(amount) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: getCurrencyCode(),
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[name].classList.add("active");
}

function findCountry(code) {
  return state.countries.find((country) => country.code === code) || state.countries[0];
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

  if (question.type === "country") {
    const select = document.createElement("select");
    select.id = question.id;
    state.countries.forEach((country) => {
      const option = document.createElement("option");
      option.value = country.code;
      option.textContent = `${country.name} (${country.currency})`;
      select.append(option);
    });
    select.value = state.answers.countryCode;
    return select;
  }

  const input = document.createElement("input");
  input.id = question.id;
  input.type = question.type;

  if (question.type === "number") {
    input.min = "0";
    input.step = "0.01";
    input.placeholder = "0.00";
    input.value = state.answers[question.id] || 0;
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

  if (question.id === "nisabStandard") {
    const basis = state.answers.nisabStandard === "85g gold" ? "gold" : "silver";
    questionDescription.textContent += ` Current estimate: ${currency(
      state.pricing.nisabValue
    )} (${basis} basis).`;
  }

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

async function loadCountries() {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,currencies");
    if (!response.ok) {
      throw new Error("Country feed unavailable");
    }

    const data = await response.json();
    const parsed = data
      .map((item) => {
        const currencyCode = Object.keys(item.currencies || {})[0];
        if (!item.cca2 || !item.name?.common || !currencyCode) {
          return null;
        }
        return {
          name: item.name.common,
          code: item.cca2,
          currency: currencyCode,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));

    if (parsed.length > 0) {
      state.countries = parsed;
      if (!state.countries.some((country) => country.code === state.answers.countryCode)) {
        state.answers.countryCode = state.countries[0].code;
      }
    }
  } catch (error) {
    state.pricing.warning = "Using fallback country list due to network limits.";
  }
}

async function getUsdMetalPrice(symbol) {
  const ticker = symbol === "XAU" ? "xauusd" : "xagusd";
  const response = await fetch(`https://stooq.com/q/l/?s=${ticker}&f=sd2t2ohlcv&h&e=csv`);
  if (!response.ok) {
    throw new Error("Metal feed unavailable");
  }

  const csvText = await response.text();
  const [headerLine, valueLine] = csvText.trim().split("\n");
  const headers = headerLine.split(",");
  const values = valueLine.split(",");
  const closeIdx = headers.findIndex((head) => head.toLowerCase() === "close");
  const close = Number.parseFloat(values[closeIdx]);

  if (!Number.isFinite(close) || close <= 0) {
    throw new Error("Invalid metal price payload");
  }

  return close;
}

async function getFxRate(toCurrency) {
  if (!toCurrency || toCurrency === "USD") {
    return 1;
  }

  const response = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${toCurrency}`);
  if (!response.ok) {
    throw new Error("FX feed unavailable");
  }

  const data = await response.json();
  const rate = data.rates?.[toCurrency];
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Invalid FX rate payload");
  }

  return rate;
}

function applyNisab() {
  const grams = state.answers.nisabStandard === "85g gold" ? 85 : 595;
  const rate = state.answers.nisabStandard === "85g gold" ? state.pricing.goldPerGram : state.pricing.silverPerGram;
  state.pricing.nisabValue = grams * rate;
}

async function refreshPricing() {
  const country = findCountry(state.answers.countryCode);
  state.pricing.currency = country.currency;
  state.pricing.countryName = country.name;

  try {
    const [goldPerOunceUsd, silverPerOunceUsd, fxRate] = await Promise.all([
      getUsdMetalPrice("XAU"),
      getUsdMetalPrice("XAG"),
      getFxRate(country.currency),
    ]);

    state.pricing.goldPerGram = (goldPerOunceUsd * fxRate) / OUNCE_TO_GRAMS;
    state.pricing.silverPerGram = (silverPerOunceUsd * fxRate) / OUNCE_TO_GRAMS;
    state.pricing.source = "Stooq spot metals (XAUUSD/XAGUSD) + Frankfurter FX (ECB reference rates)";
    state.pricing.timestamp = new Date().toLocaleString();
    state.pricing.warning = state.pricing.warning && !state.pricing.warning.includes("network") ? state.pricing.warning : "";
  } catch (error) {
    const fallbackFx = country.currency === "USD" ? 1 : 1;
    state.pricing.goldPerGram = 70 * fallbackFx;
    state.pricing.silverPerGram = 0.8 * fallbackFx;
    state.pricing.source = "Fallback estimates (live feeds unavailable)";
    state.pricing.timestamp = "";
    state.pricing.warning = "Could not fetch live metal/FX prices. Please verify nisab manually with local scholars or trusted market feeds.";
  }

  applyNisab();
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
  const eligible = net >= state.pricing.nisabValue;

  return { totalAssets, net, due, eligible };
}

function renderSummary() {
  applyNisab();

  const rows = [
    ["Zakat period", state.answers.zakatTime],
    ["Specific reminder date", state.answers.zakatDate || "Not specified"],
    ["Country", `${state.pricing.countryName} (${state.pricing.currency})`],
    ["Cash & bank", state.answers.cash, "cash"],
    ["Gold value", state.answers.gold, "gold"],
    ["Silver value", state.answers.silver, "silver"],
    ["Investments", state.answers.investments, "investments"],
    ["Business assets", state.answers.businessAssets, "businessAssets"],
    ["Debts", state.answers.debts, "debts"],
    ["Nisab standard", state.answers.nisabStandard],
    ["Nisab threshold (auto)", currency(state.pricing.nisabValue)],
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
    <p><strong>Nisab used (${state.answers.nisabStandard}):</strong> ${currency(state.pricing.nisabValue)}</p>
    <p><strong>Gold price (per gram):</strong> ${currency(state.pricing.goldPerGram)}</p>
    <p><strong>Silver price (per gram):</strong> ${currency(state.pricing.silverPerGram)}</p>
    <p><strong>Zakat due (2.5%):</strong> ${calc.eligible ? currency(calc.due) : currency(0)}</p>
    <p><strong>Pricing source:</strong> ${state.pricing.source}${
      state.pricing.timestamp ? ` (${state.pricing.timestamp})` : ""
    }</p>
    ${state.pricing.warning ? `<p class="warning-text">${state.pricing.warning}</p>` : ""}
    <p>${
      calc.eligible
        ? "Your net wealth is above nisab, so Zakat is due."
        : "Your net wealth is below nisab, so Zakat is not due in this estimate."
    }</p>
  `;
}

startBtn.addEventListener("click", async () => {
  state.step = 0;
  await refreshPricing();
  renderStep();
  showScreen("question");
});

backBtn.addEventListener("click", () => {
  saveCurrentStep();
  state.step = Math.max(state.step - 1, 0);
  renderStep();
});

nextBtn.addEventListener("click", async () => {
  saveCurrentStep();

  if (questions[state.step].id === "countryCode" || questions[state.step].id === "nisabStandard") {
    await refreshPricing();
  }

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

loadCountries().then(() => refreshPricing());
