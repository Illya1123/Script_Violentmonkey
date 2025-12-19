// ==UserScript==
// @name         W3Schools — Auto Translate
// @namespace    vm-w3s-translate
// @version      1.1
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
  const SKIP_WITHIN = new Set(["CODE", "PRE", "KBD", "SAMP"]);
  const processed = new WeakSet();

  // --- GM xhr compat layer (VM/TM, Chromium/Gecko) ---
  const gmXHR = (opts) => {
    const fn = (typeof GM !== "undefined" && GM.xmlHttpRequest)
      ? GM.xmlHttpRequest
      : (typeof GM_xmlhttpRequest !== "undefined" ? GM_xmlhttpRequest : null);
    if (!fn) throw new Error("No GM xmlHttpRequest available");
    return fn(opts);
  };

  function gmGetJSON(url) {
    return new Promise((resolve, reject) => {
      try {
        gmXHR({
          method: "GET",
          url,
          anonymous: true,            // giúp ổn định trên Firefox
          timeout: 15000,
          responseType: "json",       // Firefox hỗ trợ, nếu không sẽ là text
          headers: { "Accept": "application/json, text/javascript" },
          onload: (r) => {
            // Khi responseType không được hỗ trợ, r.response = null -> dùng responseText
            let data = r.response;
            if (!data) {
              try { data = JSON.parse(r.responseText); }
              catch (e) { return reject(e); }
            }
            resolve(data);
          },
          ontimeout: () => reject(new Error("Request timeout")),
          onerror: (e) => reject(e),
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async function translateText(text) {
    // NOTE: API không chính thức của Google Translate
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(TARGET_LANG)}&dt=t&q=${encodeURIComponent(text)}`;
    try {
      const data = await gmGetJSON(url);
      // data[0] = [[translated, original, ...], ...]
      return Array.isArray(data?.[0]) ? data[0].map(x => x?.[0] ?? "").join("") : text;
    } catch (e) {
      console.debug("Translate fallback (keep original):", e);
      return text;
    }
  }

  // Lấy mọi text node trong <p> nhưng bỏ qua phần nằm trong code-like
  function getTranslatableTextNodes(rootEl) {
    const tw = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        // bỏ qua nếu text nằm trong các thẻ code-like
        if (SKIP_WITHIN.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    let n;
    while ((n = tw.nextNode())) nodes.push(n);
    return nodes;
  }

  async function translateParagraph(el) {
    if (processed.has(el)) return;
    processed.add(el);

    const textNodes = getTranslatableTextNodes(el);
    // Dịch từng node để giữ đúng vị trí, tránh phá layout/code
    for (const node of textNodes) {
      const original = node.nodeValue.trim();
      if (!original) continue;

      // Tránh spam API cho đoạn quá ngắn/chứa toàn ký tự đặc biệt
      if (/^[\s.,;:()\[\]{}'"`~!@#$%^&*\-_/\\|<>+]+$/.test(original)) continue;

      try {
        const translated = await translateText(original);
        // Giữ nguyên khoảng trắng đầu/cuối ban đầu nếu có
        const leading = node.nodeValue.match(/^\s*/)?.[0] ?? "";
        const trailing = node.nodeValue.match(/\s*$/)?.[0] ?? "";
        node.nodeValue = leading + translated + trailing;
      } catch {
        // bỏ qua nếu lỗi, giữ nguyên text
      }
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

  const run = debounce(translateAllP, 300);

  // Khởi chạy và quan sát thay đổi DOM (SPA của W3Schools)
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run);

  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();