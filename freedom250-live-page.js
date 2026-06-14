(function () {
  const app = document.getElementById("f250-live-app");
  if (!app) return;

  const playerWrap = app.querySelector(".f250-player-ratio");
  if (!playerWrap) return;

  /*
    Update the BoxCast URLs here.
    Page links:
    /essentials-live?day=1
    /essentials-live?day=2
    /essentials-live?day=3
  */

  const dataEl = document.getElementById("f250-session-stream-data");
  let streamMap = {
    morning: "",
    afternoon: "",
    evening: ""
  };

  if (dataEl) {
    try {
      streamMap = JSON.parse(dataEl.textContent);
    } catch (e) {
      console.error("F250 stream data could not be parsed.", e);
    }
  }

  const notes = {
    morning: "Welcome to the morning session.",
    afternoon: "Welcome to the afternoon session.",
    evening: "Welcome to the evening session."
  };

  const selectionLabel = document.getElementById("current-selection-label");
  const sessionNote = document.getElementById("session-note");
  const activeDayLabel = document.getElementById("f250-active-day-label");
  const titleEl = document.getElementById("f250-live-title");
  const timeButtons = app.querySelectorAll(".time-btn");

  function cleanUrl(url) {
    return String(url || "").replace(/&amp;/g, "&").trim();
  }

  function isValidBoxCastUrl(url) {
    return /^https:\/\/(www\.)?boxcast\.tv\/embed-app\.html/.test(url);
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function getDayFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const day = params.get("day");
    const defaultDay = app.getAttribute("data-default-day") || "1";

    if (day && streamsByDay[day]) return day;
    if (streamsByDay[defaultDay]) return defaultDay;

    return "1";
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

  function getDefaultTimeBlock() {
    const hour = getEventHour();

    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  }

  function showMessage(message) {
    playerWrap.innerHTML =
      '<div class="f250-stream-placeholder">' + message + "</div>";
  }

  function showIframe(url) {
    playerWrap.innerHTML =
      '<iframe id="f250-live-iframe" ' +
      'src="' +
      url +
      '" ' +
      'title="Freedom250 Live Stream" ' +
      'allow="autoplay; fullscreen; picture-in-picture" ' +
      "allowfullscreen " +
      'frameborder="0"></iframe>';
  }

  function syncActiveButton(timeBlock) {
    timeButtons.forEach(function (button) {
      button.classList.toggle(
        "active",
        button.getAttribute("data-time") === timeBlock
      );
    });
  }

  const activeDay = getDayFromUrl();
  const activeDayConfig = streamsByDay[activeDay];

  if (activeDayLabel) {
    activeDayLabel.textContent = activeDayConfig.label || "Day " + activeDay;
  }

  if (titleEl) {
    titleEl.textContent = "Essentials Live - " + (activeDayConfig.label || "Day " + activeDay);
  }

  function updatePlayer(timeBlock) {
    const selectedTime = timeBlock || getDefaultTimeBlock();
    const url = cleanUrl(activeDayConfig[selectedTime]);

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

  syncActiveButton(currentTime);
  updatePlayer(currentTime);
})();