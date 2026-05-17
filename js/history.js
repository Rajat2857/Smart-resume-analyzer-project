function loadHistory() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) return;

  const historyKey = "history_" + currentUser.email;
  const history = JSON.parse(localStorage.getItem(historyKey)) || [];

  const container = document.getElementById("historyContainer");

  if (history.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <i class="fa-regular fa-file"></i>
        <h3>No analyses yet</h3>
        <p>Upload your CV to get started</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="history-list">
      ${history.map(item => `
        <div class="history-card">
          <h3>${item.file_name}</h3>
          <div class="score-badge">${item.score}% ATS</div>
          <div class="history-meta">
            <span>${item.date}</span>
            <span>${item.time}</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

loadHistory();


const clearBtn = document.getElementById("clearHistoryBtn");

if (clearBtn) {
  clearBtn.addEventListener("click", function () {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return;

    const historyKey = "history_" + currentUser.email;
    localStorage.removeItem(historyKey);

    loadHistory();
  });
}






clearBtn.addEventListener("click", hello)


