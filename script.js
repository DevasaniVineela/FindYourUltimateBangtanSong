function enableMusicOnFirstInteraction() {
  playMusic();

  document.removeEventListener("click", enableMusicOnFirstInteraction);
  document.removeEventListener("keydown", enableMusicOnFirstInteraction);
  document.removeEventListener("touchstart", enableMusicOnFirstInteraction);
}

// listen for *any* interaction
document.addEventListener("click", enableMusicOnFirstInteraction);
document.addEventListener("keydown", enableMusicOnFirstInteraction);
document.addEventListener("touchstart", enableMusicOnFirstInteraction);

if (!Array.isArray(SONGS)) {
  throw new Error("SONGS is not loaded. Check songs.js connection.");
}

if (SONGS.length !== 128) {
  throw new Error(`Expected 128 songs, found ${SONGS.length}`);
}

// ---------- Utilities ----------
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ---------- State ----------
let currentRoundSongs = [];
let nextRoundSongs = [];
let matchIndex = 0;
let roundNumber = 1;

// ---------- Background Music ----------
const bgMusic = document.getElementById("bg-music");
let musicStarted = false;

function playMusic() {
  if (!bgMusic || musicStarted) return;

  bgMusic.volume = 0.35;
  bgMusic.play().then(() => {
    musicStarted = true;
  }).catch(() => {});
}

function stopMusic() {
  if (!bgMusic) return;

  bgMusic.pause();
  bgMusic.currentTime = 0;
  musicStarted = false;
}

// ---------- Floating BTS Faces & Hearts ----------
let heartInterval = null;
let faceInterval = null;

let memberIndex = 0;
let faceSide = "left";

const memberFaces = [
  "assets/floating/rm.png",
  "assets/floating/jin.png",
  "assets/floating/suga.png",
  "assets/floating/jhope.png",
  "assets/floating/jimin.png",
  "assets/floating/taehyung.png",
  "assets/floating/jungkook.png"
];

function getNextFacePosition() {
  const rareCenter = Math.random() < 0.2;

  if (rareCenter) return 45 + Math.random() * 10;

  if (faceSide === "left") {
    faceSide = "right";
    return Math.random() * 18 + 2;
  } else {
    faceSide = "left";
    return 80 + Math.random() * 10;
  }
}

function startFloating() {
  const container = document.getElementById("floating-bg");
  container.innerHTML = "";

  heartInterval = setInterval(() => {
    const heart = document.createElement("div");
    heart.textContent = "💜";
    heart.className = "float-item float-heart";
    heart.style.left = Math.random() * 90 + 5 + "vw";
    heart.style.animationDuration = 6 + Math.random() * 3 + "s";

    container.appendChild(heart);
    setTimeout(() => heart.remove(), 12000);
  }, 350);

  faceInterval = setInterval(() => {
    const face = document.createElement("img");
    face.src = memberFaces[memberIndex];
    face.className = "float-item float-face";
    face.style.left = getNextFacePosition() + "vw";
    face.style.animationDuration = "14s";

    container.appendChild(face);
    memberIndex = (memberIndex + 1) % memberFaces.length;

    setTimeout(() => face.remove(), 16000);
  }, 1800);
}

function stopFloating() {
  clearInterval(heartInterval);
  clearInterval(faceInterval);
}

// ---------- Init ----------
function initTournament() {
  document.querySelector(".app").classList.remove("hidden");
  document.getElementById("result-screen").classList.add("hidden");

  currentRoundSongs = shuffle([...SONGS]);
  nextRoundSongs = [];
  matchIndex = 0;
  roundNumber = 1;

  renderCurrentMatch();
  startFloating();
}

// ---------- Render ----------
function renderCurrentMatch() {
  const songA = currentRoundSongs[matchIndex];
  const songB = currentRoundSongs[matchIndex + 1];
  if (!songA || !songB) return;

  document.getElementById("round-number").textContent = roundNumber;
  document.getElementById("match-number").textContent =
    Math.floor(matchIndex / 2) + 1;

  document.getElementById("progress-text").textContent =
    `${currentRoundSongs.length} songs → ${currentRoundSongs.length / 2} matchups`;

  updateCard("song-a", songA);
  updateCard("song-b", songB);
}

function updateCard(id, song) {
  const card = document.getElementById(id);

  card.querySelector(".song-title").textContent = song.title;
  card.querySelector(".song-artist").textContent = song.artist;

  const img = card.querySelector(".album-cover");
  img.src = `assets/albums/${song.cover}`;
  img.onerror = () => img.src = "assets/albums/default.jpg";

  card.onclick = () => {   
    selectWinner(song);
  };
}

// ---------- Game Logic ----------
function selectWinner(song) {
  nextRoundSongs.push(song);
  matchIndex += 2;

  if (matchIndex >= currentRoundSongs.length) moveToNextRound();
  else renderCurrentMatch();
}

function moveToNextRound() {
  if (nextRoundSongs.length === 1) {
    showWinner(nextRoundSongs[0]);
    return;
  }

  currentRoundSongs = [...nextRoundSongs];
  nextRoundSongs = [];
  matchIndex = 0;
  roundNumber++;

  renderCurrentMatch();
}

function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confettiCount = 150;
  const confetti = [];

  const colors = ["#ffffff", "#e0aaff", "#c77dff", "#9d4edd"];

  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 6 + 4,
      speed: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confetti.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
ctx.shadowColor = p.color;
ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
ctx.shadowBlur = 0;

      ctx.restore();
    });

    update();
  }

  function update() {
    confetti.forEach(p => {
      p.y += p.speed;
      p.rotation += 3;

      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }
    });
  }

  function animate() {
    draw();
    requestAnimationFrame(animate);
  }

  animate();
}

// ---------- Winner ----------
function showWinner(song) {
  stopFloating();
  stopMusic();

  document.querySelector(".app").classList.add("hidden");
  document.getElementById("result-screen").classList.remove("hidden");

  document.getElementById("winner-title").textContent = song.title;
  document.getElementById("winner-artist").textContent = song.artist;

  const img = document.getElementById("winner-album");
  img.src = `assets/albums/${song.cover}`;
  img.onerror = () => img.src = "assets/albums/default.jpg";

  launchConfetti();
}

// ---------- Restart ----------
document.getElementById("restart-btn").addEventListener("click", initTournament);

// ---------- Boot ----------
window.addEventListener("DOMContentLoaded", initTournament);
