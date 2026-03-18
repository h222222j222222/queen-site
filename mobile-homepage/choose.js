(function() {
  var chooseMindHeadline = document.getElementById("chooseMindHeadline");
  var chooseMindAdvice = document.getElementById("chooseMindAdvice");
  var moodTabsNodes = document.querySelectorAll(".mood-tab");
  var moodTabs = Array.prototype.slice.call(moodTabsNodes);
  var moodNote = document.getElementById("moodNote");
  var cardLinksNodes = document.querySelectorAll("[data-card-link]");
  var cardLinks = Array.prototype.slice.call(cardLinksNodes);

  var modeMeta = {
    anger: {
      note: "우선 시선이 오래 머무는 카드를 선택해 보세요."
    },
    comfort: {
      note: "바라볼 때 마음이 편안해지는 카드를 고르세요."
    },
    laugh: {
      note: "이끌리는 이유 없이 직감이 향하는 카드를 선택하세요."
    }
  };

  var todayMind = window.getTodayMind();



  function updateMode(mode) {
    document.body.setAttribute("data-mode", mode);

    for (var i = 0; i < moodTabs.length; i++) {
        var tab = moodTabs[i];
        if (tab.getAttribute("data-mode") === mode) {
            tab.className = tab.className.replace(/\bis-active\b/g, '') + ' is-active';
        } else {
            tab.className = tab.className.replace(/\bis-active\b/g, '');
        }
    }

    if (moodNote) {
      moodNote.textContent = modeMeta[mode].note;
    }

    for (var j = 0; j < cardLinks.length; j++) {
        var link = cardLinks[j];
        link.href = "./loading.html?mode=" + mode + "&pick=" + (j + 1);
    }
  }

  if (chooseMindHeadline) {
    chooseMindHeadline.textContent = todayMind.headline;
  }

  if (chooseMindAdvice) {
    chooseMindAdvice.textContent = todayMind.tip;
  }

  for (var k = 0; k < moodTabs.length; k++) {
    (function(tab) {
        tab.onclick = function() {
            updateMode(tab.getAttribute("data-mode"));
        };
    })(moodTabs[k]);
  }

  updateMode("anger");
})();
