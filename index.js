const questionParent = document.querySelector(".questions-container");
const optionsParent = document.querySelector(".options-container");
const nextBtn = document.querySelector(".next");
const quitBtn = document.querySelector(".quit");
const quizCategory = document.querySelector(".quiz-category");
const scoreContainer = document.querySelector(".cur-score");
const rules = document.querySelector(".rule-book");
const quizBook = document.querySelector(".quiz");
const playBtn = document.querySelector(".play-btn");
const qnsCount = document.querySelector(".qns-count");
const result = document.querySelector(".result");
const timerDisplay = document.querySelector(".timer");

let quizzes = [];
let currentQuestion = 0;
let score = 0;
let optionSelected = false;
let timeLeft = 30;
let timerInterval;

// ⏱ Start the countdown timer
function startTimer() {
  clearInterval(timerInterval); // Clear any previous timer
  timeLeft = 30;
  timerDisplay.innerText = `⏱️ Time Left: ${timeLeft}s`;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.innerText = `⏱️ Time Left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      disableOptions();
      optionSelected = true;
      nextBtn.click(); // Auto-move to next question
    }
  }, 1000);
}

// 🔄 Fetch quiz data from API
const getJson = async () => {
  try {
    questionParent.innerHTML = "Loading quiz...";
    const {
      data: { results },
    } = await axios.get(
      "https://opentdb.com/api.php?amount=5&category=9&difficulty=easy&type=multiple"
    );
    return results;
  } catch (err) {
    console.error("Error fetching quiz data", err);
    questionParent.innerHTML = "Failed to load quiz.";
  }
};

// 🔄 Load and start the quiz
const getData = async () => {
  quizzes = await getJson();
  if (quizzes && quizzes.length) {
    createQuestionAndOptions(quizzes, currentQuestion);
  }
};

getData();

// ▶️ Start button click
playBtn.addEventListener("click", () => {
  console.log("Play button clicked");
  quizBook.classList.remove("hide");
  rules.classList.add("hide");
});

// 🧠 Create questions and options
function createQuestionAndOptions(quizzes, currentQuestion) {
  qnsCount.innerText = `Q${currentQuestion + 1}/${quizzes.length}`;
  scoreContainer.innerText = `Score: ${score}`;
  quizCategory.innerText = quizzes[currentQuestion].category;

  questionParent.innerText = "";
  optionsParent.innerText = "";
  optionSelected = false;

  const questionEle = document.createElement("p");
  questionEle.innerText = `Q${currentQuestion + 1}: ${quizzes[currentQuestion].question}`;
  questionParent.appendChild(questionEle);

  let options = [
    quizzes[currentQuestion].correct_answer,
    ...quizzes[currentQuestion].incorrect_answers,
  ].sort(() => Math.random() - 0.5);

  options.forEach((option) => {
    const optionBtn = document.createElement("button");
    optionBtn.classList.add("button");
    optionBtn.setAttribute("name", option);
    optionBtn.innerText = option;
    optionsParent.appendChild(optionBtn);
  });

  startTimer(); // ⏱ Start timer for this question
}

// ➡️ Next button click
nextBtn.addEventListener("click", () => {
  if (!optionSelected) {
    alert("Please select an option first!");
    return;
  }

  currentQuestion++;

  if (currentQuestion < quizzes.length) {
    createQuestionAndOptions(quizzes, currentQuestion);
    if (currentQuestion === quizzes.length - 1) {
      nextBtn.innerText = "Submit";
    }
  } else {
    clearInterval(timerInterval); // Stop timer
    quizBook.classList.add("hide");
    result.classList.remove("hide");
    result.innerText = `🎉 Your Score: ${score} / ${quizzes.length}`;
  }
});

// ⏹ Quit button click
quitBtn.addEventListener("click", () => {
  currentQuestion = 0;
  score = 0;
  optionSelected = false;
  clearInterval(timerInterval);
  rules.classList.remove("hide");
  quizBook.classList.add("hide");
  result.classList.add("hide");
  nextBtn.innerText = "Next";
  getData();
});

// 🚫 Disable option buttons
function disableOptions() {
  document
    .querySelectorAll(".button")
    .forEach((button) => button.setAttribute("disabled", true));
}

// ✅ Option button click
optionsParent.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;
  if (optionSelected) return;

  optionSelected = true;
  clearInterval(timerInterval); // Stop timer on selection

  const selected = e.target;
  const correct = quizzes[currentQuestion].correct_answer;

  if (selected.name === correct) {
    selected.classList.add("success");
    score++;
  } else {
    selected.classList.add("error");
    document
      .querySelector(`[name="${correct}"]`)
      ?.classList.add("success");
  }

  disableOptions();
  scoreContainer.innerText = `Score: ${score}`;
});
