const loadingTexts = [
  "ESG 데이터를 불러오는 중...",
  "미션 보상을 계산하고 있어요... 🌱",
  "환경·존중·소통 활동을 로딩 중...",
  "캠퍼스를 깨끗하게 정리 중... ✨"
];

let idx = 0;
const loadingText = document.getElementById("loadingText");
const loadingScreen = document.getElementById("loadingScreen");

setInterval(() => {
  idx = (idx + 1) % loadingTexts.length;
  loadingText.innerText = loadingTexts[idx];
}, 1200);

// 모든 초기화 끝나면 자동으로 숨기기
window.addEventListener("load", () => {
  setTimeout(() => {
    loadingScreen.style.opacity = "0";
    setTimeout(() => loadingScreen.style.display = "none", 500);
  }, 2000);
});



// ======================================
// 0. 뱃지 설명 데이터
// ======================================
const badgeInfo = {
  green: {
    title: "환경 리더 🌿",
    description: "환경(E) 미션을 가장 많이 수행한 사용자에게 주어지는 뱃지입니다.",
  },
  yellow: {
    title: "존중 마스터 💛",
    description: "존중(S) 미션을 가장 많이 실천한 사용자에게 수여됩니다.",
  },
  blue: {
    title: "소통 챔피언 💬",
    description: "소통(G) 활동을 활발하게 한 사용자에게 수여됩니다.",
  },
  master: {
    title: "ESG 밸런서 ⭐",
    description: "환경·존중·소통을 균형있게 수행한 사용자만 획득할 수 있는 고급 뱃지입니다.",
  },
  medal: {
    title: "레벨업 메달 🏅",
    description: "레벨이 1 증가할 때마다 획득하는 성장 메달입니다.",
  }
};

// ======================================
// 1. 미션 데이터 및 임팩트
// ======================================
const missions = [
  { text: "텀블러 사용하기", category: "E", score: 3, effect: "일회용 컵 사용량 감소", effectValue: { cup: 1, co2: 9.9 } },
  { text: "정수대에서 물 채우기", category: "E", score: 2, effect: "플라스틱 병 사용 절감", effectValue: { bottle: 1, co2: 18 } },
  { text: "계단 이용하기", category: "E", score: 2, effect: "탄소 배출 감소", effectValue: { co2: 2.3 } },
  { text: "일회용 빨대 줄이기", category: "E", score: 4, effect: "플라스틱 쓰레기 감소", effectValue: { straw: 1 } },

  { text: "칭찬 한 마디 하기", category: "S", score: 2, effect: "긍정적 교우 문화 형성", effectValue: { warmth: 1 } },
  { text: "휴지 아껴쓰기", category: "S", score: 3, effect: "자원 절약", effectValue: { paper: 0.5 } },
  { text: "친구와 인사 나누기", category: "S", score: 1, effect: "소통 활성화", effectValue: { warmth: 1 } },

  { text: "학생 의견 게시판 참여하기", category: "G", score: 3, effect: "학생 자치 강화", effectValue: { governance: 1 } },
  { text: "학교 행사 정보 공유하기", category: "G", score: 2, effect: "정보 전달률 향상", effectValue: { governance: 1 } }
];

let impact = JSON.parse(localStorage.getItem("impact")) || {
  cup: 0,
  bottle: 0,
  straw: 0,
  paper: 0,
  co2: 0,
  warmth: 0,
  governance: 0
};

// ======================================
// 2. 공용 상태 / 기본값
// ======================================
const today = new Date().toISOString().split("T")[0];
const categoryIcon = { E: "🌿", S: "💛", G: "💬" };

let pointsRaw = localStorage.getItem("points");
let points = parseInt(pointsRaw ?? "0", 10);
if (isNaN(points)) points = 0;

let history = JSON.parse(localStorage.getItem("history")) || [];
let todayMissionIndex = Number(localStorage.getItem("todayIndex"));
let todayDate = localStorage.getItem("todayDate");

