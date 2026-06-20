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
    },
    pt: {
      morning: document.getElementById("f250-stream-pt-morning")?.textContent.trim() || "",
      afternoon: document.getElementById("f250-stream-pt-afternoon")?.textContent.trim() || "",
      evening: document.getElementById("f250-stream-pt-evening")?.textContent.trim() || ""
    }
  };

  const audioMap = {
    "audio-en": document.getElementById("f250-audio-en")?.innerHTML.trim() || "",
    "audio-es": document.getElementById("f250-audio-es")?.innerHTML.trim() || "",
    "audio-pt": document.getElementById("f250-audio-pt")?.innerHTML.trim() || ""
  };

  function getUiLanguage() {
    const lang = (document.documentElement.lang || "en").toLowerCase();

    if (lang.indexOf("es") === 0) return "es";
    if (lang.indexOf("pt") === 0) return "pt";

    return "en";
  }

  const uiText = {
    en: {
      morningNote: "Morning Session: Morning decrees, lectures, workshops and self-reflection exercises.",
      afternoonNote: "Afternoon Session: Lectures, group discussion, dictations and seminar activities.",
      eveningNote: "Evening Session: Service, devotional activities and spiritual practices.",
      watchLive: "Seminar Live",
      watchReplays: "Seminar Replays",
      upcoming: "Upcoming Seminar Broadcast",
      streamMissing: "Stream not available yet.",
      streamInvalid: "The stream link is not valid.",
      updating: "Session is now live. Updating stream..."
    },
    es: {
      morningNote: "Sesión de la mañana: Decretos matutinos, conferencias, talleres y ejercicios de autorreflexión.",
      afternoonNote: "Sesión de la tarde: Conferencias, discusiones en grupo, dictados y actividades del seminario.",
      eveningNote: "Sesión de la noche: Servicio, actividades devocionales y prácticas espirituales.",
      watchLive: "Seminario en Vivo",
      watchReplays: "Repeticiones del Seminario",
      upcoming: "Próxima Transmisión del Seminario",
      streamMissing: "La transmisión aún no está disponible.",
      streamInvalid: "El enlace de la transmisión no es válido.",
      updating: "La sesión ya está en vivo. Actualizando transmisión..."
    },
    pt: {
      morningNote: "Sessão da manhã: Decretos matinais, palestras, workshops e exercícios de autorreflexão.",
      afternoonNote: "Sessão da tarde: Palestras, discussões em grupo, ditados e atividades do seminário.",
      eveningNote: "Sessão da noite: Serviço, atividades devocionais e práticas espirituais.",
      watchLive: "Seminário ao Vivo",
      watchReplays: "Reprises do Seminário",
      upcoming: "Próxima Transmissão do Seminário",
      streamMissing: "A transmissão ainda não está disponível.",
      streamInvalid: "O link da transmissão não é válido.",
      updating: "A sessão já está ao vivo. Atualizando transmissão..."
    }
  };

  const t = uiText[getUiLanguage()];

  const notes = {
    morning: t.morningNote,
    afternoon: t.afternoonNote,
    evening: t.eveningNote
  };

  const timeLabels = {
    en: {
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening"
    },
    es: {
      morning: "Mañana",
      afternoon: "Tarde",
      evening: "Noche"
    },
    pt: {
      morning: "Manhã",
      afternoon: "Tarde",
      evening: "Noite"
    }
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

    console.log("F250 Registrant Language:", raw);

    if (
      raw.includes("span") ||
      raw.includes("espa")
    ) {
      return "es";
    }

    if (
      raw.includes("portug") ||
      raw.includes("portugu") ||
      raw.includes("português")
    ) {
      return "pt";
    }

    return "en";
  }

  function applyRegistrantLanguageVisibility() {
    const preferred = getRegistrantLanguage();

    app.querySelectorAll(".f250-lang-spanish").forEach(function (el) {
      el.style.display = preferred === "es" ? "" : "none";
    });

    app.querySelectorAll(".f250-lang-portuguese").forEach(function (el) {
      el.style.display = preferred === "pt" ? "" : "none";
    });

    return preferred;
  }

  function isAllowedLanguage(language) {
    const preferred = getRegistrantLanguage();

    if (language === "en" || language === "audio-en") return true;
    if ((language === "es" || language === "audio-es") && preferred === "es") return true;
    if ((language === "pt" || language === "audio-pt") && preferred === "pt") return true;

    return false;
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
    // quinta-feira, 18 de junho de 2026
    raw = raw.replace(/^[^,]+,\s*/, "");

    // English
    const parsed = new Date(raw + " 12:00:00");
    if (!isNaN(parsed.getTime())) {
      return getMDTDateString(parsed);
    }

    const months = {
      // Spanish
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
      diciembre: "12",

      // Portuguese
      janeiro: "01",
      fevereiro: "02",
      marco: "03",
      março: "03",
      abril: "04",
      maio: "05",
      junho: "06",
      julho: "07",
      agosto: "08",
      setembro: "09",
      outubro: "10",
      novembro: "11",
      dezembro: "12"
    };

    const normalized = raw
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    const match = normalized.match(/^(\d{1,2}) de ([a-z]+) de (\d{4})$/);

    if (match && months[match[2]]) {
      return match[3] + "-" + months[match[2]] + "-" + match[1].padStart(2, "0");
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

  function getEventHour() {
    if (typeof window.f250TestHour === "number") return window.f250TestHour;

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

  function getEventMinutes() {
    if (typeof window.f250TestMinutes === "number") return window.f250TestMinutes;

    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Denver",
        hour: "numeric",
        minute: "numeric",
        hour12: false
      }).formatToParts(new Date());

      const hourPart = parts.find(function (part) {
        return part.type === "hour";
      });

      const minutePart = parts.find(function (part) {
        return part.type === "minute";
      });

      const hour = hourPart ? parseInt(hourPart.value, 10) : 9;
      const minute = minutePart ? parseInt(minutePart.value, 10) : 0;

      return hour * 60 + minute;
    } catch (e) {
      return 9 * 60;
    }
  }

  function getLiveBlock() {
    if (getSessionDateStatus() !== "today") return "";

    const minutes = getEventMinutes();

    const morningStart = (8 * 60) - 5;      // 7:55 AM
    const afternoonStart = (13 * 60) + 25;  // 1:25 PM
    const eveningStart = (19 * 60) - 5;     // 6:55 PM
    const eveningEnd = (21 * 60) + 30;      // 9:30 PM

    if (minutes >= morningStart && minutes < afternoonStart) return "morning";
    if (minutes >= afternoonStart && minutes < eveningStart) return "afternoon";
    if (minutes >= eveningStart && minutes < eveningEnd) return "evening";

    return "";
  }

  function getDefaultTimeBlock() {
    const status = getSessionDateStatus();
    const liveBlock = getLiveBlock();

    if (status === "past") {
      const savedTime = localStorage.getItem("f250-su-time-block");

      if (
        savedTime === "morning" ||
        savedTime === "afternoon" ||
        savedTime === "evening"
      ) {
        return savedTime;
      }

      return "morning";
    }

    if (liveBlock) return liveBlock;

    if (status === "future") return "morning";

    const minutes = getEventMinutes();

    if (minutes < ((13 * 60) + 25)) return "morning";
    if (minutes < ((19 * 60) - 5)) return "afternoon";

    return "evening";
  }

  function getDefaultLanguage() {
    const preferred = getRegistrantLanguage();
    const savedMode = localStorage.getItem("f250-su-player-mode");
    const savedVideo = localStorage.getItem("f250-su-video-language");

    if (savedMode === "audio") {
      const audioLang = "audio-" + preferred;

      if (isAllowedLanguage(audioLang) && audioMap[audioLang]) {
        return audioLang;
      }
    }

    if (savedVideo && isAllowedLanguage(savedVideo) && videoMap[savedVideo]) {
      return savedVideo;
    }

    if (preferred === "es") return "es";
    if (preferred === "pt") return "pt";

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
      shell.classList.remove("audio-mode");
      shell.classList.remove("replay-mode");

      // Replay BoxCast embed with markers
      if (
        url &&
        url.includes("layout=playlist-to-right")
      ) {
        shell.classList.add("replay-mode");
      }
    }

    playerWrap.innerHTML =
      '<iframe id="f250-live-iframe" ' +
      'src="' + normalizeVideoUrl(url) + '" ' +
      'title="Freedom250 Live Stream" ' +
      'allow="autoplay; fullscreen; picture-in-picture" ' +
      'allowfullscreen ' +
      'frameborder="0"></iframe>';
  }

  function showAudio(html) {

    const shell = document.querySelector(".f250-player-shell");

    if (shell) {
      shell.classList.add("audio-mode");
    }

    playerWrap.innerHTML =
      '<div class="f250-audio-player">' + html + "</div>";
  }

  function getLanguageLabel(language) {
    const labels = {
      en: "English",
      es: "Español",
      pt: "Português",
      "audio-en": "Listen Live",
      "audio-es": "Español Audio",
      "audio-pt": "Português Audio"
    };

    return labels[language] || "English";
  }

  function syncActiveButtons() {
    const liveBlock = getLiveBlock();
    const status = getSessionDateStatus();
    const isAudioMode = !!audioMap[currentLanguage];

    timeButtons.forEach(function (button) {
      const block = button.getAttribute("data-time");

      button.classList.toggle("active", !isAudioMode && block === currentTime);
      button.classList.toggle("live", block === liveBlock);

      let completed = false;

      if (status === "past") {
        completed = true;
      } else if (status === "today") {
        if (!liveBlock && getEventMinutes() >= (21 * 60) + 30) {
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
      selectionLabel.textContent = timeLabels[uiLang][currentTime] + " • " + getLanguageLabel(currentLanguage);
    }

    if (sessionNote) {
      sessionNote.textContent = notes[currentTime] || "";
    }

    if (audioMap[currentLanguage]) {

      localStorage.setItem("f250-su-player-mode", "audio");

      showAudio(audioMap[currentLanguage]);
      return;

    } else {

      localStorage.setItem("f250-su-player-mode", "video");
      localStorage.setItem("f250-su-video-language", currentLanguage);

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

    showIframe(url);
  }

  function showTransitionMessage(nextBlock) {
    const message = document.getElementById("f250-transition-message");

    if (!message) return;

    const label = timeLabels[getUiLanguage()][nextBlock];

    message.textContent = label + " " + t.updating;

    message.classList.add("show");

    setTimeout(function () {
      message.classList.remove("show");
    }, 4000);
  }

  applyRegistrantLanguageVisibility();

  const preferredLanguage = getRegistrantLanguage();

  if (preferredLanguage === "en") {
    document.body.classList.add("f250-english-only");
  }

  let currentTime = getDefaultTimeBlock();
  let currentLanguage = getDefaultLanguage();

  streamButtons.forEach(function (button) {

    button.addEventListener("click", function () {
      const lang = this.getAttribute("data-language") || "en";

      if (!isAllowedLanguage(lang)) return;

      currentLanguage = lang;

      if (audioMap[currentLanguage]) {
        localStorage.setItem("f250-su-player-mode", "audio");
      } else {
        localStorage.setItem("f250-su-player-mode", "video");
        localStorage.setItem("f250-su-video-language", currentLanguage);
      }

      syncActiveButtons();
      updatePlayer();
    });
  });

  timeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentTime = this.getAttribute("data-time") || "morning";

      if (audioMap[currentLanguage]) {
        const preferred = getRegistrantLanguage();

        if (preferred === "es") {
          currentLanguage = "es";
        } else if (preferred === "pt") {
          currentLanguage = "pt";
        } else {
          currentLanguage = "en";
        }
      }

      if (getSessionDateStatus() === "past") {
        localStorage.setItem("f250-su-time-block", currentTime);
      }

      syncActiveButtons();
      updatePlayer();
    });
  });

  function syncAudioVisibility() {
    const audioAccess = document.querySelector(".f250-audio-access");
    if (!audioAccess) return;

    const status = getSessionDateStatus();

    audioAccess.style.display = status === "past" ? "none" : "";
  }

  updateClock();
  updatePageState();
  syncAudioVisibility();

  let lastAutoBlock = getDefaultTimeBlock();

  setInterval(function () {
    updateClock();
    updatePageState();
    syncAudioVisibility();

    const currentAutoBlock = getDefaultTimeBlock();
    const isVideoLanguage = !!videoMap[currentLanguage];

    if (isVideoLanguage && currentAutoBlock !== lastAutoBlock) {
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