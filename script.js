/* =====================================================
   SAFEBUDDY JAVASCRIPT
   ===================================================== */

/* ================= STATE ================= */

const state = {
  theme: localStorage.getItem("safeBuddyTheme") || "light",

  size: localStorage.getItem("safeBuddySize") || "medium",

  points: Number(localStorage.getItem("safeBuddyPoints") || 0),

  lang: localStorage.getItem("safeBuddyLang") || "en",

  lastAnswer: "",

  speechText: "",

  quizIndex: 0,

  quizScore: 0,
};

/* ================= START ================= */

document.addEventListener("DOMContentLoaded", () => {
  applySettings();

  document.getElementById("points").textContent = state.points;

  setupScreenshot();

  renderQuiz();

  setupSettings();

  playCuteSound("hello");
});

/* ================= SETTINGS ================= */

function applySettings() {
  document.body.dataset.theme = state.theme;

  document.body.dataset.size = state.size;

  const languageSelect = document.getElementById("languageSelect");

  if (languageSelect) {
    languageSelect.value = state.lang;
  }

  document.documentElement.lang = state.lang;

  document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
}

function setTheme(theme) {
  state.theme = theme;

  localStorage.setItem("safeBuddyTheme", theme);

  applySettings();

  showToast(
    theme === "dark"
      ? "🌙 Dark mode on!"
      : theme === "kids"
        ? "🌈 Kids mode on!"
        : "☀️ Light mode on!",
  );
}

function setTextSize(size) {
  state.size = size;

  localStorage.setItem("safeBuddySize", size);

  applySettings();

  showToast("🔤 Text size changed!");
}

function changeLanguage(lang) {
  state.lang = lang;

  localStorage.setItem("safeBuddyLang", lang);

  applySettings();

  showToast("🌍 Language changed!");
}

/* ================= NAVIGATION ================= */

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  const target = document.getElementById(id);

  if (target) {
    target.classList.add("active");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.remove("active-nav");
  });

  const navButtons = document.querySelectorAll(".nav-button");

  const screenNames = ["home", "check", "buddy", "learn", "play"];

  const index = screenNames.indexOf(id);

  if (navButtons[index]) {
    navButtons[index].classList.add("active-nav");
  }

  if (id === "buddy") {
    setTimeout(() => {
      document.getElementById("chatInput")?.focus();
    }, 300);
  }
}

/* ================= CUTE AUDIO ENGINE ================= */

/*
    This does NOT require an MP3 file.

    It creates little musical sounds directly
    in the browser.

    This makes the audio much more reliable.
*/

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      return null;
    }

    audioContext = new AudioContext();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function playTone(
  frequency,
  duration = 0.12,
  type = "sine",
  volume = 0.08,
  delay = 0,
) {
  const ctx = getAudioContext();

  if (!ctx) return;

  const oscillator = ctx.createOscillator();

  const gain = ctx.createGain();

  oscillator.type = type;

  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(0, ctx.currentTime + delay);

  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.02);

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    ctx.currentTime + delay + duration,
  );

  oscillator.connect(gain);

  gain.connect(ctx.destination);

  oscillator.start(ctx.currentTime + delay);

  oscillator.stop(ctx.currentTime + delay + duration + 0.03);
}

/* CUTE SOUNDS */

function playCuteSound(type) {
  /*
        IMPORTANT:
        The browser allows audio more reliably after
        the user interacts with the page.

        So these sounds are also triggered by buttons.
    */

  if (type === "hello") {
    playTone(523.25, 0.12, "sine", 0.05);

    playTone(659.25, 0.15, "sine", 0.05, 0.12);

    playTone(783.99, 0.2, "sine", 0.05, 0.25);
  }

  if (type === "safe") {
    playTone(523.25, 0.12);
    playTone(659.25, 0.12, "sine", 0.07, 0.1);
    playTone(783.99, 0.18, "sine", 0.07, 0.2);
  }

  if (type === "warning") {
    playTone(440, 0.16, "triangle", 0.07);

    playTone(330, 0.22, "triangle", 0.06, 0.18);
  }

  if (type === "danger") {
    playTone(260, 0.18, "triangle", 0.08);

    playTone(200, 0.22, "triangle", 0.07, 0.18);
  }

  if (type === "success") {
    playTone(523.25, 0.1);
    playTone(659.25, 0.1, "sine", 0.06, 0.1);
    playTone(783.99, 0.1, "sine", 0.06, 0.2);
    playTone(1046.5, 0.25, "sine", 0.07, 0.3);
  }
}