// ======================================
// 3. 토스트 메시지
// ======================================
function showToast(message, type = "E", emoji = "🌱") {
  const toast = document.getElementById("toast");
  if (!toast) {
    // 토스트 엘리먼트 없으면 그냥 alert로 대체
    alert(message);
    return;
  }

  toast.className = "toast";      // 초기화
  toast.classList.add(type);      // 카테고리별 색 부여
  toast.innerHTML = `<span class="emoji">${emoji}</span> ${message}`;
  toast.classList.add("show");

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

// ======================================
// 4. 레벨 / 경험치
// ======================================
function updateLevel() {
  if (!Number.isFinite(points)) points = 0;

  const level = Math.floor(points / 10) + 1;
  const exp = points % 10;
  const bar = document.getElementById("expBar");
  const levelSpan = document.getElementById("level");
  const leftText = document.getElementById("expLeftText");

  if (bar) bar.style.width = (exp * 10) + "%";
  if (levelSpan) levelSpan.innerText = level;

  if (leftText) {
    const left = 10 - exp;
    leftText.innerText = left === 0
      ? "레벨업 준비 완료! ✨"
      : `다음 레벨까지 ${left}점 남음`;
  }
}

// ======================================
// 5. 마스코트
// ======================================
const messages = [
  "환경은 작은 실천부터! 🌱",
  "멋지다! 계속 가보자! ✨",
  "너 정말 ESG 챔피언이야! 💪"
];

function mascotReaction(type) {
  const m = document.getElementById("mascot");
  const msg = document.getElementById("mascotMsg");
  if (!m || !msg) return;

  let duration = 3000;
  msg.innerText = messages[Math.floor(Math.random() * messages.length)];

  if (type === "levelup") {
    m.innerText = "🌱🎉(≧▽≦)🎉🌱";
    duration = 3800;
  } else {
    m.innerText = "🌱(>‿<)✨";
  }

  m.classList.add("animate");
  clearTimeout(m._timer);

  m._timer = setTimeout(() => {
    m.classList.remove("animate");
    m.innerText = "🌱◕‿◕🌱";
    msg.innerText = "오늘도 ESG 실천해볼까? 🌱";
  }, duration);
}

// ======================================
// 6. 레벨업 폭죽
// ======================================
function fireLevelUpEffect() {
  const effect = document.getElementById("levelUpEffect");
  if (!effect) return;

  effect.innerHTML = "";
  for (let i = 0; i < 40; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.setProperty("--i", Math.random());
    c.style.setProperty("--x", Math.random());
    effect.appendChild(c);
  }
  setTimeout(() => effect.innerHTML = "", 1200);
}

// ======================================
// 7. 오늘의 미션
// ======================================
function setRandomMission() {
  if (todayDate !== today || todayMissionIndex == null || isNaN(todayMissionIndex)) {
    todayMissionIndex = Math.floor(Math.random() * missions.length);
    todayDate = today;
    localStorage.setItem("todayIndex", todayMissionIndex);
    localStorage.setItem("todayDate", todayDate);
  }
  const el = document.getElementById("randomMission");
  if (el) el.innerText = missions[todayMissionIndex].text;
}

// ======================================
// 8. 미션 완료
// ======================================
function completeMission(missionOrIndex) {
  // 방어코드: 숫자가 들어오면 인덱스로 취급
  let mission = missionOrIndex;
  if (typeof mission === "number") {
    mission = missions[mission];
  }
  if (!mission) return;

  const prevLevel = Math.floor(points / 10) + 1;

  // 점수 증가
  points += mission.score;
  if (!Number.isFinite(points)) points = 0;

  // 토스트 (카테고리별 색상/이모지)
  const emoji =
    mission.category === "E" ? "🌿" :
    mission.category === "S" ? "💛" : "💬";

  showToast(`+${mission.score}점! ${mission.text} 완료`, mission.category, emoji);

  const newLevel = Math.floor(points / 10) + 1;
  if (newLevel > prevLevel) {
    mascotReaction("levelup");
    fireLevelUpEffect();
    showToast(`레벨업! LV.${prevLevel} → LV.${newLevel} 🎉`, "levelup", "⭐");
  } else {
    mascotReaction("success");
  }

  // 히스토리 기록
  history.push({
    text: mission.text,
    category: mission.category,
    date: today
  });

  // ESG 임팩트 누적
  if (mission.effectValue) {
    for (const key in mission.effectValue) {
      impact[key] = (impact[key] || 0) + mission.effectValue[key];
    }
    localStorage.setItem("impact", JSON.stringify(impact));
  }

  // 저장
  localStorage.setItem("points", points);
  localStorage.setItem("history", JSON.stringify(history));

  updatePages();
  updateTodayProgress();
}

// ======================================
// 9. 오늘의 미션 완료 (3개 다른 미션 목표)
// ======================================
function completeTodayMission() {
  const doneToday = history.filter(h => h.date === today);
  const uniqueCount = new Set(doneToday.map(h => h.text)).size;

  if (uniqueCount >= 3) {
    showToast("오늘 목표 이미 달성 완료! 🎉", "master", "⭐");
    return;
  }

  const mission = missions[todayMissionIndex];
  if (!mission) return;

  completeMission(mission);
  setRandomMission();

  const afterCount = new Set(
    history.filter(h => h.date === today).map(h => h.text)
  ).size;

  if (afterCount >= 3) {
    showToast("🌟 ESG 목표 달성! 완벽합니다! 🌱✨", "master", "⭐");
  }
}

// ======================================
// 10. 미션 리스트 로딩
// ======================================
function loadMissions(filter = "ALL") {
  const list = document.getElementById("missionList");
  if (!list) return;
  list.innerHTML = "";

  missions
    .filter(m => filter === "ALL" || m.category === filter)
    .forEach((m) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="icon">${categoryIcon[m.category]}</div>
        <div style="display:flex; flex-direction:column;">
          <span style="font-weight:700;">${m.text}</span>
          <span style="font-size:12px; color:#666;">+${m.score}점 • ${m.effect}</span>
        </div>
      `;
      li.addEventListener("click", () => completeMission(m));
      list.appendChild(li);
    });
}

// ======================================
// 11. UI 업데이트
// ======================================
function updateTodayProgress() {
  const doneToday = history.filter(h => h.date === today);
  const uniqueCount = new Set(doneToday.map(h => h.text)).size;

  const el = document.getElementById("todayProgress");
  if (!el) return;

  el.innerText = `오늘 진행도: ${uniqueCount}/3${uniqueCount >= 3 ? " ⭐" : ""}`;
}

function updateHistoryPage() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  history.slice().reverse().forEach(h => {
    const li = document.createElement("li");

    const icon = categoryIcon[h.category] || "❓";

    li.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:22px;">${icon}</span>
        <div style="display:flex; flex-direction:column;">
          <span style="font-weight:600;">${h.text}</span>
          <span style="font-size:12px; color:#666;">${h.date}</span>
        </div>
      </div>
    `;

    list.appendChild(li);
  });
}


