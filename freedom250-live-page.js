(function () {
  const app = document.getElementById("f250-live-app");
  if (!app) return;

  const playerWrap = app.querySelector(".f250-player-ratio");
  if (!playerWrap) return;

  const streamMap = {
    morning: document.getElementById("f250-stream-morning")?.textContent.trim() || "",
    afternoon: document.getElementById("f250-stream-afternoon")?.textContent.trim() || "",
    evening: document.getElementById("f250-stream-evening")?.textContent.trim() || ""
  };

  console.log("F250 Streams:", streamMap);

  const notes = {
    morning: "Morning Session: Broadcasts begin with teachings, invocations, and the opening activities of the day.",
    afternoon: "Afternoon Session: Continue the journey with presentations, workshops, and practical applications.",
    evening: "Evening Session: Join the evening activities, special services, music, and spiritual practices."
  };

  const selectionLabel = document.getElementById("current-selection-label");
  const sessionNote = document.getElementById("session-note");
  const timeButtons = app.querySelectorAll(".time-btn");
  const mdtClock = document.getElementById("f250-current-mdt");

  function cleanUrl(url) {
    return String(url || "").replace(/&amp;/g, "&").trim();
  }

  function isValidBoxCastUrl(url) {
    return /^https:\/\/(www\.)?boxcast\.tv\/embed-app\.html/.test(url);
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

    const rawDate = dateEl.textContent.trim();
    const parsed = new Date(rawDate);

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
    if (getSessionDateStatus() !== "today") {
      return "";
    }

    const hour = getEventHour();

    if (hour >= 10 && hour < 14) return "morning";
    if (hour >= 14 && hour < 19) return "afternoon";
    if (hour >= 19 && hour < 22) return "evening";

    return "";
  }

  function getDefaultTimeBlock() {
    const status = getSessionDateStatus();
    const liveBlock = getLiveBlock();
    const hour = getEventHour();

    if (liveBlock) return liveBlock;

    if (status === "past") return "evening";
    if (status === "future") return "morning";

    if (hour < 10) return "morning";
    return "evening";
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

  function showMessage(message) {
    playerWrap.innerHTML =
      '<div class="f250-stream-placeholder">' + message + "</div>";
  }

  function showIframe(url) {
    playerWrap.innerHTML =
      '<iframe id="f250-live-iframe" ' +
      'src="' + url + '" ' +
      'title="Freedom250 Live Stream" ' +
      'allow="autoplay; fullscreen; picture-in-picture" ' +
      'allowfullscreen ' +
      'frameborder="0"></iframe>';
  }

  function syncActiveButton(timeBlock) {
    const liveBlock = getLiveBlock();
    const status = getSessionDateStatus();

    timeButtons.forEach(function (button) {
      const block = button.getAttribute("data-time");

      button.classList.toggle("active", block === timeBlock);
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
  }

  function updatePlayer(timeBlock) {
    const selectedTime = timeBlock || getDefaultTimeBlock();
    const url = cleanUrl(streamMap[selectedTime]);

    if (selectionLabel) {
      selectionLabel.textContent = capitalize(selectedTime);
    }

    if (sessionNote) {
      sessionNote.textContent = notes[selectedTime] || "";
    }

    if (!url) {
      showMessage("Stream not available yet.");
      return;
    }

    if (!isValidBoxCastUrl(url)) {
      showMessage("The stream link is not valid.");
      return;
    }

    showIframe(url);
  }

  let currentTime = getDefaultTimeBlock();

  timeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentTime = this.getAttribute("data-time") || "morning";
      syncActiveButton(currentTime);
      updatePlayer(currentTime);
    });
  });

  updateClock();
  setInterval(updateClock, 60000);

  syncActiveButton(currentTime);
  updatePlayer(currentTime);
})();