(function () {
  const app = document.getElementById("f250-live-app");
  if (!app) return;

  const playerWrap = app.querySelector(".f250-player-ratio");
  if (!playerWrap) return;

  const videoMap = {
    en: {
      morning: document.getElementById("f250-stream-en-morning")?.textContent.trim() || "",
      afternoon: document.getElementById("f250-stream-en-afternoon")?.textContent.trim() || "",
      evening: document.getElementById("f250-stream-en-evening")?.textContent.trim() || ""
    },
    es: {
      morning: document.getElementById("f250-stream-es-morning")?.textContent.trim() || "",
      afternoon: document.getElementById("f250-stream-es-afternoon")?.textContent.trim() || "",
      evening: document.getElementById("f250-stream-es-evening")?.textContent.trim() || ""
    }
  };

  const audioMap = {
    "audio-en": document.getElementById("f250-audio-en")?.innerHTML.trim() || "",
    "audio-es": document.getElementById("f250-audio-es")?.innerHTML.trim() || "",
    "audio-pt": document.getElementById("f250-audio-pt")?.innerHTML.trim() || ""
  };

  const notes = {
    morning: "Morning Session: Join the morning broadcast and devotional activities.",
    afternoon: "Afternoon Session: Continue with the afternoon presentations, decrees, and services.",
    evening: "Evening Session: Join the evening service and spiritual activities."
  };

  const selectionLabel = document.getElementById("current-selection-label");
  const sessionNote = document.getElementById("session-note");
  const timeButtons = app.querySelectorAll(".time-btn");
  const languageButtons = app.querySelectorAll(".language-btn");
  const mdtClock = document.getElementById("f250-current-mdt");

  function cleanUrl(url) {
    return String(url || "").replace(/&amp;/g, "&").trim();
  }

  function isValidVideoUrl(url) {
    return (
      /^https:\/\/(www\.)?boxcast\.tv\/embed-app\.html/.test(url) ||
      /^https:\/\/(player\.)?vimeo\.com\//.test(url) ||
      /^https:\/\/vimeo\.com\//.test(url)
    );
  }

  function makeVimeoEmbedUrl(url) {
    const clean = cleanUrl(url);

    if (/^https:\/\/player\.vimeo\.com\//.test(clean)) {
      return clean;
    }

    const match = clean.match(/vimeo\.com\/(?:video\/)?(\d+)/);

    if (match && match[1]) {
      return "https://player.vimeo.com/video/" + match[1];
    }

    return clean;
  }

  function normalizeVideoUrl(url) {
    const clean = cleanUrl(url);

    if (clean.indexOf("vimeo.com") !== -1) {
      return makeVimeoEmbedUrl(clean);
    }

    return clean;
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function getMDTDateString(date) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Denver",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(date);
  }

  function getSessionDateString() {
    const dateEl = document.getElementById("f250-session-date");
    if (!dateEl) return "";

    const parsed = new Date(dateEl.textContent.trim());
    if (isNaN(parsed.getTime())) return "";

    return getMDTDateString(parsed);
  }

  function getSessionDateStatus() {
    const todayMDT = getMDTDateString(new Date());
    const sessionDate = getSessionDateString();

    if (!sessionDate) return "today";
    if (sessionDate < todayMDT) return "past";
    if (sessionDate > todayMDT) return "future";

    return "today";
  }

  function getEventHour() {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Denver",
        hour: "numeric",
        hour12: false
      }).formatToParts(new Date());

      const hourPart = parts.find(function (part) {
        return part.type === "hour";
      });

      return hourPart ? parseInt(hourPart.value, 10) : 9;
    } catch (e) {
      return 9;
    }
  }

  function getLiveBlock() {
    if (getSessionDateStatus() !== "today") return "";

    const hour = getEventHour();

    if (hour >= 7 && hour < 14) return "morning";
    if (hour >= 14 && hour < 19) return "afternoon";
    if (hour >= 19 && hour < 22) return "evening";

    return "";
  }

  function getDefaultTimeBlock() {
    const status = getSessionDateStatus();
    const liveBlock = getLiveBlock();
    const hour = getEventHour();

    if (liveBlock) return liveBlock;
    if (status === "past") return "morning";
    if (status === "future") return "morning";

    if (hour < 14) return "morning";
    if (hour < 19) return "afternoon";

    return "evening";
  }

  function getDefaultLanguage() {
    const stored = localStorage.getItem("f250-main-language");
    if (stored && (videoMap[stored] || audioMap[stored])) return stored;

    const htmlLang = document.documentElement.lang || "";

    if (htmlLang.toLowerCase().indexOf("es") === 0) return "es";
    if (htmlLang.toLowerCase().indexOf("pt") === 0) return "audio-pt";

    return "en";
  }

  function updateClock() {
    if (!mdtClock) return;

    const time = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Denver",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(new Date());

    mdtClock.textContent = time;
  }

  function updatePageState() {
    const status = getSessionDateStatus();
    const titleEl = document.getElementById("f250-page-title");

    if (!titleEl) return;

    if (status === "future") {
      titleEl.textContent = "Upcoming Broadcast";
    } else if (status === "past") {
      titleEl.textContent = "Watch Replays";
    } else {
      titleEl.textContent = "Watch Live";
    }
  }

  function showMessage(message) {
    playerWrap.innerHTML =
      '<div class="f250-stream-placeholder">' + message + "</div>";
  }

  function showIframe(url) {
    playerWrap.innerHTML =
      '<iframe id="f250-live-iframe" ' +
      'src="' + normalizeVideoUrl(url) + '" ' +
      'title="Freedom250 Live Stream" ' +
      'allow="autoplay; fullscreen; picture-in-picture" ' +
      'allowfullscreen ' +
      'frameborder="0"></iframe>';
  }

  function showAudio(html) {
    playerWrap.innerHTML =
      '<div class="f250-audio-player">' + html + "</div>";
  }

  function syncActiveButtons() {
    const liveBlock = getLiveBlock();
    const status = getSessionDateStatus();

    timeButtons.forEach(function (button) {
      const block = button.getAttribute("data-time");

      button.classList.toggle("active", block === currentTime);
      button.classList.toggle("live", block === liveBlock);

      let completed = false;

      if (status === "past") {
        completed = true;
      } else if (status === "today") {
        if (!liveBlock && getEventHour() >= 22) {
          completed = true;
        } else if (liveBlock === "afternoon" && block === "morning") {
          completed = true;
        } else if (liveBlock === "evening" && (block === "morning" || block === "afternoon")) {
          completed = true;
        }
      }

      button.classList.toggle("completed", completed);
    });

    languageButtons.forEach(function (button) {
      button.classList.toggle(
        "active",
        button.getAttribute("data-language") === currentLanguage
      );
    });
  }

  function updatePlayer() {
    if (selectionLabel) {
      selectionLabel.textContent =
        capitalize(currentTime) + " • " + getLanguageLabel(currentLanguage);
    }

    if (sessionNote) {
      sessionNote.textContent = notes[currentTime] || "";
    }

    if (audioMap[currentLanguage]) {
      showAudio(audioMap[currentLanguage]);
      return;
    }

    const url = cleanUrl(videoMap[currentLanguage]?.[currentTime] || "");

    if (!url) {
      showMessage("Stream not available yet.");
      return;
    }

    if (!isValidVideoUrl(url)) {
      showMessage("The stream link is not valid.");
      return;
    }

    showIframe(url);
  }

  function getLanguageLabel(language) {
    const labels = {
      en: "English",
      es: "Español",
      "audio-en": "Audio English",
      "audio-es": "Audio Español",
      "audio-pt": "Audio Português"
    };

    return labels[language] || "English";
  }

  let currentTime = getDefaultTimeBlock();
  let currentLanguage = getDefaultLanguage();

  timeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentTime = this.getAttribute("data-time") || "morning";
      syncActiveButtons();
      updatePlayer();
    });
  });

  languageButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentLanguage = this.getAttribute("data-language") || "en";
      localStorage.setItem("f250-main-language", currentLanguage);
      syncActiveButtons();
      updatePlayer();
    });
  });

  function showTransitionMessage(nextBlock) {
    const msg = document.getElementById("f250-transition-message");
    if (!msg) return;

    msg.textContent =
      capitalize(nextBlock) +
      " Session is now live. Updating stream...";

    msg.style.display = "block";

    setTimeout(function () {
      msg.style.display = "none";
    }, 5000);
  }



  updateClock();
  updatePageState();

  let lastAutoBlock = getDefaultTimeBlock();

  setInterval(function () {

    updateClock();
    updatePageState();

    const currentAutoBlock = getDefaultTimeBlock();

    if (
      (currentLanguage === "en" || currentLanguage === "es") &&
      currentAutoBlock !== lastAutoBlock
    ) {

      showTransitionMessage(currentAutoBlock);

      currentTime = currentAutoBlock;
      lastAutoBlock = currentAutoBlock;

      setTimeout(function () {
        syncActiveButtons();
        updatePlayer();
      }, 2000);
    }

    syncActiveButtons();

  }, 60000);

  syncActiveButtons();
  updatePlayer();
})();