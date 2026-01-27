let secretWord = "";
let wordLength = 5;
let words = [];
let gameOver = false;

const gameBoard = document.getElementById("gameBoard");
const guessInput = document.getElementById("guessInput");
const gameStatus = document.getElementById("gameStatus");
const winnerMessage = document.getElementById("winnerMessage");
const winnerText = document.getElementById("winnerText");

const wordLengthSelect = document.getElementById("wordLength");
const newGameBtn = document.getElementById("newGameBtn");
const submitGuessBtn = document.getElementById("submitGuessBtn");

// Event listeners
newGameBtn.addEventListener("click", startNewGame);
submitGuessBtn.addEventListener("click", submitGuess);
wordLengthSelect.addEventListener("change", (e) => {
  wordLength = parseInt(e.target.value);
  guessInput.maxLength = wordLength;
});

// Allow pressing Enter key to submit
guessInput.addEventListener("keypress", function(e) {
  if (e.key === "Enter") submitGuess();
});

// Start first game automatically
startNewGame();

// --- Functions ---
async function startNewGame() {
  gameOver = false;
  secretWord = "";
  gameBoard.innerHTML = "";
  winnerMessage.classList.add("hidden");
  gameStatus.textContent = "Select word length and start guessing...";
  guessInput.value = "";
  guessInput.maxLength = wordLength;
  guessInput.disabled = false;
  guessInput.focus();

  // Load word list
  try {
    const response = await fetch(`words${wordLength}.json`);
    const data = await response.json();
    words = data.words;
  } catch (err) {
    console.error("Error loading word list:", err);
    gameStatus.textContent = "Failed to load words.";
    return;
  }

  // Pick secret word
  secretWord = words[Math.floor(Math.random() * words.length)].toUpperCase();
  console.log("Secret word (dev only):", secretWord); // remove for production
}

function submitGuess() {
  if (gameOver) return;

  let guess = guessInput.value.toUpperCase().trim();

  if (guess.length !== wordLength) {
    gameStatus.textContent = `Guess must be ${wordLength} letters.`;
    return;
  }

  if (!/^[A-Z]+$/.test(guess)) {
    gameStatus.textContent = "Only letters allowed.";
    return;
  }

  // Evaluate guess
  const result = evaluateGuess(guess, secretWord);

  // Display result on board
  displayResult(guess, result);

  // Check win
  if (result.black === wordLength) {
    gameStatus.textContent = "🎉 You cracked the code!";
    winnerText.textContent = "You cracked the code!";
    winnerMessage.classList.remove("hidden");
    guessInput.disabled = true;
    gameOver = true;
  } else {
    gameStatus.textContent = `Black pegs: ${result.black}, White pegs: ${result.white}`;
  }

  guessInput.value = "";
  guessInput.focus();
}

// --- Core peg evaluation ---
function evaluateGuess(guess, secret) {
  let black = 0;
  let white = 0;

  const secretArr = secret.split("");
  const guessArr = guess.split("");

  const usedSecret = Array(wordLength).fill(false);
  const usedGuess = Array(wordLength).fill(false);

  // Black pegs: correct letter + correct position
  for (let i = 0; i < wordLength; i++) {
    if (guessArr[i] === secretArr[i]) {
      black++;
      usedSecret[i] = true;
      usedGuess[i] = true;
    }
  }

  // White pegs: correct letter, wrong position
  for (let i = 0; i < wordLength; i++) {
    if (usedGuess[i]) continue;

    for (let j = 0; j < wordLength; j++) {
      if (!usedSecret[j] && guessArr[i] === secretArr[j]) {
        white++;
        usedSecret[j] = true;
        break;
      }
    }
  }

  return { black, white };
}

// --- Display guess row ---
function displayResult(guess, result) {
  const row = document.createElement("div");
  row.className = "row";

  const guessDiv = document.createElement("div");
  guessDiv.className = "guess";
  guessDiv.textContent = guess;

  const pegDiv = document.createElement("div");
  pegDiv.className = "pegs";

  pegDiv.textContent = "⚫".repeat(result.black) + "⚪".repeat(result.white);

  row.appendChild(guessDiv);
  row.appendChild(pegDiv);

  gameBoard.appendChild(row);
  row.scrollIntoView({ behavior: "smooth" }); // auto scroll if mobile
}
