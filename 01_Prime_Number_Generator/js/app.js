// ========================
// 夜間 / 日間模式切換
// ========================
const themeBtn = document.getElementById("themeToggleBtn");
const themeSheet = document.getElementById("themeStylesheet");

themeBtn.addEventListener("click", () => {
    if (themeSheet.getAttribute("href") === "css/light.css") {
        themeSheet.setAttribute("href", "css/dark.css");
        themeBtn.textContent = "☀️";
    } else {
        themeSheet.setAttribute("href", "css/light.css");
        themeBtn.textContent = "🌙";
    }
});


// --- Element Selectors ---
const startRange = document.getElementById("startRange");
const endRange = document.getElementById("endRange");
const startNum = document.getElementById("startNum");
const endNum = document.getElementById("endNum");
const primeCountEl = document.getElementById("primeCount");
const rangeStartEl = document.getElementById("rangeStart");
const rangeEndEl = document.getElementById("rangeEnd");
const countLabelEl = document.getElementById("countLabel");

const rangeError = document.getElementById("rangeError");     // 範圍錯誤區塊
const resultError = document.getElementById("resultError");   // 無質數錯誤區塊
const primeList = document.getElementById("primeList");

const generateBtn = document.getElementById("generateBtn");
const clearBtn = document.getElementById("clearBtn");


// --- Error Handling ---
function showError(msg) {
    rangeError.textContent = msg;
}
function showError_result(msg) {
    resultError.textContent = msg;
}
function clearError() {
    rangeError.textContent = "";
}
function clearError_result() {
    resultError.textContent = "";
}


// --- Validate Range ---
function validateRange() {
    const start = Number(startNum.value);
    const end = Number(endNum.value);

    clearError_result();

    if (start >= end) {
        showError("起始值需小於結束值");
        startNum.classList.add("error");
        endNum.classList.add("error");
        return false;
    }

    startNum.classList.remove("error");
    endNum.classList.remove("error");
    clearError();
    return true;
}


// --- Slider Updates ---
startRange.addEventListener("input", () => {
    startNum.value = startRange.value;
    validateRange();
});
endRange.addEventListener("input", () => {
    endNum.value = endRange.value;
    validateRange();
});


// --- Number Updates ---
startNum.addEventListener("input", () => {
    startRange.value = startNum.value;
    validateRange();
});
endNum.addEventListener("input", () => {
    endRange.value = endNum.value;
    validateRange();
});


// --- Prime Checker ---
function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
}


// --- Generate Prime Numbers ---
generateBtn.addEventListener("click", () => {
    primeList.innerHTML = "";
    clearError_result();

    // 若範圍錯誤 → 阻止運算
    if (!validateRange()) return;

    const start = Number(startNum.value);
    const end = Number(endNum.value);

    const primes = [];
    for (let i = start; i <= end; i++) {
        if (isPrime(i)) primes.push(i);
    }

    primeCountEl.textContent = primes.length;
    rangeStartEl.textContent = start;
    rangeEndEl.textContent = end;
    countLabelEl.textContent = primes.length;

    if (primes.length === 0) {
        showError_result("沒有質數");
        return;
    }

    clearError_result();

    // 顯示質數（漸出動畫）
    primes.forEach((p, index) => {
        const div = document.createElement("div");
        div.className = "prime-card";
        div.textContent = p;
        primeList.appendChild(div);

        // 漸出淡入效果 + 依序延遲
        setTimeout(() => {
            div.classList.add("show");
        }, index * 40);
    });
});


// --- Clear All ---
clearBtn.addEventListener("click", () => {
    startNum.value = 0;
    endNum.value = 100;
    startRange.value = 0;
    endRange.value = 100;

    primeList.innerHTML = "";

    clearError();
    clearError_result();

    startNum.classList.remove("error");
    endNum.classList.remove("error");
});
