// 📌 ESG 미션 데이터
const missions = [
  { text: "텀블러 사용하기", category: "E" },
  { text: "정수대에서 물 채우기", category: "E" },
  { text: "칭찬 한 마디 하기", category: "S" },
  { text: "학생 의견 게시판 참여하기", category: "G" },
  { text: "계단 이용하기", category: "E" },
  { text: "휴지 아껴쓰기", category: "S" },
  { text: "친구와 인사 나누기", category: "S" },
  { text: "일회용 빨대 줄이기", category: "E" },
  { text: "학교 행사 정보 공유하기", category: "G" }
];

// 저장 불러오기
let points = Number(localStorage.getItem("points")) || 0;
let history = JSON.parse(localStorage.getItem("history")) || [];
let todayMissionIndex = Number(localStorage.getItem("todayIndex"));
let todayDate = localStorage.getItem("todayDate");
const today = new Date().toISOString().split('T')[0];

const categoryIcon = { E: "🌿", S: "💛", G: "💬" };

// ---------------------------------------------------------
// 레벨/경험치
function updateLevel() {
  const level = Math.floor(points / 50) + 1;
  const exp = points % 50;
  document.getElementById("level").innerText = level;
  document.getElementById("expBar").style.width = (exp * 2) + "%";
}

// ---------------------------------------------------------
// 마스코트
const messages = [
  "환경은 작은 실천부터! 🌱",
  "멋지다! 계속 가보자! ✨",
  "너 정말 ESG 챔피언이야! 💪"
];

function mascotReaction(type) {
  const m = document.getElementById("mascot");
  const msg = document.getElementById("mascotMsg");

  let duration = 3000;
  msg.innerText = messages[Math.floor(Math.random() * messages.length)];

  if(type === "levelup") {
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

// ---------------------------------------------------------
// 폭죽
function fireLevelUpEffect() {
  const effect = document.getElementById("levelUpEffect");
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

// ---------------------------------------------------------
// 오늘 미션 랜덤
function setRandomMission() {
  if (todayDate !== today || todayMissionIndex == null) {
    todayMissionIndex = Math.floor(Math.random() * missions.length);
    todayDate = today;
    localStorage.setItem("todayIndex", todayMissionIndex);
    localStorage.setItem("todayDate", todayDate);
  }
  document.getElementById("randomMission").innerText = missions[todayMissionIndex].text;
}

// ---------------------------------------------------------
function completeMission(index) {
  const prevLevel = Math.floor(points / 50) + 1;
  points += 10;

  const newLevel = Math.floor(points / 50) + 1;
  if (newLevel > prevLevel) {
    mascotReaction("levelup");
    fireLevelUpEffect();
  } else {
    mascotReaction("success");
  }

  history.push({
    text: missions[index].text,
    category: missions[index].category,
    date: today
  });

  localStorage.setItem("points", points);
  localStorage.setItem("history", JSON.stringify(history));

  updatePages();
  updateTodayProgress();
}

// ⭐ 오늘 서로 다른 미션 3개가 목표!
function completeTodayMission() {
  const doneToday = history.filter(h => h.date === today);
  const uniqueCount = new Set(doneToday.map(h => h.text)).size;

  if (uniqueCount >= 3) {
    alert("오늘 목표 이미 달성 완료! 🎉");
    return;
  }

  completeMission(todayMissionIndex);
  setRandomMission();

  const afterCount = new Set(
    history.filter(h => h.date === today).map(h => h.text)
  ).size;

  if (afterCount >= 3) {
    alert("🌟 ESG 목표 달성! 완벽합니다! 🌱✨");
  }
}

// ---------------------------------------------------------
// 미션 리스트
function loadMissions(filter="ALL") {
  const list = document.getElementById("missionList");
  list.innerHTML = "";

  missions.filter(m => filter==="ALL" || m.category===filter)
    .forEach((m, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="icon">${categoryIcon[m.category]}</div>
        <span>${m.text}</span>
      `;
      li.addEventListener("click", () => completeMission(i));
      list.appendChild(li);
    });
}

// ---------------------------------------------------------
// UI
function updateTodayProgress() {
  const doneToday = history.filter(h => h.date === today);
  const uniqueCount = new Set(doneToday.map(h => h.text)).size;

  document.getElementById("todayProgress")
    .innerText = `오늘 진행도: ${uniqueCount}/3${uniqueCount>=3 ? " ⭐" : ""}`;
}

function updateHistoryPage() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  history.slice().reverse().forEach(h => {
    const li = document.createElement("li");
    li.innerText = `${h.date} - ${h.text}`;
    list.appendChild(li);
  });
}

function updateRewardPage() {
  const level = Math.floor(points / 50) + 1;
  document.getElementById("rewardLevel").innerText = level;
  document.getElementById("rewardCount").innerText = history.length;

  const badgeArea = document.getElementById("badges");
  badgeArea.innerHTML = "";

  // 카운트
  const count = cat =>
    history.filter(h => h.category === cat).length;

  const e = count("E"), s = count("S"), g = count("G");

  // 대표 뱃지 (1개)
  if (e + s + g > 0) {
    if (e > s && e > g) addBadge("🌿", "green");
    else if (s > e && s > g) addBadge("💛", "yellow");
    else if (g > e && g > s) addBadge("💬", "blue");
    else addBadge("⭐", "master");
  }

  // 레벨업 메달 (여러 개)
  for (let i = 1; i < level; i++) {
    addBadge("🏅", "medal");
  }

  function addBadge(icon, type) {
    const div = document.createElement("div");
    div.className = `badge ${type}`;
    div.innerText = icon;
    badgeArea.appendChild(div);
  }
}


// ---------------------------------------------------------
// 차트
let esgChart;
function updateESGChart() {
  const ctx = document.getElementById("esgChart").getContext("2d");

  const countToday = cat =>
    history.filter(h => h.date === today && h.category === cat).length;

  if (esgChart) esgChart.destroy();
  esgChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["환경🌿", "존중💛", "소통💬"],
      datasets: [{
        data: [countToday("E"), countToday("S"), countToday("G")],
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

// ---------------------------------------------------------
function updatePages() {
  updateLevel();
  updateHistoryPage();
  updateRewardPage();
  updateTodayProgress();
  updateESGChart();
}

// ---------------------------------------------------------
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  updatePages();
}

function initFilterButtons() {
  [["all","ALL"],["e","E"],["s","S"],["g","G"]]
    .forEach(([id,cat])=>{
      document.getElementById(`btn-${id}`)
        ?.addEventListener("click",()=>{
          loadMissions(cat);
          setActiveFilter(`btn-${id}`);
        });
    });

  document.getElementById("btn-random")
    ?.addEventListener("click", completeTodayMission);
}

function initNavButtons() {
  [["home","homePage"],["reward","rewardPage"],["my","myPage"]]
  .forEach(([btn, page])=>{
    document.getElementById(`tab-${btn}`)
    .addEventListener("click", ()=>showPage(page));
  });
}

function setActiveFilter(id) {
  document.querySelectorAll(".tab button").forEach(btn => btn.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
}

// ---------------------------------------------------------
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

window.addEventListener("load", () => {
  const popup = document.getElementById("noticePopup");
  const closeBtn = document.getElementById("popupClose");

  if (!localStorage.getItem("popupSeen")) {
    popup.style.display = "flex";
  }

  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
    localStorage.setItem("popupSeen", "true");
  });
});