/* ================= VIDEO SYSTEM ================= */

function playVideo(id) {
  const video = document.getElementById(id);

  if (!video) return;

  /* Stop other animations */

  document.querySelectorAll(".video-scene").forEach((scene) => {
    if (scene.id !== id) {
      scene.classList.remove("is-playing");
    }
  });

  /* Restart animation */

  video.classList.remove("is-playing");

  void video.offsetWidth;

  video.classList.add("is-playing");

  playCuteSound("hello");

  showToast("🎬 Buddy is telling you a safety story!");
}

function pauseVideo(id) {
  const video = document.getElementById(id);

  if (!video) return;

  video.classList.remove("is-playing");

  playCuteSound("safe");

  showToast("⏸️ Video paused");
}

function replayVideo(id) {
  const video = document.getElementById(id);

  if (!video) return;

  video.classList.remove("is-playing");

  /*
        Force the browser to restart
        CSS animation.
    */

  void video.offsetWidth;

  video.classList.add("is-playing");

  playCuteSound("success");

  showToast("🔄 Starting again!");
}

/* ================= SAFETY CHECKER ================= */

function analyzeText() {
  const input = document.getElementById("messageInput");

  const text = input.value.trim().toLowerCase();

  if (!text) {
    showToast("✏️ Please type or paste something first!");

    playCuteSound("warning");

    input.focus();

    return;
  }

  const categories = {
    threat: [
      "kill",
      "hurt you",
      "hurt me",
      "weapon",
      "follow you",
      "following you",
      "following me",
      "being followed",
      "come alone",
      "meet me alone",
      "threat",
    ],

    scam: [
      "free money",
      "free phone",
      "winner",
      "you won",
      "prize",
      "gift card",
      "otp",
      "verification code",
      "send money",
      "bank",
      "crypto",
      "click this link",
      "urgent",
    ],

    bullying: [
      "idiot",
      "stupid",
      "loser",
      "ugly",
      "hate you",
      "nobody likes you",
    ],

    stranger: [
      "don't tell your parents",
      "dont tell your parents",
      "keep this secret",
      "send a photo",
      "send pic",
      "where do you live",
      "meet me",
      "school name",
    ],

    inappropriate: ["nude", "naked", "sexual", "explicit"],

    challenge: [
      "dangerous challenge",
      "fire challenge",
      "choking challenge",
      "blackout challenge",
      "hold your breath",
      "jump from",
    ],

    privacy: [
      "password",
      "phone number",
      "home address",
      "full name",
      "location",
      "email address",
    ],

    misinformation: [
      "secret cure",
      "doctors don't want you to know",
      "100% guaranteed",
    ],
  };

  const found = [];

  for (const category in categories) {
    for (const word of categories[category]) {
      if (text.includes(word)) {
        found.push({
          category,
          word,
        });
      }
    }
  }

  let level = "safe";

  const seriousCategories = ["threat", "inappropriate", "challenge"];

  if (found.some((item) => seriousCategories.includes(item.category))) {
    level = "danger";
  } else if (found.length > 0) {
    level = "warning";
  }

  renderResult(level, found, text);
}

/* ================= RESULT ================= */