function updateRewardPage() {
  const level = Math.floor(points / 10) + 1;

  const levelEl = document.getElementById("rewardLevel");
  const countEl = document.getElementById("rewardCount");
  if (levelEl) levelEl.innerText = level;
  if (countEl) countEl.innerText = history.length;

  // 임팩트 표 업데이트 (있을 때만)
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerText = value;
  };

  setText("impCup", impact.cup);
  setText("impBottle", impact.bottle);
  setText("impStraw", impact.straw);
  setText("impPaper", impact.paper.toFixed ? impact.paper.toFixed(1) : impact.paper);
  setText("impCO2", impact.co2.toFixed ? impact.co2.toFixed(1) : impact.co2);
  setText("impWarmth", impact.warmth);
  setText("impGov", impact.governance);

  const badgeArea = document.getElementById("badges");
  if (!badgeArea) return;
  badgeArea.innerHTML = "";

  const count = cat => history.filter(h => h.category === cat).length;
  const e = count("E"), s = count("S"), g = count("G");

  // 대표 뱃지
  if (e + s + g > 0) {
    if (e > s && e > g) addBadge("🌿", "green");
    else if (s > e && s > g) addBadge("💛", "yellow");
    else if (g > e && g > s) addBadge("💬", "blue");
    else addBadge("⭐", "master");
  }

  // 레벨 메달 한 개 (현재 레벨 표시)
  addBadge(`🏅 LV${level}`, "medal");

  function addBadge(icon, type) {
    const div = document.createElement("div");
    div.className = `badge ${type}`;
    div.innerText = icon;
    div.addEventListener("click", () => showBadgePopup(type));
    badgeArea.appendChild(div);
  }
}

