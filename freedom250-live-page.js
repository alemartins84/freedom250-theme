(function () {

    const app = document.getElementById("f250-live-app");

    if (!app) return;

    const streamMap = {
        morning: {
            url: app.dataset.streamMorning || "",
            note: "Welcome to the morning session."
        },
        afternoon: {
            url: app.dataset.streamAfternoon || "",
            note: "Welcome to the afternoon session."
        },
        evening: {
            url: app.dataset.streamEvening || "",
            note: "Welcome to the evening session."
        }
    };

    function getEventHour() {

        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Denver",
            hour: "numeric",
            hour12: false
        }).formatToParts(new Date());

        const hourPart = parts.find(function (part) {
            return part.type === "hour";
        });

        return hourPart
            ? parseInt(hourPart.value, 10)
            : 9;
    }

    function getDefaultTimeBlock() {

        const hour = getEventHour();

        if (hour < 12) return "morning";
        if (hour < 17) return "afternoon";

        return "evening";
    }

    let currentTime = getDefaultTimeBlock();

    const selectionLabel =
        document.getElementById("current-selection-label");

    const sessionNote =
        document.getElementById("session-note");

    const playerWrap =
        app.querySelector(".f250-player-ratio");

    const timeButtons =
        app.querySelectorAll(".time-btn");

    function capitalize(value) {

        return value.charAt(0).toUpperCase() +
               value.slice(1);
    }

    function buildIframe(url) {

        url = String(url || "").trim();

        if (!url || url.indexOf("http") !== 0) {

            playerWrap.innerHTML =
                "<p>Stream not available yet.</p>";

            return;
        }

        playerWrap.innerHTML = `
            <iframe
                src="${url}"
                title="Freedom250 Live Player"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowfullscreen>
            </iframe>
        `;
    }

    function updatePlayer() {

        const selected = streamMap[currentTime];

        buildIframe(selected.url);

        if (selectionLabel) {
            selectionLabel.textContent =
                capitalize(currentTime);
        }

        if (sessionNote) {
            sessionNote.textContent =
                selected.note;
        }
    }

    function syncActiveButton() {

        timeButtons.forEach(function (button) {

            button.classList.toggle(
                "active",
                button.getAttribute("data-time") === currentTime
            );

        });
    }

    timeButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            currentTime =
                this.getAttribute("data-time") ||
                "morning";

            syncActiveButton();

            updatePlayer();

        });

    });

    syncActiveButton();

    updatePlayer();

})();