function renderResult(level, found, originalText) {
  const box = document.getElementById("resultBox");

  const title = document.getElementById("resultTitle");

  const message = document.getElementById("resultMessage");

  const mascot = document.getElementById("resultMascot");

  const dangerWords = document.getElementById("dangerWords");

  const actions = document.getElementById("actionList");

  box.className = "result-box";

  if (level === "safe") {
    box.classList.add("safe");

    title.textContent = "🟢 No obvious warning signs!";

    message.textContent =
      "Buddy didn't spot anything obviously unsafe. Still, always think before you click, share or reply.";

    mascot.textContent = "😊";

    playCuteSound("safe");
  }

  if (level === "warning") {
    box.classList.add("warning");

    title.textContent = "🟡 Hmm... let's be careful!";

    message.textContent =
      "Buddy spotted one or more things that deserve a closer look.";

    mascot.textContent = "🤔";

    playCuteSound("warning");
  }

  if (level === "danger") {
    box.classList.add("danger");

    title.textContent = "🔴 Stop and get help!";

    message.textContent =
      "This message contains signs that could be unsafe or seriously concerning.";

    mascot.textContent = "🛑";

    playCuteSound("danger");
  }

  if (found.length > 0) {
    const uniqueWords = [...new Set(found.map((item) => item.word))];

    dangerWords.innerHTML =
      "<strong>⚠️ Warning signs:</strong> " +
      uniqueWords
        .map((word) => `<span class="danger-word">${escapeHtml(word)}</span>`)
        .join("");
  } else {
    dangerWords.innerHTML = "";
  }

  const actionItems = getActions(level, found);

  actions.innerHTML = actionItems.map((item) => `<li>${item}</li>`).join("");

  box.classList.remove("hidden");

  box.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  state.lastAnswer = message.textContent + " " + actionItems.join(" ");

  state.speechText = state.lastAnswer;
}

function getActions(level, found) {
  const categories = new Set(found.map((item) => item.category));

  if (categories.has("threat")) {
    return [
      "🛑 Stop replying.",
      "🏃 Move somewhere safe if you feel in danger.",
      "👨‍👩‍👧 Tell a trusted adult immediately.",
      "🚫 Block and report the person.",
      "🆘 If there is immediate danger, contact local emergency services.",
    ];
  }

  if (categories.has("scam")) {
    return [
      "🚫 Don't click suspicious links.",
      "🔐 Never share your OTP or password.",
      "💰 Don't send money because someone pressures you.",
      "👨‍👩‍👧 Ask a trusted adult before doing anything.",
    ];
  }

  if (categories.has("stranger")) {
    return [
      "🛑 Don't meet the person.",
      "📸 Don't send private photos.",
      "🤐 Don't keep unsafe secrets.",
      "👨‍👩‍👧 Tell a trusted adult.",
    ];
  }

  if (categories.has("privacy")) {
    return [
      "🔒 Keep personal information private.",
      "🚫 Don't share passwords or OTPs.",
      "👀 Check your privacy settings.",
      "👨‍👩‍👧 Ask a trusted adult if you're unsure.",
    ];
  }

  if (categories.has("bullying")) {
    return [
      "💚 Don't join in.",
      "🚫 Block the bully.",
      "📸 Save evidence if it is safe to do so.",
      "📢 Report the behavior.",
      "👨‍👩‍👧 Tell a trusted adult.",
    ];
  }

  if (categories.has("challenge")) {
    return [
      "🛑 Don't try a dangerous challenge.",
      "🚶 Move away from the situation.",
      "📢 Report dangerous content.",
      "👨‍👩‍👧 Tell a trusted adult.",
    ];
  }

  return [
    "🤔 Think before replying.",
    "🔐 Keep personal information private.",
    "👨‍👩‍👧 Ask a trusted adult if you're unsure.",
  ];
}

/* ================= CHAT BUDDY ================= */

function handleChatKey(event) {
  if (event.key === "Enter") {
    sendChat();
  }
}

function askSuggestion(question) {
  document.getElementById("chatInput").value = question;

  sendChat();
}

function sendChat() {
  const input = document.getElementById("chatInput");

  const text = input.value.trim();

  if (!text) return;

  addChatMessage(text, "user");

  input.value = "";

  setTimeout(() => {
    const answer = getBuddyAnswer(text.toLowerCase());

    addChatMessage(answer, "buddy");

    state.lastAnswer = answer;

    state.speechText = answer;

    playCuteSound("hello");
  }, 450);
}

