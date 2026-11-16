const PIX_RECEBEDOR = Object.freeze({
  chave: "pix@chavatte.dpdns.org",
  nome: "JOAO CARLOS CHAVATTE",
  cidade: "SAO CARLOS",
  txidPadrao: "PORTFOLIOSPONSOR",
  mensagem:
    "Código aberto e pesquisa de vulnerabilidades exigem muita cafeína. Se este portfólio te ajudou, apoie o laboratório ☕",
});

const ALLOWED_HOSTS = Object.freeze([
  "localhost",
  "127.0.0.1",
  "chavatte.github.io",
  "chavatte.vercel.app",
  "chavatte.dpdns.org",
  "chavatte.private",
]);

const EXPECTED_TAG26 = "26440014br.gov.bcb.pix0122pix@chavatte.dpdns.org";
const EXPECTED_TAG59 = "5920JOAO CARLOS CHAVATTE";

const verifyOrigin = () => {
  if (window.location.protocol === "file:") return true;
  const host = window.location.hostname.toLowerCase();
  return ALLOWED_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`),
  );
};

const sanitizeEmvString = (str, maxLen) =>
  String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 .,/-]/g, "")
    .toUpperCase()
    .trim()
    .slice(0, maxLen);

const sanitizeTxId = (rawInput, fallback) => {
  const cleaned = String(rawInput || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 25);
  return cleaned.length > 0
    ? cleaned
    : String(fallback || "PORTFOLIOSPONSOR")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 25);
};

const tlv = (id, value) => {
  const str = String(value);
  const len = String(str.length).padStart(2, "0");
  return `${id}${len}${str}`;
};

const computeCRC16 = (payloadWithoutCrc) => {
  let crc = 0xffff;
  for (let i = 0; i < payloadWithoutCrc.length; i++) {
    crc ^= payloadWithoutCrc.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) crc = ((crc << 1) ^ 0x1021) & 0xffff;
      else crc = (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
};

const buildPixBrCode = (amount, donorRawTxId) => {
  if (!verifyOrigin()) {
    throw new Error(
      `[SEC_ALERT] Domínio não autorizado: ${window.location.hostname}`,
    );
  }

  const key = PIX_RECEBEDOR.chave.trim();
  const merchantName = sanitizeEmvString(PIX_RECEBEDOR.nome, 25);
  const merchantCity = sanitizeEmvString(PIX_RECEBEDOR.cidade, 15);
  const txId = sanitizeTxId(donorRawTxId, PIX_RECEBEDOR.txidPadrao);

  const tag00 = tlv("00", "01");
  const tag26 = tlv("26", tlv("00", "br.gov.bcb.pix") + tlv("01", key));
  const tag52 = tlv("52", "0000");
  const tag53 = tlv("53", "986");

  const numericAmount = Number(amount);
  const hasFixedAmount = !isNaN(numericAmount) && numericAmount > 0;
  const formattedAmount = hasFixedAmount ? numericAmount.toFixed(2) : "";
  const tag54 = hasFixedAmount ? tlv("54", formattedAmount) : "";

  const tag58 = tlv("58", "BR");
  const tag59 = tlv("59", merchantName);
  const tag60 = tlv("60", merchantCity);
  const tag62 = tlv("62", tlv("05", txId));

  const payloadToSign =
    tag00 +
    tag26 +
    tag52 +
    tag53 +
    tag54 +
    tag58 +
    tag59 +
    tag60 +
    tag62 +
    "6304";

  const crc16 = computeCRC16(payloadToSign);
  const fullPayload = payloadToSign + crc16;

  if (
    !fullPayload.includes(EXPECTED_TAG26) ||
    !fullPayload.includes(EXPECTED_TAG59)
  ) {
    throw new Error(
      "[SEC_ALERT] Violação de integridade nas tags do recebedor PIX.",
    );
  }

  const tlvAuditList = [
    {
      id: "00",
      name: "Payload Format",
      raw: tag00,
      decoded: "01 (EMV® QRCPS-MPM)",
    },
    {
      id: "26",
      name: "Merchant Account",
      raw: tag26,
      decoded: `br.gov.bcb.pix | ${key}`,
    },
    {
      id: "52",
      name: "Category Code",
      raw: tag52,
      decoded: "0000 (Não especificado)",
    },
    { id: "53", name: "Currency", raw: tag53, decoded: "986 (BRL)" },
    {
      id: "54",
      name: "Amount",
      raw: hasFixedAmount ? tag54 : "(Omitido)",
      decoded: hasFixedAmount ? `R$ ${formattedAmount}` : "Valor Aberto",
    },
    { id: "58", name: "Country", raw: tag58, decoded: "BR (Brasil)" },
    { id: "59", name: "Merchant Name", raw: tag59, decoded: merchantName },
    { id: "60", name: "Merchant City", raw: tag60, decoded: merchantCity },
    { id: "62", name: "Additional Data", raw: tag62, decoded: `TxID: ${txId}` },
    { id: "63", name: "CRC16", raw: `6304${crc16}`, decoded: `0x${crc16}` },
  ];

  return { payload: fullPayload, crc16, txId, tlvAuditList };
};
