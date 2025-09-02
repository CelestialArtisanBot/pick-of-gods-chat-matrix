// public/chat.js
// Transpiled minimal ES2020-compatible code for browsers (no build required).
(function () {
  const qs = (s) => document.querySelector(s);
  const chatForm = qs("#chatForm");
  const chatInput = qs("#chatInput");
  const chatMessages = qs("#chatMessages");
  const sendBtn = qs("#sendBtn");
  const imgToggleBtn = qs("#imgToggleBtn");
  const modelSelect = qs("#modelSelect");
  const apiKeyInputs = {
    chat: qs("#apiKeyChat"),
    image: qs("#apiKeyImage"),
    "3d": qs("#apiKey3d"),
    video: qs("#apiKeyVideo")
  };
  const saveKeysBtn = qs("#saveKeysBtn");
  const emailForm = qs("#emailForm");
  const emailInput = qs("#emailInput");
  const sendEmailBtn = qs("#sendEmailBtn");
  const modelPreview = qs("#modelPreview");
  var generateImage = false;
  initUI();
  loadSavedKeys();
  renderModelPreview();
  function appendMessage(role, text) {
    var el = document.createElement("div");
    el.className = "message " + role;
    if (isImageUrl(text)) {
      var img = document.createElement("img");
      img.src = text;
      img.alt = "generated";
      img.loading = "lazy";
      img.className = "generated-image";
      el.appendChild(img);
    }
    else {
      el.textContent = text;
    }
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  function isImageUrl(s) {
    return /^https?:\/\/.+\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(s);
  }
  function setToggleButtonState() {
    imgToggleBtn.textContent = generateImage ? "Image ON" : "Generate Image";
    imgToggleBtn.classList.toggle("on", generateImage);
  }
  function getUserKeys() {
    return {
      chat: localStorage.getItem("key_chat") || "",
      image: localStorage.getItem("key_image") || "",
      "3d": localStorage.getItem("key_3d") || "",
      video: localStorage.getItem("key_video") || ""
    };
  }
  function saveUserKeys() {
    Object.entries(apiKeyInputs).forEach(function (_a) {
      var k = _a[0], el = _a[1];
      if (el && el.value)
        localStorage.setItem("key_" + k, el.value.trim());
      else
        localStorage.removeItem("key_" + k);
    });
    flashNotice("API keys saved locally.");
  }
  function loadSavedKeys() {
    Object.entries(apiKeyInputs).forEach(function (_a) {
      var k = _a[0], el = _a[1];
      if (!el)
        return;
      var v = localStorage.getItem("key_" + k);
      if (v)
        el.value = v;
    });
  }
  function flashNotice(msg) {
    var n = document.createElement("div");
    n.className = "notice";
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(function () { return n.classList.add("visible"); }, 10);
    setTimeout(function () { return n.classList.remove("visible"); }, 2500);
    setTimeout(function () { return n.remove(); }, 3000);
  }
  function renderModelPreview() {
    var choice = modelSelect.value;
    if (modelPreview)
      modelPreview.textContent = "Model target: " + choice.toUpperCase();
  }
  function initUI() {
    setToggleButtonState();
    if (saveKeysBtn)
      saveKeysBtn.addEventListener("click", function (e) {
        e.preventDefault();
        saveUserKeys();
      });
    if (modelSelect)
      modelSelect.addEventListener("change", function () {
        renderModelPreview();
      });
    if (imgToggleBtn)
      imgToggleBtn.addEventListener("click", function () {
        generateImage = !generateImage;
        setToggleButtonState();
      });
    if (chatForm) {
      chatForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var txt = chatInput.value.trim();
        if (!txt)
          return;
        chatInput.value = "";
        sendChat(txt);
      });
    }
    if (sendBtn)
      sendBtn.addEventListener("click", function (e) {
        e.preventDefault();
        var txt = chatInput.value.trim();
        if (!txt)
          return;
        chatInput.value = "";
        sendChat(txt);
      });
    if (sendEmailBtn)
      sendEmailBtn.addEventListener("click", function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var to, last, body, err_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              e.preventDefault();
              to = (emailInput && emailInput.value && emailInput.value.trim()) || "";
              if (!to) {
                flashNotice("Enter email address");
                return [2 /*return*/];
              }
              last = Array.from(chatMessages.querySelectorAll(".message.ai")).pop();
              body = last ? (last.innerText || last.textContent || "") : "No content";
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [4 /*yield*/, fetch("/api/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: to, subject: "Your generated content", body: body }) })];
            case 2:
              _a.sent();
              flashNotice("Email request sent (server must implement /api/send).");
              return [3 /*break*/, 4];
            case 3:
              err_1 = _a.sent();
              console.error(err_1);
              flashNotice("Failed to request email send.");
              return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
          }
        });
      }); });
  }
  function sendChat(userText) {
    return __awaiter(this, void 0, void 0, function () {
      var userKeys, payload, res, data, e_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            appendMessage("user", userText);
            userKeys = getUserKeys();
            payload = {
              messages: [{ role: "user", content: userText }],
              generateImage: generateImage,
              modelChoice: modelSelect ? modelSelect.value : "chat",
              userKeys: userKeys,
              maxTokens: 512,
              temperature: 0.7
            };
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            return [4 /*yield*/, fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })];
          case 2:
            res = _a.sent();
            if (!res.ok) return [3 /*break*/, 3];
            return [3 /*break*/, 3];
          case 3:
            if (!res.ok) {
              res.text().then(function (txt) { appendMessage("ai", "Error: " + res.status + " " + txt); });
              return [2 /*return*/];
            }
            _a.label = 4;
          case 4:
            _a.trys.push([4, 7, , 8]);
            return [4 /*yield*/, res.json()];
          case 5:
            data = _a.sent();
            if (data && Array.isArray(data.messages)) {
              data.messages.forEach(function (m) { return appendMessage(m.role, m.content); });
            }
            else if (data && data.imageUrl) {
              appendMessage("ai", data.imageUrl);
            }
            else if (typeof data === "string") {
              appendMessage("ai", data);
            }
            else {
              appendMessage("ai", "No response from server.");
            }
            return [3 /*break*/, 8];
          case 6:
            e_1 = _a.sent();
            console.error(e_1);
            appendMessage("ai", "Network error.");
            return [3 /*break*/, 8];
          case 7: return [3 /*break*/, 8];
          case 8: return [2 /*return*/];
        }
      });
    });
  }
  // helpers for tslib-like generator polyfill (kept local to avoid external deps)
  function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : Promise.resolve(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }
  function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_) try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [0, t.value];
        switch (op[0]) {
          case 0: case 1: t = op; break;
          case 4: _.label++; return { value: op[1], done: false };
          case 5: _.label++; y = op[1]; op = [0]; continue;
          case 7: op = _.ops.pop(); _.trys.pop(); continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
            if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
            if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
            if (t[2]) _.ops.pop();
            _.trys.pop(); continue;
        }
        op = body.call(thisArg, _);
      } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
      if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
  }
})();
