const questionParent = document.querySelector(".questions-container");
const optionsParent = document.querySelector(".options-container"); // fixed typo
const nextBtn = document.querySelector(".next");
const quitBtn = document.querySelector(".quit");
const quizCategory = document.querySelector(".quiz-category");
const scoreContainer = document.querySelector(".cur-score");
const rules = document.querySelector(".rule-book");
const quizBook = document.querySelector(".quiz");
const playBtn = document.querySelector(".play-btn");
const qnsCount = document.querySelector(".qns-count");
const result = document.querySelector(".result");

let quizzes = [];
let currentQuestion = 0;
let score = 0;
let optionSelected = false;

// 1️⃣ Show loading indicator while fetching
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

// 2️⃣ Fetch quiz and start app
const getData = async () => {
  quizzes = await getJson();
  if (quizzes && quizzes.length) {
    createQuestionAndOptions(quizzes, currentQuestion);
  }
};

getData();

// 3️⃣ Start the quiz
playBtn.addEventListener("click", () => {
  quizBook.classList.remove("hide");
  rules.classList.add("hide");
});

// 4️⃣ Generate question & options
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
}

// 5️⃣ Next button logic
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
    quizBook.classList.add("hide");
    result.classList.remove("hide");
    result.innerText = `🎉 Your Score: ${score} / ${quizzes.length}`;
  }
});

// 6️⃣ Quit button resets everything
quitBtn.addEventListener("click", () => {
  currentQuestion = 0;
  score = 0;
  optionSelected = false;
  rules.classList.remove("hide");
  quizBook.classList.add("hide");
  result.classList.add("hide");
  nextBtn.innerText = "Next";
  getData();
});

// 7️⃣ Disable options after answer
function disableOptions() {
  document
    .querySelectorAll(".button")
    .forEach((button) => button.setAttribute("disabled", true));
}

// 8️⃣ Handle option click
optionsParent.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;

  if (optionSelected) return;
  optionSelected = true;

  const selected = e.target;
  const correct = quizzes[currentQuestion].correct_answer;

  if (selected.name === correct) {
    selected.classList.add("success");
    score++;
  } else {
    selected.classList.add("error");
    document
      .querySelector(`[name="${correct}"]`)
      ?.classList.add("success"); // Highlight correct
  }

  disableOptions();
  scoreContainer.innerText = `Score: ${score}`;
});