function addChatMessage(text, type) {
  const container = document.getElementById("chatMessages");

  const message = document.createElement("div");

  message.className = `chat-message ${
    type === "user" ? "user-message" : "buddy-message"
  }`;

  if (type === "buddy") {
    message.innerHTML = `
            <div class="chat-avatar">🛡️</div>
            <div class="bubble">
                ${escapeHtml(text)}
            </div>
        `;
  } else {
    message.innerHTML = `
            <div class="bubble">
                ${escapeHtml(text)}
            </div>
        `;
  }

  container.appendChild(message);

  container.scrollTop = container.scrollHeight;
}

function getBuddyAnswer(text) {
  if (text.includes("password") || text.includes("otp")) {
    return "🔐 Keep passwords and OTPs private. A trustworthy person or company should not ask you to share your password or verification code.";
  }

  if (
    text.includes("stranger") ||
    text.includes("meet") ||
    text.includes("person")
  ) {
    return "👋 Remember: someone you only know online is still a stranger. Don't meet them alone or share private information. Tell a trusted adult.";
  }

  if (
    text.includes("scam") ||
    text.includes("prize") ||
    text.includes("free money") ||
    text.includes("winner")
  ) {
    return "🎁 If someone promises a prize and asks for money, passwords or OTPs, stop. Don't click the link and ask a trusted adult.";
  }

  if (text.includes("bully") || text.includes("bullying")) {
    return "💚 You don't deserve bullying. Don't fight back online. Save evidence if safe, block the person, report them and tell a trusted adult.";
  }

  if (
    text.includes("danger") ||
    text.includes("unsafe") ||
    text.includes("threat") ||
    text.includes("following")
  ) {
    return "🆘 If you feel unsafe, stop replying and move somewhere safe. Tell a trusted adult immediately. If you are in immediate danger, contact local emergency services.";
  }

  if (text.includes("link")) {
    return "🔗 Don't open a suspicious link just to see where it goes. You can use SafeBuddy's Link Checker first.";
  }

  if (text.includes("confused")) {
    return "😊 That's okay! You don't need to figure everything out alone. If something feels weird, stop, don't share anything, and ask a trusted adult.";
  }

  return "🌟 Good question! A simple safety rule is: stop, think, protect your private information, and ask a trusted adult whenever something feels wrong.";
}

/* ================= READ ALOUD ================= */

/*
    This uses the browser's Speech Synthesis API.

    It automatically searches for a voice matching
    the selected language.
*/

let selectedVoice = null;

function getSpeechLanguage() {
  const languages = {
    en: "en-US",

    hi: "hi-IN",

    mr: "mr-IN",

    fr: "fr-FR",

    zh: "zh-CN",

    ar: "ar-SA",

    ja: "ja-JP",
  };

  return languages[state.lang] || "en-US";
}

function findBestVoice() {
  if (!("speechSynthesis" in window)) {
    return null;
  }

  const voices = speechSynthesis.getVoices();

  const wanted = getSpeechLanguage().toLowerCase();

  /*
        First try exact language.
    */

  let voice = voices.find((v) => v.lang.toLowerCase() === wanted);

  /*
        Then try same language family.
    */

  if (!voice) {
    const family = wanted.split("-")[0];

    voice = voices.find((v) => v.lang.toLowerCase().startsWith(family));
  }

  /*
        Finally use an English voice.
    */

  if (!voice) {
    voice = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
  }

  return voice || null;
}

function readLastAnswer() {
  const text = state.speechText || state.lastAnswer;

  if (!text) {
    showToast("💬 Ask Buddy something first!");

    return;
  }

  if (!("speechSynthesis" in window)) {
    showToast("🔊 Your browser does not support Read Aloud.");

    return;
  }

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = getSpeechLanguage();

  selectedVoice = findBestVoice();

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.rate = 0.9;

  utterance.pitch = 1.25;

  utterance.volume = 1;

  utterance.onstart = () => {
    showToast("🔊 Buddy is talking...");
  };

  utterance.onend = () => {
    showToast("✨ Buddy finished!");
  };

  utterance.onerror = (event) => {
    console.log("Speech error:", event.error);

    showToast("🔊 Audio couldn't start. Try pressing Read again.");
  };

  speechSynthesis.speak(utterance);
}

