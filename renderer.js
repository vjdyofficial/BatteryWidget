const status = document.getElementById("status");

async function setMode(mode) {
  status.textContent = "Setting mode...";
  const result = await window.batteryAPI.setMode(mode);
  status.textContent = result.success ? result.message : "Error: " + result.message;
}