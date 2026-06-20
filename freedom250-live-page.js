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

  function getUiLanguage() {
    const lang = (document.documentElement.lang || "en").toLowerCase();
    return lang.indexOf("es") === 0 ? "es" : "en";
  }

  const uiText = {
    en: {
      morningNote: "Morning Session: Join the morning Essentials broadcast and devotional activities.",
      afternoonNote: "Afternoon Session: Continue with classes, discussion, and practical applications.",
      eveningNote: "Evening Session: Join the evening service, music, and spiritual activities.",
      watchLive: "Watch Live",
      watchReplays: "Watch Replays",
      upcoming: "Upcoming Broadcast",
      streamMissing: "Stream not available yet.",
      streamInvalid: "The stream link is not valid.",
      updating: "Session is now live. Updating stream..."
    },
    es: {
      morningNote: "Sesión de la mañana: Acompáñenos en la transmisión de Essentials y las actividades devocionales.",
      afternoonNote: "Sesión de la tarde: Continúe con clases, conversación y aplicaciones prácticas.",
      eveningNote: "Sesión de la noche: Acompáñenos en el servicio, la música y las actividades espirituales.",
      watchLive: "Ver en vivo",
      watchReplays: "Ver repeticiones",
      upcoming: "Próxima transmisión",
      streamMissing: "La transmisión aún no está disponible.",
      streamInvalid: "El enlace de la transmisión no es válido.",
      updating: "La sesión ya está en vivo. Actualizando transmisión..."
    }
  };

  const t = uiText[getUiLanguage()];

  const notes = {
    morning: t.morningNote,
    afternoon: t.afternoonNote,
    evening: t.eveningNote
  };

  const timeLabels = {
    en: { morning: "Morning", afternoon: "Afternoon", evening: "Evening" },
    es: { morning: "Mañana", afternoon: "Tarde", evening: "Noche" }
  };

  const languageLabels = {
    en: "English",
    es: "Español"
  };

  const selectionLabel = document.getElementById("current-selection-label");
  const sessionNote = document.getElementById("session-note");
  const timeButtons = app.querySelectorAll(".time-btn");
  const streamButtons = app.querySelectorAll("[data-language]");
  const mdtClock = document.getElementById("f250-current-mdt");

  function cleanUrl(url) {
    return String(url || "")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .trim();
  }

  function isValidVideoUrl(url) {
    const clean = cleanUrl(url);

    return (
      clean.indexOf("https://boxcast.tv/embed-app.html#") === 0 ||
      clean.indexOf("https://www.boxcast.tv/embed-app.html#") === 0 ||
      /^https:\/\/(player\.)?vimeo\.com\//.test(clean) ||
      /^https:\/\/vimeo\.com\//.test(clean)
    );
  }

  function makeVimeoEmbedUrl(url) {
    const clean = cleanUrl(url);
    if (/^https:\/\/player\.vimeo\.com\//.test(clean)) return clean;

    const match = clean.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (match && match[1]) return "https://player.vimeo.com/video/" + match[1];

    return clean;
  }

  function normalizeVideoUrl(url) {
    const clean = cleanUrl(url);
    if (clean.indexOf("vimeo.com") !== -1) return makeVimeoEmbedUrl(clean);
    return clean;
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function getRegistrantLanguage() {
    const raw =
      document.getElementById("f250-registrant-language")
        ?.textContent.trim().toLowerCase() || "";

    console.log("Essentials content language:", raw);

    if (
      raw.includes("spanish") ||
      raw.includes("español") ||
      raw.includes("espanol") ||
      raw.includes("espa") ||
      raw === "es"
    ) {
      return "es";
    }

    return "en";
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

    let raw = dateEl.textContent
      .replace(/\s+/g, " ")
      .trim();

    // Remove weekday before comma:
    // Thursday, June 18, 2026
    // jueves, 18 de junio de 2026
    raw = raw.replace(/^[^,]+,\s*/, "");

    const parsed = new Date(raw + " 12:00:00");

    if (!isNaN(parsed.getTime())) {
      return getMDTDateString(parsed);
    }

    const monthsEs = {
      enero: "01",
      febrero: "02",
      marzo: "03",
      abril: "04",
      mayo: "05",
      junio: "06",
      julio: "07",
      agosto: "08",
      septiembre: "09",
      setiembre: "09",
      octubre: "10",
      noviembre: "11",
      diciembre: "12"
    };

    const normalized = raw
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    const match = normalized.match(/^(\d{1,2}) de ([a-z]+) de (\d{4})$/);

    if (match && monthsEs[match[2]]) {
      return match[3] + "-" + monthsEs[match[2]] + "-" + match[1].padStart(2, "0");
    }

    console.log("Could not parse session date:", raw);
    return "";
  }

  function getSessionDateStatus() {
    const todayMDT = getMDTDateString(new Date());
    const sessionDate = getSessionDateString();

    if (!sessionDate) return "today";
    if (sessionDate < todayMDT) return "past";
    if (sessionDate > todayMDT) return "future";

    return "today";
  }

  function getEventMinutes() {
    if (typeof window.f250TestMinutes === "number") return window.f250TestMinutes;

    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Denver",
        hour: "numeric",
        minute: "numeric",
        hour12: false
      }).formatToParts(new Date());

      const hourPart = parts.find(part => part.type === "hour");
      const minutePart = parts.find(part => part.type === "minute");

      const hour = hourPart ? parseInt(hourPart.value, 10) : 9;
      const minute = minutePart ? parseInt(minutePart.value, 10) : 0;

      return hour * 60 + minute;
    } catch (e) {
      return 9 * 60;
    }
  }

  function parseTimeToMinutes(value) {
    if (!value) return null;

    const clean = String(value).replace(/\s+/g, " ").trim();

    const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

    if (!match) {
      console.log("Could not parse session time:", clean);
      return null;
    }

    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();

    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;

    return hour * 60 + minute;
  }

  function getSessionStartMinutes() {
    return parseTimeToMinutes(
      document.getElementById("f250-session-start-time")?.textContent || ""
    );
  }

  function getSessionEndMinutes() {
    return parseTimeToMinutes(
      document.getElementById("f250-session-end-time")?.textContent || ""
    );
  }


  function getLiveBlock() {
    if (getSessionDateStatus() !== "today") return "";

    const minutes = getEventMinutes();
    const start = getSessionStartMinutes();
    const end = getSessionEndMinutes();

    if (start === null || end === null) return "";

    if (minutes < start || minutes > end) return "";

    const availableBlocks = ["morning", "afternoon", "evening"].filter(function (block) {
      return cleanUrl(videoMap[currentLanguage]?.[block] || "");
    });

    if (!availableBlocks.length) return "";

    if (availableBlocks.length === 1) return availableBlocks[0];

    const afternoonStart = (14 * 60) - 5;
    const eveningStart = (19 * 60) - 5;

    if (minutes >= eveningStart && availableBlocks.includes("evening")) return "evening";
    if (minutes >= afternoonStart && availableBlocks.includes("afternoon")) return "afternoon";

    return availableBlocks[0];
  }
  

  function getDefaultTimeBlock() {
    const status = getSessionDateStatus();
    const liveBlock = getLiveBlock();

    const availableBlocks = ["morning", "afternoon", "evening"].filter(function (block) {
      return cleanUrl(videoMap[getDefaultLanguage()]?.[block] || "");
    });

    if (!availableBlocks.length) return "morning";

    if (status === "past") {
      const savedTime = localStorage.getItem("f250-essentials-time-block");

      if (availableBlocks.includes(savedTime)) {
        return savedTime;
      }

      return availableBlocks[0];
    }

    if (liveBlock) return liveBlock;

    return availableBlocks[0];
  }

  function getDefaultLanguage() {
    return getRegistrantLanguage();
  }

  function updateClock() {
    if (!mdtClock) return;

    mdtClock.textContent = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Denver",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(new Date());
  }

  function updatePageState() {
    const status = getSessionDateStatus();
    const titleEl = document.getElementById("f250-page-title");
    if (!titleEl) return;

    if (status === "future") {
      titleEl.textContent = t.upcoming;
    } else if (status === "past") {
      titleEl.textContent = t.watchReplays;
    } else {
      titleEl.textContent = t.watchLive;
    }
  }

  function showMessage(message) {
    playerWrap.innerHTML =
      '<div class="f250-stream-placeholder">' + message + "</div>";
  }

  function showIframe(url) {
    const shell = document.querySelector(".f250-player-shell");

    if (shell) {
      shell.classList.remove("replay-mode");

      if (url && url.includes("layout=playlist-to-right")) {
        shell.classList.add("replay-mode");
      }
    }

    playerWrap.innerHTML =
      '<iframe id="f250-live-iframe" ' +
      'src="' + normalizeVideoUrl(url) + '" ' +
      'title="Freedom250 Essentials Stream" ' +
      'allow="autoplay; fullscreen; picture-in-picture" ' +
      'allowfullscreen ' +
      'frameborder="0"></iframe>';
  }

  function syncAvailableTimeButtons() {
    ["morning", "afternoon", "evening"].forEach(function (block) {
      const button = app.querySelector('[data-time="' + block + '"]');
      if (!button) return;

      const hasUrl = cleanUrl(videoMap[currentLanguage]?.[block] || "");

      button.style.display = hasUrl ? "" : "none";
    });
  }

  function syncActiveButtons() {
    const liveBlock = getLiveBlock();
    const status = getSessionDateStatus();

    timeButtons.forEach(function (button) {
      const block = button.getAttribute("data-time");

      button.classList.toggle("active", block === currentTime);
      button.classList.toggle("live", block === liveBlock);

      const sessionEnd = getSessionEndMinutes();

      let completed = false;

      if (status === "past") {
        completed = true;
      } else if (status === "today") {
        if (!liveBlock && sessionEnd !== null &&  getEventMinutes() > sessionEnd) {
          completed = true;
        } else if (liveBlock === "afternoon" && block === "morning") {
          completed = true;
        } else if (liveBlock === "evening" && (block === "morning" || block === "afternoon")) {
          completed = true;
        }
      }

      button.classList.toggle("completed", completed);
    });

    streamButtons.forEach(function (button) {
      button.classList.toggle(
        "active",
        button.getAttribute("data-language") === currentLanguage
      );
    });
  }

  function updatePlayer() {
    const uiLang = getUiLanguage();

    if (selectionLabel) {
      selectionLabel.textContent =
        timeLabels[uiLang][currentTime];
    }

    if (sessionNote) {
      sessionNote.textContent = notes[currentTime] || "";
    }

    const url = cleanUrl(videoMap[currentLanguage]?.[currentTime] || "");

    if (!url) {
      showMessage(t.streamMissing);
      return;
    }

    if (!isValidVideoUrl(url)) {
      showMessage(t.streamInvalid);
      return;
    }

    if (getSessionDateStatus() === "past") {
      localStorage.setItem("f250-essentials-time-block", currentTime);
    }

    showIframe(url);
  }

  function showTransitionMessage(nextBlock) {
    const message = document.getElementById("f250-transition-message");
    if (!message) return;

    const uiLang = getUiLanguage();
    const label = timeLabels[uiLang][nextBlock] || capitalize(nextBlock);

    message.textContent = label + " " + t.updating;
    message.classList.add("show");

    setTimeout(function () {
      message.classList.remove("show");
    }, 4000);
  }

  let currentTime = getDefaultTimeBlock();
  let currentLanguage = getDefaultLanguage();

  console.log("Registrant Language:", getRegistrantLanguage());
  console.log("Current Language:", currentLanguage);
  let lastAutoBlock = currentTime;

  streamButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const lang = this.getAttribute("data-language") || "en";

      if (lang !== "en" && lang !== "es") return;

      currentLanguage = lang;
      syncAvailableTimeButtons();
      syncActiveButtons();
      updatePlayer();
    });
  });

  timeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentTime = this.getAttribute("data-time") || "morning";
      syncAvailableTimeButtons();
      syncActiveButtons();
      updatePlayer();
    });
  });

  updateClock();
  updatePageState();
  syncAvailableTimeButtons();
  syncActiveButtons();
  updatePlayer();

  setInterval(function () {
    updateClock();
    updatePageState();

    const currentAutoBlock = getDefaultTimeBlock();

    if (getSessionDateStatus() === "today" && currentAutoBlock !== lastAutoBlock) {
      showTransitionMessage(currentAutoBlock);

      currentTime = currentAutoBlock;
      lastAutoBlock = currentAutoBlock;

      setTimeout(function () {
        syncAvailableTimeButtons();
        syncActiveButtons();
        updatePlayer();
      }, 2000);
    }

    syncActiveButtons();
  }, 60000);

})();