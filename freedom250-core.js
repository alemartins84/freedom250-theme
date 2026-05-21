(function () {


    function isSwoogoEditor() {
      var href = window.location.href;
      var referrer = document.referrer || "";

      return (
        href.indexOf("/loggedin/") !== -1 ||
        href.indexOf("/website/iframe") !== -1 ||
        href.indexOf("pageId=") !== -1 ||
        href.indexOf("edit") !== -1 ||
        referrer.indexOf("/loggedin/") !== -1 ||
        referrer.indexOf("/website/") !== -1 ||
        window.self !== window.top
      );
    }

    function setEditorMode() {
      if (isSwoogoEditor()) {
        document.documentElement.classList.add("f250-editor-mode");

        if (document.body) {
          document.body.classList.add("f250-editor-mode");
        }
      }
    }

  function captureMemberPrefillParams() {
    var params = new URLSearchParams(window.location.search);

    var email = params.get("email");
    var memberId = params.get("c_3975805");

    if (email) {
      localStorage.setItem("f250Email", email);
    }

    if (memberId) {
      localStorage.setItem("f250MemberId", memberId);
    }
  }

  var storageKey = "f250Audience";

  var languageStorageKey = "f250Language";

  var validLanguages = ["en", "es", "pt"];

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

  function getLanguage() {
    var params = new URLSearchParams(window.location.search);
    var lang = params.get("lang");

  if (validLanguages.indexOf(lang) !== -1) {
    localStorage.setItem(languageStorageKey, lang);
    return lang;
  }

  lang = localStorage.getItem(languageStorageKey);

  if (validLanguages.indexOf(lang) !== -1) {
    return lang;
  }

  localStorage.setItem(languageStorageKey, "en");
    return "en";
  }

  function setLanguageState() {
  var lang = getLanguage();

  document.documentElement.setAttribute("data-f250-language", lang);

  if (document.body) {
    document.body.classList.remove(
      "f250-lang-en",
      "f250-lang-es",
      "f250-lang-pt"
    );

    document.body.classList.add("f250-lang-" + lang);
  }

    return lang;
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
      btn.addEventListener("click", function (e) {
        var packageName = btn.getAttribute("data-package");
        var mode = btn.getAttribute("data-mode");
        var url = btn.getAttribute("data-url") || btn.getAttribute("href");

        e.preventDefault();

        localStorage.setItem("f250Audience", "members");

        if (packageName) {
          localStorage.setItem("f250Package", packageName);
        }

        if (mode) {
          localStorage.setItem("f250Mode", mode);
        }

        var email = localStorage.getItem("f250Email");
        var memberId = localStorage.getItem("f250MemberId");

        if (url) {
          var finalUrl = new URL(url, window.location.origin);

          if (email) {
            finalUrl.searchParams.set("email", email);
          }

          if (memberId) {
            finalUrl.searchParams.set("c_3975805", memberId);
          }

          window.location.href = finalUrl.toString();
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
    setEditorMode();

    if (isSwoogoEditor()) {
      return;
    }

    captureMemberPrefillParams();    

    var audience = setAudienceState();
    setLanguageState();
    
    preserveAudienceLinks(audience);

    setupAudioCards();
    setupF250PackageButtons();
  });
})();