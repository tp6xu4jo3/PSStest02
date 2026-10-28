"use strict";

// 純前端互動展示：不連接伺服器，也不會儲存或送出任何回報。
const equipmentData = {
  water: {
    name: "飲水機",
    problems: ["無法出水", "水溫異常", "漏水或積水", "其他問題"]
  },
  air: {
    name: "冷氣",
    problems: ["無法啟動", "不冷或冷房不足", "漏水或異音", "其他問題"]
  },
  projector: {
    name: "投影機",
    problems: ["無法開機", "畫面模糊或異常", "無訊號或無畫面", "其他問題"]
  }
};

const form = document.getElementById("reportForm");
const equipmentButtons = Array.from(document.querySelectorAll("[data-equipment]"));
const problemOptions = document.getElementById("problemOptions");
const description = document.getElementById("description");
const descriptionCount = document.getElementById("descriptionCount");
const progressText = document.getElementById("progressText");
const progressTrack = document.getElementById("progressTrack");
const progressFill = document.getElementById("progressFill");
const reportScreen = document.getElementById("reportScreen");
const successScreen = document.getElementById("successScreen");
const workspace = document.getElementById("workspace");
const errors = {
  equipment: document.getElementById("equipmentError"),
  problem: document.getElementById("problemError"),
  description: document.getElementById("descriptionError")
};

let selectedEquipment = null;
let selectedProblem = null;

function showError(field, message) {
  errors[field].textContent = message;
  errors[field].hidden = !message;
  if (field === "description") {
    description.setAttribute("aria-invalid", message ? "true" : "false");
  }
}

function updateProgress() {
  const complete = Number(Boolean(selectedEquipment)) +
    Number(Boolean(selectedProblem)) +
    Number(Boolean(description.value.trim()));
  const percentage = Math.round((complete / 3) * 100);
  progressText.textContent = `已完成 ${complete} / 3 項`;
  progressTrack.setAttribute("aria-valuenow", String(percentage));
  progressFill.style.width = `${percentage}%`;
  descriptionCount.textContent = `${description.value.length} / 160 字`;
}

function showProblemPlaceholder() {
  problemOptions.replaceChildren();
  const placeholder = document.createElement("div");
  placeholder.className = "empty-options";
  placeholder.textContent = "請先選擇上方設備";
  problemOptions.append(placeholder);
}

function chooseProblem(problem, button) {
  selectedProblem = problem;
  problemOptions.querySelectorAll(".problem-option").forEach((option) => {
    option.setAttribute("aria-pressed", String(option === button));
  });
  showError("problem", "");
  updateProgress();
}

function renderProblems(equipmentKey) {
  problemOptions.replaceChildren();
  equipmentData[equipmentKey].problems.forEach((problem) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "problem-option";
    button.setAttribute("aria-pressed", "false");
    const indicator = document.createElement("span");
    indicator.className = "option-radio";
    indicator.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.textContent = problem;
    button.append(indicator, label);
    button.addEventListener("click", () => chooseProblem(problem, button));
    problemOptions.append(button);
  });
}

function chooseEquipment(equipmentKey) {
  if (!Object.hasOwn(equipmentData, equipmentKey)) return;
  if (selectedEquipment !== equipmentKey) {
    selectedProblem = null;
    renderProblems(equipmentKey);
  }
  selectedEquipment = equipmentKey;
  equipmentButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.equipment === equipmentKey));
  });
  showError("equipment", "");
  showError("problem", "");
  updateProgress();
}

equipmentButtons.forEach((button) => {
  button.addEventListener("click", () => chooseEquipment(button.dataset.equipment));
});

description.addEventListener("input", () => {
  if (description.value.trim()) showError("description", "");
  updateProgress();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  showError("equipment", "");
  showError("problem", "");
  showError("description", "");

  if (!selectedEquipment) {
    showError("equipment", "請先選擇一項設備。");
    equipmentButtons[0].focus();
    return;
  }
  if (!selectedProblem) {
    showError("problem", "請選擇設備的故障類型。");
    problemOptions.querySelector("button")?.focus();
    return;
  }
  if (!description.value.trim()) {
    showError("description", "請簡單描述故障狀況。");
    description.focus();
    return;
  }

  document.getElementById("summaryEquipment").textContent = equipmentData[selectedEquipment].name;
  document.getElementById("summaryProblem").textContent = selectedProblem;
  document.getElementById("summaryDescription").textContent = description.value.trim();
  reportScreen.hidden = true;
  successScreen.hidden = false;
  scrollToWorkspace();
  document.getElementById("successTitle").focus({ preventScroll: true });
});

function scrollToWorkspace() {
  workspace.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start"
  });
}

document.getElementById("anotherReport").addEventListener("click", () => {
  selectedEquipment = null;
  selectedProblem = null;
  form.reset();
  equipmentButtons.forEach((button) => button.setAttribute("aria-pressed", "false"));
  showProblemPlaceholder();
  Object.keys(errors).forEach((field) => showError(field, ""));
  updateProgress();
  successScreen.hidden = true;
  reportScreen.hidden = false;
  scrollToWorkspace();
  equipmentButtons[0].focus({ preventScroll: true });
});

updateProgress();
