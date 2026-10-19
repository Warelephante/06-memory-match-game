// These emojis are used to make eight matching pairs.
const emojis = ["🍓", "🌈", "🐸", "🍩", "🦋", "🍋", "🐙", "🌻"];

const cardGrid = document.querySelector("#card-grid");
const movesDisplay = document.querySelector("#moves");
const timerDisplay = document.querySelector("#timer");
const gameMessage = document.querySelector("#game-message");
const resetButton = document.querySelector("#reset-button");

let firstCard = null;
let secondCard = null;
let moves = 0;
let matchedPairs = 0;
let seconds = 0;
let timerInterval = null;
let mismatchTimeout = null;
let isBoardLocked = false;

// Put each emoji in the deck twice, then shuffle the cards.
function createShuffledDeck() {
  const cards = emojis.concat(emojis);

  for (let index = cards.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const temporaryCard = cards[index];
    cards[index] = cards[randomIndex];
    cards[randomIndex] = temporaryCard;
  }

  return cards;
}

// Show the time as minutes and seconds, for example 01:05.
function updateTimerDisplay() {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  timerDisplay.textContent = `${formattedMinutes}:${formattedSeconds}`;
}

// Start counting once the player turns over the first card.
function startTimer() {
  if (timerInterval !== null) {
    return;
  }

  timerInterval = setInterval(function () {
    seconds++;
    updateTimerDisplay();
  }, 1000);
}

// Create buttons for every card in the shuffled deck.
function createBoard() {
  const cards = createShuffledDeck();
  cardGrid.innerHTML = "";

  cards.forEach(function (emoji, index) {
    const card = document.createElement("button");
    const emojiFace = document.createElement("span");

    card.className = "memory-card";
    card.type = "button";
    card.setAttribute("aria-label", `Hidden card ${index + 1}`);
    card.setAttribute("aria-pressed", "false");
    card.dataset.emoji = emoji;

    emojiFace.textContent = emoji;
    emojiFace.setAttribute("aria-hidden", "true");
    card.appendChild(emojiFace);
    card.addEventListener("click", handleCardClick);
    cardGrid.appendChild(card);
  });
}

// Turn over a card and check whether it matches the previous card.
function handleCardClick(event) {
  const clickedCard = event.currentTarget;

  if (isBoardLocked || clickedCard.classList.contains("is-flipped")) {
    return;
  }

  startTimer();
  clickedCard.classList.add("is-flipped");
  clickedCard.setAttribute("aria-pressed", "true");
  clickedCard.setAttribute("aria-label", `Revealed ${clickedCard.dataset.emoji}`);

  if (firstCard === null) {
    firstCard = clickedCard;
    gameMessage.textContent = "Find the card that matches!";
    return;
  }

  secondCard = clickedCard;
  moves++;
  movesDisplay.textContent = moves;

  if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
    firstCard.classList.add("is-matched");
    secondCard.classList.add("is-matched");
    firstCard.disabled = true;
    secondCard.disabled = true;
    matchedPairs++;
    firstCard = null;
    secondCard = null;

    if (matchedPairs === emojis.length) {
      finishGame();
    } else {
      gameMessage.textContent = "It's a match! Find another pair.";
    }
  } else {
    isBoardLocked = true;
    gameMessage.textContent = "Not a match. Try again!";
    mismatchTimeout = setTimeout(function () {
      hideUnmatchedCards();
    }, 850);
  }
}

// Turn both cards face down so the player can keep looking.
function hideUnmatchedCards() {
  firstCard.classList.remove("is-flipped");
  secondCard.classList.remove("is-flipped");
  firstCard.setAttribute("aria-pressed", "false");
  secondCard.setAttribute("aria-pressed", "false");
  firstCard.setAttribute("aria-label", "Hidden card");
  secondCard.setAttribute("aria-label", "Hidden card");
  firstCard = null;
  secondCard = null;
  isBoardLocked = false;
  mismatchTimeout = null;
}

// Stop the clock and congratulate the player.
function finishGame() {
  clearInterval(timerInterval);
  timerInterval = null;
  gameMessage.textContent = `You found every pair in ${moves} moves and ${timerDisplay.textContent}!`;
}

// Clear the old game and start a fresh one.
function restartGame() {
  clearInterval(timerInterval);
  clearTimeout(mismatchTimeout);
  firstCard = null;
  secondCard = null;
  moves = 0;
  matchedPairs = 0;
  seconds = 0;
  timerInterval = null;
  mismatchTimeout = null;
  isBoardLocked = false;
  movesDisplay.textContent = moves;
  updateTimerDisplay();
  gameMessage.textContent = "Pick any card to start!";
  createBoard();
}

resetButton.addEventListener("click", restartGame);
restartGame();