// ======================================
// 12. 차트 (전체 누적)
// ======================================
let esgChart = null;

function updateESGChart() {
  const canvas = document.getElementById("esgChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const countByCategory = cat =>
    history.filter(h => h.category === cat).length;

  if (esgChart) esgChart.destroy();

  esgChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["환경🌿", "존중💛", "소통💬"],
      datasets: [{
        data: [
          countByCategory("E"),
          countByCategory("S"),
          countByCategory("G")
        ],
        backgroundColor: ["#4caf50", "#ffca28", "#64b5f6"]
      }]
    },
    options: {
      plugins: { legend: { position: "bottom" } },
      animation: { duration: 600 },
      cutout: "60%"
    }
  });
}

// ======================================
// 13. 공통 업데이트
// ======================================
function updatePages() {
  updateLevel();
  updateHistoryPage();
  updateRewardPage();
  updateTodayProgress();
  updateESGChart();

  // 임시로 주간 리포트 비활성화!
  // updateWeeklyReport();
}



// ======================================
// 14. 탭 / 필터 초기화
// ======================================
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const tgt = document.getElementById(id);
  if (tgt) tgt.classList.add("active");

  updatePages();

  // ⭐ 리포트 페이지가 "보인 뒤"에 차트를 다시 그리기
  if (id === "reportPage") {
    setTimeout(() => {
      updateWeeklyReport();
    }, 50); // DOM 리렌더 후 실행
  }
}


function initFilterButtons() {
  [["all","ALL"],["e","E"],["s","S"],["g","G"]]
    .forEach(([id,cat]) => {
      const btn = document.getElementById(`btn-${id}`);
      if (!btn) return;
      btn.addEventListener("click", () => {
        loadMissions(cat);
        setActiveFilter(`btn-${id}`);
      });
    });

  const randomBtn = document.getElementById("btn-random");
  if (randomBtn) randomBtn.addEventListener("click", completeTodayMission);
}

function initNavButtons() {
  const mapping = [
    ["home","homePage"],
    ["reward","rewardPage"],
    ["my","myPage"],
    ["report","reportPage"],
    ["guide","guidePage"],
    ["mbti", "mbtiPage"]
  ];

  mapping.forEach(([btn, page]) => {
    const el = document.getElementById(`tab-${btn}`);
    if (!el) return;

    el.addEventListener("click", () => {
      showPage(page);

      // 리포트 페이지일 때만 업데이트 실행
      if (page === "reportPage") {
        updateWeeklyReport();
      }
    });
  });
}


function setActiveFilter(id) {
  document.querySelectorAll(".tab button").forEach(btn => btn.classList.remove("active"));
  const btn = document.getElementById(id);
  if (btn) btn.classList.add("active");
}

// ======================================
// 15. 초기 실행
// ======================================
function init() {
  initNavButtons();
  initFilterButtons();
  showPage("homePage");
  setRandomMission();
  loadMissions("ALL");
  updatePages();
  setActiveFilter("btn-all");
}

