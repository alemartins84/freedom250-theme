(function () {

  var MEMBER_PREFILL_KEY = "f250MemberPrefill";
  var MEMBER_PREFILL_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

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

  function saveMemberPrefill(email, memberId) {
    var payload = {
      email: email || "",
      memberId: memberId || "",
      expiresAt: Date.now() + MEMBER_PREFILL_TTL_MS
    };

    localStorage.removeItem("f250Email");
    localStorage.removeItem("f250MemberId");

    localStorage.setItem(MEMBER_PREFILL_KEY, JSON.stringify(payload));
  }

  function getMemberPrefill() {
    try {
      var raw = localStorage.getItem(MEMBER_PREFILL_KEY);

      if (!raw) return null;

      var payload = JSON.parse(raw);

      if (!payload.expiresAt || Date.now() > payload.expiresAt) {
        localStorage.removeItem(MEMBER_PREFILL_KEY);
        localStorage.removeItem("f250Email");
        localStorage.removeItem("f250MemberId");
        return null;
      }

      return payload;

    } catch (e) {
      localStorage.removeItem(MEMBER_PREFILL_KEY);
      localStorage.removeItem("f250Email");
      localStorage.removeItem("f250MemberId");
      return null;
    }
  }

  function captureMemberPrefillParams() {
    var params = new URLSearchParams(window.location.search);

    var email = params.get("email");
    var memberId = params.get("c_3975805");

    if (email || memberId) {
      saveMemberPrefill(email, memberId);
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

  function setAudienceState() {

    var audience = getAudience();

    document.documentElement.setAttribute(
      "data-f250-audience",
      audience
    );

    if (document.body) {

      document.body.classList.remove(
        "f250-audience-seekers",
        "f250-audience-members",
        "f250-audience-groups"
      );

      document.body.classList.add(
        "f250-audience-" + audience
      );
    }

    return audience;
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

  function preserveAudienceLinks(audience, lang) {
    var anchor = audienceAnchors[audience] || "seeker-registration-options";

    var returnLinks = document.querySelectorAll(
      '[data-f250-preserve-audience="true"]'
    );

    returnLinks.forEach(function (link) {
      var href = link.getAttribute("href");

      if (!href) return;

      try {
        var url = new URL(href, window.location.origin);

        if (url.href.indexOf("/freedom250/freedom250-invitation") !== -1) {
          url.searchParams.set("audience", audience);

          if (lang) {
            url.searchParams.set("lang", lang);
          }

          url.hash = anchor;

          link.setAttribute("href", url.toString());
        }

      } catch (e) { }
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

        var prefill = getMemberPrefill();

        if (url) {

          var finalUrl = new URL(url, window.location.origin);

          if (prefill && prefill.email) {
            finalUrl.searchParams.set("email", prefill.email);
          }

          if (prefill && prefill.memberId) {
            finalUrl.searchParams.set("c_3975805", prefill.memberId);
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

  function setupVioletFlamePlayer() {

    var btn = document.getElementById("violetFlamePlayBtn");
    var audio = document.getElementById("violetFlameAudio");

    if (!btn || !audio) return;

    btn.addEventListener("click", function () {

      if (audio.paused) {

        audio.play();

        btn.innerHTML =
          '<span class="f250-audio-icon">❚❚</span> Pause mantra';

      } else {

        audio.pause();

        btn.innerHTML =
          '<span class="f250-audio-icon">▶</span> Listen to the mantra';

      }

    });

    audio.addEventListener("ended", function () {

      btn.innerHTML =
        '<span class="f250-audio-icon">▶</span> Listen to the mantra';

    });

  }

  function setupVideoModal() {

    var modal = document.getElementById("f250VideoModal");
    var frame = document.getElementById("f250VideoFrame");

    if (!modal || !frame) return;
    var videoButtons = document.querySelectorAll(".f250-video-watch");
    var closeBtn = document.querySelector(".f250-video-close");
    var backdrop = document.querySelector(".f250-video-modal-backdrop");
    function openVideo(url) {

      if (!url) return;

      frame.src = url + "?autoplay=1";
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeVideo() {
      frame.src = "";
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";

    }
    videoButtons.forEach(function (button) {

      button.addEventListener("click", function () {

        var url = button.getAttribute("data-video");
        openVideo(url);

      });
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        closeVideo();
      });

    }
    if (backdrop) {
      backdrop.addEventListener("click", function () {
        closeVideo();
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeVideo();
      }
    });
  }

    function setupRevealAnimations() {

    var revealElements = document.querySelectorAll(".f250-reveal");

    if (!revealElements.length) return;

    var observer = new IntersectionObserver(function (entries) {

      entries.forEach(function (entry) {

        if (entry.isIntersecting) {

          entry.target.classList.add("is-visible");

          observer.unobserve(entry.target);

        }

      });

    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    });

    revealElements.forEach(function (el) {
      observer.observe(el);
    });

  }

  setEditorMode();

  document.addEventListener("DOMContentLoaded", function () {

    setEditorMode();

    if (isSwoogoEditor()) {
      return;
    }

    captureMemberPrefillParams();

    getMemberPrefill();

    var audience = setAudienceState();
    var lang = setLanguageState();

    preserveAudienceLinks(audience, lang);

    setupAudioCards();
    setupVioletFlamePlayer();

    setupVideoModal();

    setupF250PackageButtons();

    setupRevealAnimations();

  });

})();