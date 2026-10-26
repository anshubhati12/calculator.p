
const resultDisplay = document.getElementById("result");
const expressionDisplay = document.getElementById("expression");
const keypad = document.getElementById("keypad");

let current = "0";
let stored = null;
let operator = null;
let waitingForNumber = false;
let finished = false;
let expressionText = "";

function render() {
  resultDisplay.textContent = current;
  expressionDisplay.textContent = expressionText || "Ready to calculate";

  keypad.querySelectorAll("[data-operator]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.operator === operator && !waitingForNumber
    );
  });
}

function formatNumber(number) {
  if (!Number.isFinite(number)) return "Error";
  if (Object.is(number, -0)) number = 0;

  return String(Number(number.toPrecision(10)));
}

function inputNumber(number) {
  if (current === "Error" || waitingForNumber || finished) {
    current = number;
    waitingForNumber = false;
    finished = false;
  } else if (current.replace("-", "").replace(".", "").length < 15) {
    current = current === "0" ? number : current + number;
  }
}

function inputDecimal() {
  if (current === "Error" || waitingForNumber || finished) {
    current = "0.";
    waitingForNumber = false;
    finished = false;
  } else if (!current.includes(".")) {
    current += ".";
  }
}

function calculate(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function chooseOperator(nextOperator) {
  if (current === "Error") return;

  const value = Number(current);

  if (operator && !waitingForNumber) {
    const answer = calculate(stored, value, operator);
    current = formatNumber(answer);

    if (current === "Error") {
      resetCalculator();
      current = "Error";
      return;
    }

    stored = Number(current);
  } else {
    stored = value;
  }

  operator = nextOperator;
  expressionText = `${current} ${symbol(nextOperator)}`;
  waitingForNumber = true;
  finished = false;
}

function symbol(op) {
  return { "+": "+", "-": "−", "*": "×", "/": "÷" }[op] || op;
}

function equals() {
  if (!operator || stored === null || waitingForNumber || current === "Error") {
    return;
  }

  const a = stored;
  const b = Number(current);
  const op = operator;
  const answer = calculate(a, b, op);

  expressionText = `${formatNumber(a)} ${symbol(op)} ${formatNumber(b)} =`;
  current = formatNumber(answer);
  stored = null;
  operator = null;
  waitingForNumber = true;
  finished = true;

  render();
}

function resetCalculator() {
  current = "0";
  stored = null;
  operator = null;
  waitingForNumber = false;
  finished = false;
  expressionText = "";
}

function backspace() {
  if (current === "Error" || finished || waitingForNumber) {
    current = "0";
    waitingForNumber = false;
    finished = false;
    return;
  }

  current = current.length > 1
    ? current.slice(0, -1)
    : "0";

  if (current === "-") current = "0";
}

function applyAction(action) {
  if (action === "clear") {
    resetCalculator();
    return;
  }

  if (action === "backspace") {
    backspace();
    return;
  }

  if (action === "decimal") {
    inputDecimal();
    return;
  }

  if (action === "sign") {
    if (current !== "Error" && Number(current) !== 0) {
      current = formatNumber(-Number(current));
    }
    return;
  }

  if (action === "percent") {
    if (current !== "Error") {
      current = formatNumber(Number(current) / 100);
    }
    return;
  }

  if (action === "equals") {
    equals();
  }
}

keypad.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.number !== undefined) {
    inputNumber(button.dataset.number);
  } else if (button.dataset.operator) {
    chooseOperator(button.dataset.operator);
  } else if (button.dataset.action) {
    applyAction(button.dataset.action);
  }

  render();
});

document.addEventListener("keydown", event => {
  const key = event.key;

  if (/^[0-9]$/.test(key)) {
    inputNumber(key);
  } else if (key === ".") {
    inputDecimal();
  } else if (["+", "-", "*", "/"].includes(key)) {
    chooseOperator(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    equals();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape") {
    resetCalculator();
  } else if (key === "%") {
    applyAction("percent");
  } else {
    return;
  }

  render();
});

document.getElementById("year").textContent = new Date().getFullYear();
render();