/*
    Some browsers load voices after
    the page starts.

    This makes sure our voice list updates.
*/

if ("speechSynthesis" in window) {
  speechSynthesis.onvoiceschanged = () => {
    selectedVoice = findBestVoice();
  };
}

function pauseSpeech() {
  if ("speechSynthesis" in window && speechSynthesis.speaking) {
    speechSynthesis.pause();

    showToast("⏸️ Buddy paused");
  }
}

function replaySpeech() {
  if (!state.speechText) {
    showToast("💬 Ask Buddy something first!");

    return;
  }

  speechSynthesis.cancel();

  setTimeout(() => {
    readLastAnswer();
  }, 100);
}

/* ================= VOICE INPUT ================= */

function startVoiceInput() {
  const Recognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!Recognition) {
    showToast("🎤 Voice input isn't supported in this browser.");

    return;
  }

  const recognition = new Recognition();

  recognition.lang = getSpeechLanguage();

  recognition.interimResults = false;

  recognition.maxAlternatives = 1;

  showToast("🎤 I'm listening...");

  recognition.start();

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;

    document.getElementById("chatInput").value = text;

    sendChat();
  };

  recognition.onerror = () => {
    showToast("🎤 I couldn't hear that. Try again.");
  };
}

/* ================= LINK CHECKER ================= */

function checkLink() {
  const input = document.getElementById("linkInput");

  const result = document.getElementById("linkResult");

  const value = input.value.trim();

  if (!value) {
    showToast("🔗 Paste a link first!");

    return;
  }

  let url;

  try {
    url = new URL(value.startsWith("http") ? value : "https://" + value);
  } catch {
    result.innerHTML = "🔴 That doesn't look like a valid web address.";

    playCuteSound("warning");

    return;
  }

  const warnings = [];

  if (url.protocol !== "https:") {
    warnings.push("The link does not use HTTPS.");
  }

  if (url.hostname.includes("xn--")) {
    warnings.push("The domain uses special encoded characters.");
  }

  if (url.hostname.split(".").length > 4) {
    warnings.push("The domain has many subdomains.");
  }

  if (value.length > 150) {
    warnings.push("The URL is unusually long.");
  }

  const shorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl"];

  if (shorteners.some((domain) => url.hostname.includes(domain))) {
    warnings.push("This is a shortened link, so its destination is hidden.");
  }

  if (warnings.length === 0) {
    result.innerHTML =
      "🟢 No obvious warning signs were detected. Still check who sent the link before opening it.";

    playCuteSound("safe");
  } else {
    result.innerHTML =
      "🟡 Be careful:<br><br>" +
      warnings.map((item) => "• " + escapeHtml(item)).join("<br>");

    playCuteSound("warning");
  }
}

/* ================= SCREENSHOT ================= */

function setupScreenshot() {
  const input = document.getElementById("screenshotInput");

  if (!input) return;

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const preview = document.getElementById("screenshotPreview");

    preview.src = URL.createObjectURL(file);

    preview.classList.remove("hidden");

    showToast("📸 Screenshot loaded!");
  });
}

function analyzeScreenshotText() {
  const text = document.getElementById("screenshotText").value;

  if (!text.trim()) {
    showToast("✏️ Type the important text from the screenshot first.");

    return;
  }

  document.getElementById("messageInput").value = text;

  analyzeText();
}

/* ================= QUIZ ================= */

const quizQuestions = [
  {
    question: "Someone online asks for your password. What should you do?",

    options: ["Give it to them.", "Keep it private.", "Post it in a group."],

    correct: 1,
  },

  {
    question:
      "You receive a message saying you won ₹50,000 and need to send an OTP.",

    options: [
      "Send the OTP.",

      "Ask them for another OTP.",

      "Don't share the OTP.",
    ],

    correct: 2,
  },

  {
    question: "An online stranger asks to meet you alone.",

    options: ["Go secretly.", "Tell a trusted adult.", "Don't tell anyone."],

    correct: 1,
  },

  {
    question: "Someone is bullying you online.",

    options: [
      "Join their bullying.",

      "Block/report and tell an adult.",

      "Give them your password.",
    ],

    correct: 1,
  },

  {
    question: "What is okay to share publicly?",

    options: ["Your password.", "Your home address.", "A hobby you enjoy."],

    correct: 2,
  },
];

