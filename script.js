let jumpKey;
let crouchKey;
let key;
let time;
let results;

const jumpKeyInput = document.querySelector("#jumpKey");
const crouchKeyInput = document.querySelector("#crouchKey");
const fpsInput = document.querySelector("#fps");
const repetitionsInput = document.querySelector("#repetitions");

const messageHeadline = document.querySelector("#messageHeadline");
const messageInstruction = document.querySelector("#messageInstruction");
const startButton = document.querySelector("#startButton");

const modalContainer = document.querySelector("#modalContainer");
const modalHeadline = document.querySelector("#modalHeadline");
const modalText = document.querySelector("#modalText");

function setJumpKey() {
  modalContainer.style.display = "block";
  modalHeadline.textContent = "Jump Key";
  modalText.textContent = "Press the key you want to use to jump.";

  function getJumpKey(event) {
    jumpKey = event.code;
    jumpKeyInput.value = jumpKey;
    modalContainer.style.display = "none";
    document.removeEventListener("keydown", getJumpKey);
  }

  document.addEventListener("keydown", getJumpKey);
}

jumpKeyInput.addEventListener("click", setJumpKey);

function setCrouchKey() {
  modalContainer.style.display = "block";
  modalHeadline.textContent = "Crouch Key";
  modalText.textContent = "Press the key you want to use to crouch.";

  function getCrouchKey(event) {
    crouchKey = event.code;
    crouchKeyInput.value = crouchKey;
    modalContainer.style.display = "none";
    document.removeEventListener("keydown", getCrouchKey);
  }

  document.addEventListener("keydown", getCrouchKey);
}

crouchKeyInput.addEventListener("click", setCrouchKey);

async function getKeyAndTime() {
  return new Promise((resolve) => {
    document.addEventListener("keydown", (event) => {
      resolve([event.code, Date.now()]);
    });
  });
}

async function round() {
  messageHeadline.textContent = "Jump";
  messageInstruction.textContent = "Press the jump key to jump.";

  firstStroke = await getKeyAndTime();

  messageHeadline.textContent = "Crouch";
  messageInstruction.textContent = "Press the crouch key to crouch.";

  secondStroke = await getKeyAndTime();

  return [firstStroke, secondStroke];
}

async function countDown() {
  return new Promise(async (resolve) => {
    messageInstruction.textContent = "Get ready for the next round.";
    messageHeadline.textContent = "2";
    await new Promise((resolve) => setTimeout(resolve, 1000));
    messageHeadline.textContent = "1";
    await new Promise((resolve) => setTimeout(resolve, 1000));
    resolve();
  });
}

function createEvaluation(stroke) {
  let firstKey = stroke[0][0];
  let secondKey = stroke[1][0];
  let keysCorrect = firstKey === jumpKey && secondKey === crouchKey;

  if (!keysCorrect) {
    return `Wrong keys or Order: you pressed ${firstKey} then ${secondKey}, it should be ${jumpKey} then ${crouchKey}.`;
  }

  let chance;
  let timeDiffrence = stroke[1][1] - stroke[0][1];
  let fps = fpsInput.value;
  let frameLength = 1000 / fps;
  let frameDiffrence = timeDiffrence / frameLength;

  if (frameDiffrence < 1) {
    chance = frameDiffrence * 100;
    return `Yeah! ${chance.toFixed(2)}% chance of Succuess! Crouch slightly later by ${timeDiffrence} ms to improve`;
  }

  if (frameDiffrence < 2) {
    chance = (2 - frameDiffrence) * 100;
    return `Yeah! ${chance.toFixed(2)}% chance of Succuess! Crouch slightly sooner by ${timeDiffrence} ms to improve`;
  }

  if (frameDiffrence > 2) {
    return `Unsuccessfull! Crouch ${timeDiffrence} ms sooner to improve`;
  }
}

async function practice() {
  let error;
  if (!crouchKeyInput.value) {
    crouchKeyInput.classList.add("shaking");
    setTimeout(() => {
      crouchKeyInput.classList.remove("shaking");
    }, 1000);
    error = true;
  }

  if (!jumpKeyInput.value) {
    jumpKeyInput.classList.add("shaking");
    setTimeout(() => {
      jumpKeyInput.classList.remove("shaking");
    }, 1000);
    error = true;
  }

  if (error) return;

  results = [];
  repetitions = repetitionsInput.value;
  startButton.style.display = "none";

  for (let i = 0; i < repetitions; i++) {
    await countDown();
    results.push(await round());
  }
  messageHeadline.textContent = "Results";
  messageInstruction.textContent = "";
  for (let i = 0; i < results.length; i++) {
    messageInstruction.textContent += `Round ${i + 1}: ${createEvaluation(results[i])}\r\n`;
  }
}

startButton.addEventListener("click", practice);
