const streamMap = {
    morning: "{session-c_112136}",
    afternoon: "{session-c_112137}",
    evening: "{session-c_112138}"
};

const iframe = document.getElementById("f250-live-iframe");

function updatePlayer() {
    const url = (streamMap[currentTime] || "").trim();

    if (!url || url.indexOf("https://") !== 0) {
        iframe.style.display = "none";

        document.querySelector(".f250-player-ratio").insertAdjacentHTML(
            "beforeend",
            '<div class="f250-stream-placeholder">Stream not available yet.</div>'
        );

        return;
    }

    iframe.style.display = "block";
    iframe.src = url;
}