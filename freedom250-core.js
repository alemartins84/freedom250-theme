(function () {
  var storageKey = "f250Audience";

  var validAudiences = ["seekers", "members", "groups"];

  var audienceAnchors = {
    seekers: "seeker-registration-options",
    members: "member-registration-options",
    groups: "group-registration-options"
  };

  function getAudience() {
    var params = new URLSearchParams(window.location.search);
    var audience = params.get("audience");

    if (validAudiences.indexOf(audience) !== -1) {
      localStorage.setItem(storageKey, audience);
      return audience;
    }

    audience = localStorage.getItem(storageKey);

    if (validAudiences.indexOf(audience) !== -1) {
      return audience;
    }

    localStorage.setItem(storageKey, "seekers");
    return "seekers";
  }

  function setAudienceState() {
    var audience = getAudience();

    document.documentElement.setAttribute("data-f250-audience", audience);

    if (document.body) {
      document.body.classList.remove(
        "f250-audience-seekers",
        "f250-audience-members",
        "f250-audience-groups"
      );

      document.body.classList.add("f250-audience-" + audience);
    }

    return audience;
  }

  function setEditorMode() {
    var isEditor =
      window.location.href.indexOf("/loggedin/website/iframe") !== -1 ||
      window.location.href.indexOf("pageId=") !== -1 ||
      window.self !== window.top;

    if (isEditor) {
      document.documentElement.classList.add("f250-editor-mode");
    }
  }

  function preserveAudienceLinks(audience) {
    var anchor = audienceAnchors[audience] || "seeker-registration-options";
    var returnLinks = document.querySelectorAll('[data-f250-preserve-audience="true"]');

    returnLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href) return;

      try {
        var url = new URL(href, window.location.origin);

        if (url.href.indexOf("/freedom250/freedom250-invitation") !== -1) {
          url.searchParams.set("audience", audience);
          url.hash = anchor;
          link.setAttribute("href", url.toString());
        }
      } catch (e) {}
    });
  }

  function setupF250PackageButtons() {
    document.querySelectorAll(".js-f250-member-package").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var packageName = btn.getAttribute("data-package");
        var mode = btn.getAttribute("data-mode");
        var url = btn.getAttribute("data-url") || btn.getAttribute("href");

        localStorage.setItem("f250Audience", "members");

        if (packageName) {
          localStorage.setItem("f250Package", packageName);
        }

        if (mode) {
          localStorage.setItem("f250Mode", mode);
        }

        if (url) {
          window.location.href = url;
        }
      });
    });
  }

  function setupF250Links() {
    document.querySelectorAll(".js-f250-link").forEach(function (el) {
      el.addEventListener("click", function (e) {
        var url = el.getAttribute("data-url");
        if (!url) return;

        e.preventDefault();

        if (el.getAttribute("target") === "_blank") {
          window.open(url, "_blank", "noopener");
        } else {
          window.location.href = url;
        }
      });
    });
  }

  function setupAudioCards() {
    document.querySelectorAll(".f250-audio-card").forEach(function (card) {
      var btn = card.querySelector(".f250-audio-play");
      var audio = card.querySelector("audio");
      var bar = card.querySelector(".f250-audio-progress-bar");

      if (!btn || !audio || !bar) return;

      btn.addEventListener("click", function () {
        if (audio.paused) {
          audio.play();
          btn.innerHTML = "❚❚";
        } else {
          audio.pause();
          btn.innerHTML = "▶";
        }
      });

      audio.addEventListener("timeupdate", function () {
        if (!audio.duration) return;
        var percent = (audio.currentTime / audio.duration) * 100;
        bar.style.width = percent + "%";
      });
    });
  }

  setEditorMode();

  document.addEventListener("DOMContentLoaded", function () {
    var audience = setAudienceState();
    preserveAudienceLinks(audience);
    setupF250PackageButtons();
    setupF250Links();
    setupAudioCards();
  });
})();