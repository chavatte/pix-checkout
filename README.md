<div align="center">

<pre>
                              \\\\\\\
                           \\\\\\\\\\\\
                          \\\\\\\\\\\\\\\
-------------,-|           |C>   // )\\\\|    .o88b. db   db  .d8b.  db    db  .d8b.  d888888b d888888b d88888b
           ,','|          /    || ,'/////|   d8P  Y8 88   88 d8' '8b 88    88 d8' '8b '~~88~~' '~~88~~' 88'
---------,','  |         (,    ||   /////    8P      88ooo88 88ooo88 Y8    8P 88ooo88    88       88    88ooooo
         ||    |          \\  ||||//''''|    8b      88~~~88 88~~~88 '8b  d8' 88~~~88    88       88    88~~~~~
         ||    |           |||||||     _|    Y8b  d8 88   88 88   88  '8bd8'  88   88    88       88    88.
         ||    |______      ''''\____/ \      'Y88P' YP   YP YP   YP    YP    YP   YP    YP       YP    Y88888P
         ||    |     ,|         _/_____/ \
         ||  ,'    ,' |        /          |                 ___________________________________________
         ||,'    ,'   |       |         \  |              / \                                           \
_________|/    ,'     |      /           | |             |  |                                            |
_____________,'      ,',_____|      |    | |              \ |      chavatte@duck.com                     |
             |     ,','      |      |    | |                |                       chavatte.vercel.app  |
             |   ,','    ____|_____/    /  |                |    ________________________________________|___
             | ,','  __/ |             /   |                |  /                                            /
_____________|','   ///_/-------------/   |                 \_/____________________________________________/
              |===========,'
</pre>

---

## `>_ 01. SOBRE O PROJETO`

O **`[SYS.PROTOCOL] // TRANSFERÊNCIA PIX`** é uma página estática e independente para recebimento de contribuições e pagamentos via **PIX (BR Code)**, construída com estética **Matrix / Terminal Cyberpunk**.

Originalmente desenvolvido como um módulo React, o projeto foi portado para **Vanilla JavaScript (Zero-Build)** para permitir hospedagem imediata em qualquer servidor estático, incorporação via `<iframe>` ou distribuição em arquivo único (*Single-File*), sem depender de *bundlers*, Node.js ou APIs externas de pagamento. Todo o processamento e assinatura do pacote ocorrem **100% no navegador do usuário (Client-Side)**.

---

## `>_ 02. FUNCIONALIDADES`

* ⚡ **Geração Dinâmica de BR Code (EMV®):** Construção em tempo real do payload oficial do Banco Central do Brasil conforme o valor ou o identificador mudam.
* 🔐 **Assinatura CRC16-CCITT Nativa:** Cálculo bit a bit do *checksum* de verificação (`Tag 63`) utilizando o polinômio padrão $0\text{x}1021$.
* 🔍 **DEBUG_MODE (Auditoria TLV):** Gaveta interativa que disseca o payload gerado em tempo real, exibindo cada campo **TLV** (*Tag-Length-Value*) bruto e decodificado.
* 🏷️ **Identificação no Extrato (`TxID`):** Campo opcional para o apoiador inserir seu `@username`, sanitizado automaticamente dentro do limite estrito de 25 caracteres alfanuméricos do padrão BACEN.
* 🔗 **Automação via URL (Query Params):** Suporte nativo ao pré-preenchimento de valor e usuário diretamente pelo link (ex: `?valor=25&user=githubuser`).

---

## `>_ 03. ESTRUTURA DO REPOSITÓRIO`

```text
📦 pix-checkout
 ┣ 📂 css
 ┃ ┗ 📜 style.css                   # Estilização Cyberpunk / Matrix e animações
 ┣ 📂 scripts
 ┃ ┣ 📜 app.js                      # Controle de estado, eventos DOM, QR Code e URL Params
 ┃ ┗ 📜 pixEngine.js                # Motor EMV® QRCPS-MPM, sanitização NFD e cálculo CRC16
 ┣ 📜 index.html                  # Estrutura principal da página
 ┗ 📜 README.md                   # Documentação do projeto
```

---

## `>_ 04. COMO USAR E INTEGRAR`

### 4.1. Execução Local ou Hospedagem Estática

Por não possuir dependências de compilação, basta clonar o repositório e abrir o arquivo `index.html` no navegador, ou publicar diretamente no **GitHub Pages**, **Cloudflare Pages**, **Vercel** ou **Netlify**:

```bash
git clone https://github.com/chavatte/pix-checkout.git
cd pix-checkout
# Abra o index.html no navegador ou suba em qualquer host estático
```

### 4.2. Links Pré-configurados (URL Query Parameters)

Você pode compartilhar links diretos com o valor da contribuição e o identificador já preenchidos:

| Parâmetro | Tipo       | Descrição                                                     | Exemplo            |
| :--------- | :--------- | :-------------------------------------------------------------- | :----------------- |
| `valor`  | `Number` | Define o valor fixo inicial da transferência em BRL            | `?valor=25`      |
| `user`   | `String` | Preenche o `@username` e atualiza o `TxID` (máx. 25 chars) | `?user=chavatte` |

**Exemplo de URL combinada:**

```text
https://seu-dominio.com/?valor=50&user=cybersec_fan
```

### 4.3. Incorporação em Outros Sites (`<iframe>`)

Para embutir este checkout dentro do seu blog, documentação ou portfólio mantendo o isolamento de estilos:

```html
<iframe 
  src="https://pix.chavatte.dpdns.org/index.html?valor=10" 
  style="width: 100%; max-width: 920px; height: 780px; border: none; border-radius: 8px;"
  title="[SYS.PROTOCOL] // Transferência PIX - Dev Chavatte">
</iframe>
```

---

## `>_ 05. CONFIGURAÇÃO DO RECEBEDOR`

Para adaptar o checkout para outra chave PIX ou mensagem, basta editar o objeto `PIX_RECEBEDOR` localizado no topo do arquivo `pixEngine.js` (ou dentro da tag `<script>` na versão *standalone*):

```javascript
const PIX_RECEBEDOR = {
  chave: 'pix@chavatte.dpdns.org', // E-mail, CPF/CNPJ, Telefone (+55...) ou EVP
  nome: 'JOAO CARLOS CHAVATTE',    // Sanitizado automaticamente (máx. 25 caracteres)
  cidade: 'SAO CARLOS',            // Sanitizado automaticamente (máx. 15 caracteres)
  txidPadrao: 'PORTFOLIOSPONSOR',  // Fallback alfanumérico (máx. 25 caracteres)
  mensagem: 'Código aberto e pesquisa de vulnerabilidades exigem muita cafeína. Se este portfólio te ajudou, apoie o laboratório ☕',
};
```

> **Nota Técnica:** O motor aplica normalização Unicode (`NFD`) para remover acentos e caracteres especiais automaticamente de `nome`, `cidade` e `txidPadrao`, garantindo 100% de compatibilidade com todos os aplicativos bancários.

---

## `>_ 06. ESPECIFICAÇÃO TÉCNICA (EMV® TLV)`

Abaixo está o mapeamento da estrutura **TLV** (*Tag-Length-Value*) gerada pelo `pixEngine.js` e auditável na interface pelo modo `[+] DEBUG_MODE`:

|      Tag ID      | Nome do Campo            | Valor / Formato               | Descrição                                                    |
| :--------------: | :----------------------- | :---------------------------- | :------------------------------------------------------------- |
| **`00`** | Payload Format Indicator | `01`                        | Versão do formato EMV® QRCPS-MPM                             |
| **`26`** | Merchant Account Info    | `GUI (00)` + `Chave (01)` | Domínio `br.gov.bcb.pix` + Chave PIX                        |
| **`52`** | Merchant Category Code   | `0000`                      | Código MCC padrão (Não especificado)                        |
| **`53`** | Transaction Currency     | `986`                       | Código ISO 4217 para o Real Brasileiro (BRL)                  |
| **`54`** | Transaction Amount       | Ex: `25.00` *(Opcional)*  | Omitido quando selecionado **"Valor Livre"**             |
| **`58`** | Country Code             | `BR`                        | Código ISO 3166-1 alpha-2 do país                            |
| **`59`** | Merchant Name            | `ATÉ 25 CHARS`             | Nome do titular da conta recebedora                            |
| **`60`** | Merchant City            | `ATÉ 15 CHARS`             | Cidade do titular da conta recebedora                          |
| **`62`** | Additional Data Field    | `Subtag 05` (`TxID`)      | Identificador da transação / `@username`                   |
| **`63`** | CRC16 Checksum           | `4 CHARS HEX`               | Assinatura cíclica (`0xFFFF`, polinômio $0\text{x}1021$) |

---

## `>_ 07. AUTOR & LICENÇA`

Desenvolvido por **João Carlos Chavatte (`Dev Chavatte`)**.

* 🌐 **GitHub:** [@chavatte](https://github.com/chavatte)
* ⚡ **Chave PIX:** `pix@chavatte.dpdns.org`
* 📄 **Licença:** Distribuído sob a licença **MIT**. Sinta-se livre para fazer *fork*, auditar e utilizar em seus próprios projetos.
