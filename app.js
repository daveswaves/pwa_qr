// Toggle between scan and generate modes
function showMode(mode) {
  document.getElementById('scan-section').style.display = mode === 'scan' ? 'block' : 'none';
  // document.getElementById('generate-section').style.display = mode === 'generate' ? 'flex' : 'none';

  document.getElementById('generate-section').style.display = 'none';

  if ('generate' === mode) {
    document.getElementById('generate-section').style.display = 'flex';
    document.getElementById('submit').style.display = 'none';
    document.getElementById('qrcode').style.display = 'none';
  }

  document.getElementById('wifi-field').style.display = mode === 'generate-wifi' ? 'flex' : 'none';
  document.getElementById('url-field').style.display = mode === 'generate-url' ? 'block' : 'none';
  document.getElementById('text-field').style.display = mode === 'generate-text' ? 'block' : 'none';

  if ('block' === document.getElementById('wifi-field').style.display ||
      'block' === document.getElementById('url-field').style.display ||
      'block' === document.getElementById('text-field').style.display)
  {
    document.getElementById('submit').style.display = 'inline-block';
    document.getElementById('qrcode').style.display = 'inline-block';
    // document.querySelector('[type="submit"]').style.display = 'block';

    const canvas = document.getElementById('qrcode');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
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
  }
}

function fldType(arg) {
  console.log(arg);
  
  if ('wifi' == arg) {
    const ssid = document.getElementById("ssid").value;
    const password = document.getElementById("password").value;
    const type = document.getElementById("encryption").value;

    const escape = (str) => str.replace(/([\\;:])/g, '\\$1');
    return `WIFI:T:${type};S:${escape(ssid)};P:${escape(password)};;`;
  }
  else {
    return document.getElementById(arg).value;
  }
}

function makeCanvas(dataStr) {
  QRCode.toCanvas(document.getElementById("qrcode"), dataStr, {
    errorCorrectionLevel: 'M',
    width: 300,
    height: 300
  }, (error) => {
    if (error) console.error(error);
  });
}


// Setup scanner
const html5QrCode = new Html5Qrcode("reader");
html5QrCode.start(
  { facingMode: "environment" },
  { fps: 10, qrbox: 250 },
  onScanSuccess,
  (error) => {} // silent on error
);

// QR Generator
document.getElementById("qr-form").addEventListener("submit", function (e) {
  e.preventDefault();
  if ('block' === document.getElementById('wifi-field').style.display){
    makeCanvas(fldType('wifi'));
  }
  else if ('block' === document.getElementById('url-field').style.display){
    makeCanvas(fldType('url'));
  }
  else if ('block' === document.getElementById('text-field').style.display){
    makeCanvas(fldType('text'));
  }
});
