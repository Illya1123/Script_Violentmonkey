// ==UserScript==
// @name         W3Schools — Auto Translate
// @namespace    vm-w3s-translate
// @version      1.0
// @description  Tự động dịch thẻ <p> trên toàn bộ W3Schools sang tiếng Việt, giữ nguyên nội dung trong <code>
// @author       Taki Shuichi (Quốc Anh)
// @match        https://www.w3schools.com/*

// @updateURL    https://raw.githubusercontent.com/Illya1123/Script_Violentmonkey/refs/heads/main/W3Schools_Auto_Translate.js
// @downloadURL  https://raw.githubusercontent.com/Illya1123/Script_Violentmonkey/refs/heads/main/W3Schools_Auto_Translate.js
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @connect      translate.googleapis.com
// ==/UserScript==

(function () {
  "use strict";

  const TARGET_LANG = "vi";
  const SELECTOR = "p";

  function gmGet(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url,
        headers: { Accept: "application/json, text/javascript" },
        onload: (r) =>
          r.status >= 200 && r.status < 300
            ? resolve(r.responseText)
            : reject(new Error("HTTP " + r.status)),
        onerror: reject,
      });
    });
  }

  async function translateText(text) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${TARGET_LANG}&dt=t&q=${encodeURIComponent(
      text
    )}`;
    try {
      const raw = await gmGet(url);
      const data = JSON.parse(raw);
      return data[0].map((x) => x[0]).join("");
    } catch (e) {
      console.debug("Translate fallback (keep original):", e);
      return text;
    }
  }

  const processed = new WeakSet();

  async function translateParagraph(el) {
    if (processed.has(el)) return;
    processed.add(el);

    const childNodes = Array.from(el.childNodes);
    for (const node of childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const original = node.nodeValue.trim();
        if (original) {
          const vn = await translateText(original);
          node.nodeValue = vn;
        }
      }
      // Nếu là <code> thì bỏ qua, giữ nguyên
    }
  }

  function translateAllP() {
    const nodes = document.querySelectorAll(SELECTOR);
    nodes.forEach((el) => translateParagraph(el));
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  const run = debounce(translateAllP, 250);

  window.addEventListener("load", run);
  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
