// Toggle between scan and generate modes
function showMode(mode) {
  document.getElementById('scan-section').style.display = mode === 'scan' ? 'block' : 'none';
  document.getElementById('generate-section').style.display = mode === 'generate' ? 'flex' : 'none';
  
  document.getElementById('generate-section-wifi').style.display = mode === 'generate-wifi' ? 'block' : 'none';
  document.getElementById('generate-section-url').style.display = mode === 'generate-url' ? 'block' : 'none';
  document.getElementById('generate-section-text').style.display = mode === 'generate-text' ? 'block' : 'none';
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
    resultEl.textContent = `
    <h2>Scanned Content</h2>
      <p>${decodedText}</p>
      ${decodedText.startsWith("http") ? `<a href="${decodedText}" target="_blank">Open Link</a>` : ""}
    `;
    
    // resultEl.textContent = `Scanned Text: ${decodedText}`;
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

// Reusable escape function (special characters)
const escape = (str) => str.replace(/([\\;:])/g, '\\$1');



// WiFi QR Generator
document.getElementById("wifi-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const ssid = document.getElementById("ssid").value;
  const password = document.getElementById("password").value;
  const type = document.getElementById("encryption").value;

  // Escape special characters
  // const escape = (str) => str.replace(/([\\;:])/g, '\\$1');
  const wifiString = `WIFI:T:${type};S:${escape(ssid)};P:${escape(password)};;`;
  // console.log(wifiString);
  // const canvas = document.getElementById("qrcode");

  QRCode.toCanvas(document.getElementById("qrcode"), wifiString, {
    errorCorrectionLevel: 'M',
    width: 300,  // Default: 200px
    height: 300
  }, function (error) {
    if (error) console.error(error);
    console.log("QR generated!");
  });
});

// URL QR generation
document.getElementById("url-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const url = document.getElementById("url").value;

  QRCode.toCanvas(document.getElementById("url-qrcode"), url, {
    errorCorrectionLevel: 'M',
    width: 300,
    height: 300
  }, (error) => {
    if (error) console.error(error);
  });
});

// Text QR generation
document.getElementById("text-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const text = document.getElementById("text").value;

  QRCode.toCanvas(document.getElementById("text-qrcode"), text, {
    errorCorrectionLevel: 'M',
    width: 300,
    height: 300
  }, (error) => {
    if (error) console.error(error);
  });
});