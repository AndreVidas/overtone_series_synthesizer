// script addapted from ChatGPT prompts

const numOvertones = 30;
const maxHeight = 250;

const container = document.getElementById("container");
const waveType = document.getElementById("waveType");
let amplitudes = Array(numOvertones).fill(0);


// --- AUDIO SETUP ---
let audioCtx = null;
let oscillators = [];
let gains = [];
let analyser = null;
let freqData = null;

function initAudio(fundamental_hertz) {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  freqData = new Uint8Array(analyser.frequencyBinCount);


  const baseFreq = 110; // fundamental frequency (A2)

  for (let i = 0; i < numOvertones; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.frequency.value = baseFreq * (i + 1);  // harmonic i = (i+1)*fundamental
    osc.type = waveType.value;

    gain.gain.value = amplitudes[i] * 0.3; // initial volume

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    gain.connect(analyser);
    analyser.connect(audioCtx.destination);


    oscillators.push(osc);
    gains.push(gain);
  }
}

function startSound() {
  if (!audioCtx) initAudio();
  oscillators.forEach(o => o.start());
}

function stopSound() {
  if (!audioCtx) return;
  oscillators.forEach(o => o.stop());
  oscillators = [];
  gains = [];
  audioCtx = null;
}

function setWaveform(type) {
  oscillators.forEach(osc => {
    osc.type = type;
  });
}

function setFundamentalFreq(hz) {
  let i = 1;
  oscillators.forEach(osc => {
    osc.frequency.value = hz*i;
    i += 1;
  });
}

function handleKeyPress(e) {
  if (e.key.toLowerCase() === "a") {
    setFundamentalFreq(130.81); 
  }

  if (e.key.toLowerCase() === "s") {
    setFundamentalFreq(146.83);
  }

    if (e.key.toLowerCase() === "d") {
    setFundamentalFreq(164.81);
  }
      if (e.key.toLowerCase() === "f") {
    setFundamentalFreq(174.61);
  }
      if (e.key.toLowerCase() === "g") {
    setFundamentalFreq(196);
  }
      if (e.key.toLowerCase() === "h") {
    setFundamentalFreq(220);
  }
      if (e.key.toLowerCase() === "j") {
    setFundamentalFreq(246.94);
  }
  if (e.key.toLowerCase() === "k") {
    setFundamentalFreq(261.63);
  }

  
}

// --- SLIDERS / VISUAL PART ---
for (let i = 0; i < numOvertones; i++) {
  const wrap = document.createElement("div");
  wrap.className = "overtone";

  const line = document.createElement("div");
  line.className = "line";
  line.style.height = (amplitudes[i] * maxHeight) + "px";

  const handle = document.createElement("div");
  handle.className = "handle";
  handle.style.bottom = (amplitudes[i] * maxHeight - 7) + "px";

  wrap.appendChild(line);
  wrap.appendChild(handle);
  container.appendChild(wrap);

  let dragging = false;

  handle.addEventListener("mousedown", () => dragging = true);
  document.addEventListener("mouseup", () => dragging = false);

  document.addEventListener("mousemove", e => {
    if (!dragging) return;

    const rect = container.getBoundingClientRect();
    let y = rect.bottom - e.clientY;

    y = Math.max(0, Math.min(maxHeight, y));

    amplitudes[i] = y / maxHeight;

    line.style.height = y + "px";
    handle.style.bottom = (y - 7) + "px";

    if (gains[i]) {
      gains[i].gain.value = amplitudes[i] * 0.3;
    }
  });
}


document.getElementById("startBtn").addEventListener("click", startSound);
document.getElementById("stopBtn").addEventListener("click", stopSound);


document.getElementById("waveType").addEventListener("change", (e) => {
  setWaveform(e.target.value);
});

document.addEventListener("keydown", handleKeyPress);




// --- FFT VISUALIZATION ---
const canvas = document.getElementById("fftCanvas");
const ctx = canvas.getContext("2d");


function drawFFT() {
  if (!analyser) {
    requestAnimationFrame(drawFFT);
    return;
  }

  analyser.getByteFrequencyData(freqData);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width / freqData.length) * 3; // fewer bars, wider
  let x = 0;

  for (let i = 0; i < freqData.length; i += 3) {
    const v = freqData[i];
    const h = (v / 255) * canvas.height;

    ctx.fillStyle = "rgb(14, 255, 14)";
    ctx.fillRect(x, canvas.height - h, barWidth, h);

    x += barWidth + 1;
  }

  requestAnimationFrame(drawFFT);
}

requestAnimationFrame(drawFFT);