init();

// ======================================
// 16. 안내 팝업
// ======================================
window.addEventListener("load", () => {
  const popup = document.getElementById("noticePopup");
  const closeBtn = document.getElementById("popupClose");
  if (!popup || !closeBtn) return;

  if (!localStorage.getItem("popupSeen")) {
    popup.style.display = "flex";
  }

  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
    localStorage.setItem("popupSeen", "true");
  });
});

// ======================================
// 17. 뱃지 팝업
// ======================================
function showBadgePopup(type) {
  const info = badgeInfo[type];
  const popup = document.getElementById("badgePopup");
  const title = document.getElementById("badgeTitle");
  const desc = document.getElementById("badgeDesc");

  if (!info || !popup || !title || !desc) return;

  title.innerText = info.title;
  desc.innerText = info.description;
  popup.style.display = "flex";
}

const badgeCloseBtn = document.getElementById("badgeClose");
if (badgeCloseBtn) {
  badgeCloseBtn.addEventListener("click", () => {
    const popup = document.getElementById("badgePopup");
    if (popup) popup.style.display = "none";
  });
}

function getWeeklyData() {
  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 7);

  const todayStr = now.toISOString().split("T")[0];
  const weekAgoStr = weekAgo.toISOString().split("T")[0];

  // ✅ 날짜 + 카테고리(E/S/G) 둘 다 필터링
  const weekly = history.filter(h =>
    h.date >= weekAgoStr &&
    h.date <= todayStr &&
    (h.category === "E" || h.category === "S" || h.category === "G")
  );

  const countByCategory = cat =>
    weekly.filter(h => h.category === cat).length;

  const E = countByCategory("E");
  const S = countByCategory("S");
  const G = countByCategory("G");

  // ✅ total을 그냥 E+S+G 합으로
  const total = E + S + G;

  return { total, E, S, G };
}




// 주간 코멘트 자동 생성
function makeWeeklyComment(data) {
  if (data.total === 0) return "이번 주 활동이 없어요! 내일부터 함께 시작해볼까요? 🌱";

  const maxCat = Object.entries({E:data.E, S:data.S, G:data.G})
    .sort((a,b)=>b[1]-a[1])[0][0];

  const text = {
    E: "환경 실천이 가장 뛰어났어요! 지속가능한 캠퍼스에 기여 중! 🌿",
    S: "사려 깊은 행동이 많았어요! 함께하는 캠퍼스 문화를 만들고 있어요 💛",
    G: "학교 소통 참여도가 매우 높아요! 학생 사회에 긍정적 영향 💬",
  };

  return text[maxCat];
}


function updateWeeklyReport() {
  setTimeout(() => {
    const data = getWeeklyData();

    document.getElementById("weeklyCount").innerText =
      `이번 주 총 ${data.total}개의 ESG 활동을 수행했어요!`;

    document.getElementById("weeklyComment").innerText =
      makeWeeklyComment(data);

    const chartEl = document.getElementById("weeklyChart");
    if (!chartEl) return;

    const ctx = chartEl.getContext("2d");

    if (window.weeklyChart && typeof window.weeklyChart.destroy === "function") {
      window.weeklyChart.destroy();
    }

    window.weeklyChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["환경", "존중", "소통"],
        datasets: [{
          data: [data.E, data.S, data.G],
          backgroundColor: ["#4caf50", "#ffca28", "#64b5f6"]
        }]
      },
      options: {
        plugins: { legend: { position: "bottom" } },
        cutout: "60%"   // 중앙 텍스트 보이게 하는 옵션
      }
    });

    // ⭐ 차트 중앙 숫자 표시
    const centerText = document.getElementById("weeklyCenterText");
    if (centerText) {
      centerText.innerText = data.total > 0 ? `${data.total}개` : "0개";
    }

  }, 50); // ← DOM 렌더 후 실행됨 (핵심)
}

