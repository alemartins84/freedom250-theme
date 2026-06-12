(function () {
  const app = document.getElementById("f250-live-app");
  if (!app) return;

  const streamMap = {
    morning: app.getAttribute("data-stream-morning") || "",
    afternoon: app.getAttribute("data-stream-afternoon") || "",
    evening: app.getAttribute("data-stream-evening") || ""
  };

  const notes = {
    morning: "Welcome to the morning session.",
    afternoon: "Welcome to the afternoon session.",
    evening: "Welcome to the evening session."
  };

  const iframe = document.getElementById("f250-live-iframe");
  const playerWrap = app.querySelector(".f250-player-ratio");
  const selectionLabel = document.getElementById("current-selection-label");
  const sessionNote = document.getElementById("session-note");
  const timeButtons = app.querySelectorAll(".time-btn");

  if (!iframe || !playerWrap) return;

  function getEventHour() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Denver",
      hour: "numeric",
      hour12: false
    }).formatToParts(new Date());

    const hourPart = parts.find(part => part.type === "hour");
    return hourPart ? parseInt(hourPart.value, 10) : 9;
  }

  function getDefaultTimeBlock() {
    const hour = getEventHour();

    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  }

  function cleanUrl(url) {
    return String(url || "")
      .replace(/&amp;/g, "&")
      .trim();
  }

  function isValidBoxCastUrl(url) {
    return (
      url.indexOf("https://boxcast.tv/") === 0 ||
      url.indexOf("https://www.boxcast.tv/") === 0
    );
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function setPlaceholder(message) {
    iframe.removeAttribute("src");
    iframe.style.display = "none";

    let placeholder = playerWrap.querySelector(".f250-stream-placeholder");

    if (!placeholder) {
      placeholder = document.createElement("div");
      placeholder.className = "f250-stream-placeholder";
      playerWrap.appendChild(placeholder);
    }

    placeholder.textContent = message || "Stream not available yet.";
    placeholder.style.display = "flex";
  }

  function hidePlaceholder() {
    const placeholder = playerWrap.querySelector(".f250-stream-placeholder");

    if (placeholder) {
      placeholder.style.display = "none";
    }

    iframe.style.display = "block";
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
      setPlaceholder("Stream not available yet.");
      return;
    }

    if (!isValidBoxCastUrl(url)) {
      setPlaceholder("The stream link is not valid.");
      return;
    }

    hidePlaceholder();

    if (iframe.getAttribute("src") !== url) {
      iframe.setAttribute("src", url);
    }
  }

  function syncActiveButton(timeBlock) {
    timeButtons.forEach(button => {
      button.classList.toggle(
        "active",
        button.getAttribute("data-time") === timeBlock
      );
    });
  }

  let currentTime = getDefaultTimeBlock();

  timeButtons.forEach(button => {
    button.addEventListener("click", function () {
      currentTime = this.getAttribute("data-time") || "morning";
      syncActiveButton(currentTime);
      updatePlayer(currentTime);
    });
  });

  syncActiveButton(currentTime);
  updatePlayer(currentTime);
})();