let state = {
  amount: 0,
  customAmount: "",
  donorId: "",
  copied: false,
  showAudit: false,
};

const receiverMsgEl = document.getElementById("receiver-msg");
const receiverKeyEl = document.getElementById("receiver-key");
const presetButtons = document.querySelectorAll("#preset-buttons button");
const customAmountInput = document.getElementById("custom-amount");
const donorIdInput = document.getElementById("donor-id");
const txidPreviewVal = document.getElementById("txid-preview-val");
const payloadInput = document.getElementById("payload-input");
const copyBtn = document.getElementById("copy-btn");
const copyIcon = document.getElementById("copy-icon");
const copyText = document.getElementById("copy-text");
const qrBadge = document.getElementById("qr-badge");
const qrCanvasContainer = document.getElementById("qr-canvas-container");
const auditToggle = document.getElementById("audit-toggle");
const auditIcon = document.getElementById("audit-icon");
const auditGrid = document.getElementById("audit-grid");
const toastEl = document.getElementById("toast");
const toastText = document.getElementById("toast-text");

receiverMsgEl.textContent = PIX_RECEBEDOR.mensagem;
receiverKeyEl.textContent = `Chave: ${PIX_RECEBEDOR.chave}`;

function renderQRCode(payload) {
  qrCanvasContainer.innerHTML = "";
  if (typeof qrcode !== "undefined") {
    const qr = qrcode(0, "M");
    qr.addData(payload);
    qr.make();
    qrCanvasContainer.innerHTML = qr.createSvgTag({
      scalable: true,
      margin: 0,
    });
    const svg = qrCanvasContainer.querySelector("svg");
    if (svg) {
      svg.style.width = "180px";
      svg.style.height = "180px";
    }
  }
}

function renderAuditList(tlvAuditList) {
  auditGrid.innerHTML = tlvAuditList
    .map(
      (item) => `
      <div class="audit-item">
        <div class="audit-item__top">
          <span class="tag-id">ID ${item.id}</span>
          <span class="tag-name">${item.name}</span>
        </div>
        <div class="tag-raw">${item.raw}</div>
        <div class="tag-decoded">${item.decoded}</div>
      </div>
    `,
    )
    .join("");
}

function updateUI() {
  const pixData = buildPixBrCode(state.amount, state.donorId);

  presetButtons.forEach((btn) => {
    const val = Number(btn.getAttribute("data-val"));
    if (state.amount === val) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  txidPreviewVal.textContent = pixData.txId;
  payloadInput.value = pixData.payload;

  qrBadge.textContent =
    state.amount > 0 ? `R$ ${state.amount.toFixed(2)}` : "VALOR LIVRE";
  renderQRCode(pixData.payload);

  renderAuditList(pixData.tlvAuditList);
}

let toastTimeout;
function showToast(message) {
  toastText.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2500);
}

presetButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const val = Number(btn.getAttribute("data-val"));
    state.amount = val;
    state.customAmount = val > 0 ? val.toString() : "";
    customAmountInput.value = state.customAmount;
    updateUI();
  });
});

customAmountInput.addEventListener("input", (e) => {
  state.customAmount = e.target.value;
  state.amount = Number(e.target.value) || 0;
  updateUI();
});

donorIdInput.addEventListener("input", (e) => {
  state.donorId = e.target.value;
  updateUI();
});

let copyTimeout;
copyBtn.addEventListener("click", async () => {
  const pixData = buildPixBrCode(state.amount, state.donorId);
  try {
    await navigator.clipboard.writeText(pixData.payload);
    copyBtn.classList.add("copied");
    copyIcon.className = "fa-solid fa-check";
    copyText.textContent = "PAYLOAD COPIADO! ✔";
    showToast("Payload PIX Copiado!");

    clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => {
      copyBtn.classList.remove("copied");
      copyIcon.className = "fa-solid fa-copy";
      copyText.textContent = ">_ COPIAR CÓDIGO PIX";
    }, 2000);
  } catch (err) {
    payloadInput.select();
    document.execCommand("copy");
    showToast("Payload PIX Copiado!");
  }
});

auditToggle.addEventListener("click", () => {
  state.showAudit = !state.showAudit;
  if (state.showAudit) {
    auditGrid.classList.add("visible");
    auditIcon.classList.add("open");
  } else {
    auditGrid.classList.remove("visible");
    auditIcon.classList.remove("open");
  }
});

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("valor")) {
  const v = Number(urlParams.get("valor"));
  if (!isNaN(v) && v > 0) {
    state.amount = v;
    state.customAmount = v.toString();
    customAmountInput.value = state.customAmount;
  }
}
if (urlParams.has("user")) {
  state.donorId = urlParams.get("user").slice(0, 25);
  donorIdInput.value = state.donorId;
}

updateUI();
