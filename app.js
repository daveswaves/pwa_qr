// Toggle between scan and generate modes
function showMode(mode) {
  document.getElementById('scan-section').style.display = mode === 'scan' ? 'block' : 'none';
  document.getElementById('generate-section').style.display = mode === 'generate' ? 'block' : 'none';
}

function parseWifiQr(text) {
  if (!text.startsWith("WIFI:")) return null;

  const result = {};
  const fields = text.slice(5).split(/(?<!\\);/); // split on unescaped ;

  for (const field of fields) {
    if (!field) continue;
    const [key, ...valParts] = field.split(":");
    const value = valParts.join(":"); // in case ":" appears in password
    if (key && value !== undefined) {
      result[key] = value;
    }
  }

  if (!result.S || !result.P) return null; // missing SSID or password

  return {
    type: result.T || "WPA",
    ssid: result.S,
    password: result.P,
    hidden: result.H || "false"
  };
}

function onScanSuccess(decodedText) {
  const resultEl = document.getElementById("result");
  const wifi = parseWifiQr(decodedText);

  if (wifi) {
    resultEl.innerHTML = `
      <h2>Wi-Fi Network Detected</h2>
      <p><strong>SSID:</strong> ${wifi.ssid}</p>
      <p><strong>Password:</strong> ${wifi.password}</p>
      <p><strong>Encryption:</strong> ${wifi.type}</p>
      <a id="wifi-link" href="WIFI:T:${wifi.type};S:${wifi.ssid};P:${wifi.password};H:${wifi.hidden};;">
        Tap to connect
      </a>
    `;
  } else {
    resultEl.textContent = `Scanned Text: ${decodedText}`;
  }
}

// Setup scanner
const html5QrCode = new Html5Qrcode("reader");
html5QrCode.start(
  { facingMode: "environment" },
  { fps: 10, qrbox: 250 },
  onScanSuccess,
  (error) => {} // silent on error
);

// QR Code Generator
document.getElementById("wifi-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const ssid = document.getElementById("ssid").value;
  const password = document.getElementById("password").value;
  const type = document.getElementById("encryption").value;

  // Escape special characters
  const escape = (str) => str.replace(/([\\;:])/g, '\\$1');
  
  // const ssid = 'Wilmer WiFi';
  // const password = 'Hol3Farm!';
  
  const wifiString = `WIFI:T:${type};S:${escape(ssid)};P:${escape(password)};;`;

  console.log(wifiString);

  // const wifiString = 'WIFI:T:WPA;S:Wilmer WiFi;P:Hol3Farm!;;';
  // const wifiString = 'WIFI:T:WPA;S:MyWiFi;P:MyPassword;;';

  const canvas = document.getElementById("qrcode");

  QRCode.toCanvas(canvas, wifiString, {
    errorCorrectionLevel: 'M',
    width: 300,  // Default: 200px
    height: 300
  }, function (error) {
    if (error) console.error(error);
    console.log("QR generated!");
  });
});
