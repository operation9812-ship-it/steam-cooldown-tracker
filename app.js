console.log("APP JS LOADED - EDIT FIX VERSION");
let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

function save() {
  localStorage.setItem("accounts", JSON.stringify(accounts));
}

function formatTime(ms) {
  if (ms <= 0) return "Ready to use";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `Unban in: ${hours}h ${minutes}m ${seconds}s`;
}

function parseCooldown(input) {
  if (!input) return 0;

  const text = input.toLowerCase();

  let total = 0;

  const hourMatch = text.match(/(\d+)\s*h/);
  const minMatch = text.match(/(\d+)\s*m/);
  const dayMatch = text.match(/(\d+)\s*d/);

  if (hourMatch) total += parseInt(hourMatch[1]) * 60 * 60 * 1000;
  if (minMatch) total += parseInt(minMatch[1]) * 60 * 1000;
  if (dayMatch) total += parseInt(dayMatch[1]) * 24 * 60 * 60 * 1000;

  return total;
}

function addAccount() {
  const name = document.getElementById("name").value.trim();
  const note = document.getElementById("note").value.trim();
  const cooldownInput = document.getElementById("cooldownInput").value.trim();

  if (!name.trim()) return alert("Enter a name");

  const now = Date.now();
  const duration = parseCooldown(cooldownInput);

  accounts.push({
    name,
    note,
    cooldownTime: now + (duration || 0),
    notified: false
  });

  save();
  render();
}

function resetCooldown(index) {
  if (!confirm("Mark this account as ready?")) return;

  accounts[index].cooldownTime = 0;
  accounts[index].note = "Ready";
  accounts[index].notified = false; 

  save();
  render();
}

function startCooldownPrompt(index) {
  const input = prompt("Enter cooldown (e.g. 30 min, 2 hours, 7 days):");
  const duration = parseCooldown(input);

  if (!duration) {
    alert("Invalid format");
    return;
  }

  accounts[index].cooldownTime = Date.now() + duration;
  accounts[index].notified = false;

  save();
  render();
}

window.deleteAccount = function(index) {
  if (!confirm("Delete this account?")) return;

  accounts.splice(index, 1);
  save();
  render();
};

function exportData() {
  const data = JSON.stringify(accounts, null, 2);
  const blob = new Blob([data], { type: "application/json" });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "csgo-accounts-backup.json";
  a.click();
}

function importData(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    accounts = JSON.parse(e.target.result);
    save();
    render();
  };

  reader.readAsText(file);
}

function editAccount(index) {
  const acc = accounts[index];

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.background = "rgba(0,0,0,0.7)";
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.zIndex = "9999";

  container.innerHTML = `
    <div style="background:#222;padding:20px;border-radius:10px;min-width:300px;">
      <h3>Edit Account</h3>

      <input id="editName" value="${acc.name}" style="width:100%;margin-bottom:10px;padding:5px;">
      <input id="editNote" value="${acc.note}" style="width:100%;margin-bottom:10px;padding:5px;">
      <input id="editCooldown" placeholder="e.g. 2h, 30m, 7d" style="width:100%;margin-bottom:10px;padding:5px;">

      <button id="saveEdit">Save</button>
      <button id="closeEdit">Cancel</button>
    </div>
  `;

  document.body.appendChild(container);

  document.getElementById("saveEdit").onclick = () => {
    acc.name = document.getElementById("editName").value;
    acc.note = document.getElementById("editNote").value;

    const cooldownInput = document.getElementById("editCooldown").value.trim();

    if (cooldownInput !== "") {
      const duration = parseCooldown(cooldownInput);

      if (duration > 0) {
        acc.cooldownTime = Date.now() + duration;
        acc.notified = false;
      } else {
        alert("Invalid cooldown format");
      }
    }

    save();
    render();
    container.remove();
  };

  document.getElementById("closeEdit").onclick = () => {
    container.remove();
  };
}

function render() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  const search =
    document.getElementById("search")?.value?.toLowerCase() || "";

  const now = Date.now();

  const filtered = accounts
    .map((acc, index) => ({ acc, index })) // REAL index preserved
    .filter(item =>
      item.acc.name.toLowerCase().includes(search)
    )
    .sort((a, b) => a.acc.cooldownTime - b.acc.cooldownTime);

  filtered.forEach(({ acc, index }) => {
    const remaining = acc.cooldownTime - now;
    const isReady = remaining <= 0;

    if (isReady && !acc.notified) {
      new Notification("Steam Tracker", {
        body: `${acc.name} is ready!`
      });

      acc.notified = true;
      save();
    }

    const statusText = isReady ? "READY" : "COOLDOWN";
    const timerText = isReady ? "" : formatTime(remaining);

    list.innerHTML += `
      <div class="card">

        <h3>${acc.name}</h3>

        <p class="note">${acc.note}</p>

        <p class="${isReady ? "ready" : "cooldown"}">
          ${statusText}
        </p>

        <p class="timer">
          ${timerText}
        </p>

        <div class="buttons">
          <button onclick="resetCooldown(${index})">Reset</button>
          <button onclick="editAccount(${index})">Edit</button>
          <button onclick="deleteAccount(${index})">Delete</button>
        </div>

      </div>
    `;
  });
}



render();

setInterval(render, 1000);