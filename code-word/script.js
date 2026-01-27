let secretWord = "";
let wordLength = 5;
let words = [];
let gameOver = false;

const gameBoard = document.getElementById("gameBoard");
const guessInput = document.getElementById("guessInput");
const message = document.getElementById("message");

document.getElementById("newGameBtn").addEventListener("click", startNewGame);
document.getElementById("submitGuessBtn").addEventListener("click", submitGuess);
document.getElementById("wordLength").addEventListener("change", (e) => {
  wordLength = parseInt(e.target.value);
  guessInput.maxLength = wordLength;
});

startNewGame();

async function startNewGame() {
  gameOver = false;
  gameBoard.innerHTML = "";
  message.textContent = "";
  wordLength = parseInt(document.getElementById("wordLength").value);
  guessInput.value = "";
  guessInput.maxLength = wordLength;

  const response = await fetch(`words${wordLength}.json`);
  const data = await response.json();
  words = data.words;

  secretWord = words[Math.floor(Math.random() * words.length)];
  console.log("Secret:", secretWord); // remove later
}

function submitGuess() {
  if (gameOver) return;

  let guess = guessInput.value.toUpperCase();

  if (guess.length !== wordLength) {
    message.textContent = `Guess must be ${wordLength} letters.`;
    return;
  }

  if (!/^[A-Z]+$/.test(guess)) {
    message.textContent = "Only letters allowed.";
    return;
  }

  const result = evaluateGuess(guess, secretWord);
  displayResult(guess, result);

  if (result.black === wordLength) {
    message.textContent = "🎉 You cracked the code!";
    gameOver = true;
  }

  guessInput.value = "";
}

function evaluateGuess(guess, secret) {
  let black = 0;
  let white = 0;

  const secretArr = secret.split("");
  const guessArr = guess.split("");

  const usedSecret = Array(wordLength).fill(false);
  const usedGuess = Array(wordLength).fill(false);

  // Black pegs
  for (let i = 0; i < wordLength; i++) {
    if (guessArr[i] === secretArr[i]) {
      black++;
      usedSecret[i] = true;
      usedGuess[i] = true;
    }
  }

  // White pegs
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

function displayResult(guess, result) {
  const row = document.createElement("div");
  row.className = "row";

  const guessDiv = document.createElement("div");
  guessDiv.className = "guess";
  guessDiv.textContent = guess;

  const pegDiv = document.createElement("div");
  pegDiv.className = "pegs";

  pegDiv.innerHTML =
    "⚫".repeat(result.black) +
    "⚪".repeat(result.white);

  row.appendChild(guessDiv);
  row.appendChild(pegDiv);

  gameBoard.appendChild(row);
}
