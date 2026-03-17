const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");
const pick = params.get("pick") || "1";

const loaderText = document.getElementById("loaderText");

if (mode) {
  document.body.classList.add(`theme-${mode}`);
}

if (mode === "anger") {
  loaderText.textContent = "퀸이 만난 빌런의 특성을 파악중입니다...";
} else if (mode === "comfort") {
  loaderText.textContent = "지친 퀸의 멘탈을 완벽하게 케어하기 위해 분석 중입니다...";
} else if (mode === "laugh") {
  loaderText.textContent = "현재 퀸이 마주한 상황의 본질을 예리하게 파악 중입니다...";
} else {
  loaderText.textContent = "잠시만 기다려주세요. 퀸의 결론을 치밀하게 분석하고 있습니다...";
}

// 2.5초 후 결과 페이지로 이동
window.setTimeout(() => {
  window.location.replace(`./result.html?mode=${mode}&pick=${pick}`);
}, 2500);