function renderQuiz() {
  const question = quizQuestions[state.quizIndex];

  if (!question) {
    finishQuiz();

    return;
  }

  document.getElementById("quizNumber").textContent = state.quizIndex + 1;

  document.getElementById("quizQuestion").textContent = question.question;

  const options = document.getElementById("quizOptions");

  options.innerHTML = "";

  question.options.forEach((option, index) => {
    const button = document.createElement("button");

    button.className = "quiz-option";

    button.textContent = option;

    button.onclick = () => answerQuiz(index);

    options.appendChild(button);
  });

  document.getElementById("quizFeedback").textContent = "";
}

function answerQuiz(index) {
  const question = quizQuestions[state.quizIndex];

  const buttons = document.querySelectorAll(".quiz-option");

  buttons.forEach((button) => (button.disabled = true));

  if (index === question.correct) {
    buttons[index].classList.add("correct");

    document.getElementById("quizFeedback").textContent =
      "🎉 Great job! You spotted the safe choice!";

    addPoints(5);

    playCuteSound("success");
  } else {
    buttons[index].classList.add("wrong");

    buttons[question.correct].classList.add("correct");

    document.getElementById("quizFeedback").textContent =
      "💡 Good try! Look at the green answer.";

    playCuteSound("warning");
  }

  setTimeout(() => {
    state.quizIndex++;

    renderQuiz();
  }, 1300);
}

function finishQuiz() {
  const options = document.getElementById("quizOptions");

  document.getElementById("quizQuestion").textContent =
    `🎉 Quiz complete! You got ${state.quizScore} points!`;

  options.innerHTML = `

        <button
            class="primary-button"
            onclick="restartQuiz()">

            🔄 Play Again

        </button>

    `;

  playCuteSound("success");
}

function restartQuiz() {
  state.quizIndex = 0;

  state.quizScore = 0;

  renderQuiz();
}

/* ================= DAILY CHALLENGE ================= */

function completeChallenge() {
  const today = new Date().toDateString();

  const completed = localStorage.getItem("challenge-" + today);

  if (completed) {
    showToast("🌟 You already completed today's challenge!");

    return;
  }

  localStorage.setItem("challenge-" + today, "yes");

  addPoints(10);

  playCuteSound("success");

  showToast("🎉 Challenge complete! +10 stars!");
}

/* ================= POINTS ================= */

function addPoints(amount) {
  state.points += amount;

  localStorage.setItem("safeBuddyPoints", state.points);

  document.getElementById("points").textContent = state.points;

  updateBadges();
}

function updateBadges() {
  const badges = document.querySelectorAll(".badge");

  if (state.points >= 10) {
    badges[0].classList.remove("locked");

    badges[0].innerHTML = "🎣<br>Scam Spotter";
  }

  if (state.points >= 20) {
    badges[1].classList.remove("locked");

    badges[1].innerHTML = "🔐<br>Privacy Pro";
  }

  if (state.points >= 30) {
    badges[2].classList.remove("locked");

    badges[2].innerHTML = "🛡️<br>Safety Explorer";
  }
}

/* ================= PARENT INFO ================= */

function showParentInfo() {
  alert(
    "SafeBuddy is designed to encourage children to ask trusted adults for help. Messages are not automatically sent to parents by this demo.",
  );
}

/* ================= MODALS ================= */

document.getElementById("settingsButton")?.addEventListener("click", () => {
  document.getElementById("settingsModal").classList.remove("hidden");
});

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

/* ================= TOAST ================= */

let toastTimer;

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* ================= CLEAR ================= */

function clearChecker() {
  document.getElementById("messageInput").value = "";

  document.getElementById("resultBox").classList.add("hidden");
}

/* ================= SECURITY ================= */

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