/* ==========================================================
   🌈 ESG MBTI 분석 시스템 (총 48유형 완전 지원)
========================================================== */

// MBTI 16개별 이름
const MBTI_NAMES = {
  INTP: "아이디어 뱅커",
  INTJ: "통찰형 전략가",
  INFP: "순수한 실천가",
  INFJ: "감성 큐레이터",

  ENFP: "캠퍼스 비타민",
  ENTP: "탐험가 리더",
  ENFJ: "따뜻한 조력자",
  ENTJ: "실천형 리더",

  ISFP: "조용한 감성러",
  ISFJ: "따뜻한 수호자",
  ISTP: "현실형 해결사",
  ISTJ: "꾸준한 실천러",

  ESFP: "에너지 메이커",
  ESTP: "액션 실천가",
  ESFJ: "커뮤니티 메이커",
  ESTJ: "정돈형 관리자"
};

// ESG 타입별 앞쪽 접두사
const ESG_TITLE = {
  E: "환경",
  S: "존중",
  G: "소통"
};

// 결과 설명 (카테고리 + MBTI 조합)
function buildDesc(cat, mbti) {
  const [I, N, T, J] = mbti;

  const trait = {
    I: "혼자서도 꾸준히 실천하는 은근 강한 스타일",
    E: "친구와 함께할 때 더 빛나는 에너지 타입",

    N: "새로운 미션을 잘 찾아내는 탐색가 성향",
    S: "일상 속 루틴 실천이 강한 안정형",

    T: "효율적인 실천을 좋아하는 계산형",
    F: "감정·배려 중심의 감성 실천러",

    J: "계획적으로 매일 실천하는 타입",
    P: "유연하게 몰아서 하는 자유로운 타입"
  };

  const catExplain = {
    E: "환경 실천 비중이 높아요! 🌿",
    S: "친구·배려·소통의 사회적 온도가 높아요! 💛",
    G: "참여·의견 제시·거버넌스 활동이 돋보여요! 💬"
  };

  return `${catExplain[cat]}\n${trait[I]}, ${trait[N]}\n${trait[T]}, ${trait[J]}`;
}

// 🔍 꾸준성 측정
function isConsistent(history) {
  return new Set(history.map(h => h.date)).size >= 5;
}

// 메인 MBTI 분석 함수
function analyzeESGMBTI() {
  const e = history.filter(h => h.category === "E").length;
  const s = history.filter(h => h.category === "S").length;
  const g = history.filter(h => h.category === "G").length;

  const total = e + s + g;
  if (total === 0) {
    return {
      mbti: "--",
      name: "아직 없음",
      desc: "ESG 실천을 시작해보면 자동 분석돼요! 🌱"
    };
  }

  // 1) ESG 주도 타입 결정
  let cat = "E";
  if (s > e && s > g) cat = "S";
  else if (g > e && g > s) cat = "G";

  // 2) MBTI 네 글자 생성
  const IE = (g > (e + s) / 2) ? "E" : "I";  // G 많으면 외향
  const NS = new Set(history.map(h => h.text)).size > 5 ? "N" : "S";
  const TF = e > s ? "T" : "F";
  const JP = isConsistent(history) ? "J" : "P";

  const mbti = `${IE}${NS}${TF}${JP}`;
  const fullType = `${cat}-${mbti}`;

  return {
    mbti: fullType,
    name: `${ESG_TITLE[cat]} ${MBTI_NAMES[mbti] || "실천가"}`,
    desc: buildDesc(cat, mbti)
  };
}

// 페이지 표시
function showMBTIResult() {
  const result = analyzeESGMBTI();

  document.getElementById("mbtiResult").innerText = result.mbti;
  document.getElementById("mbtiName").innerText = result.name;
  document.getElementById("mbtiDesc").innerText = result.desc;

  showPage("mbtiPage");
}

// 버튼 이벤트 연결
document.getElementById("mbtiRetry").addEventListener("click", showMBTIResult);
