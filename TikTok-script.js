// ==UserScript==
// @name         TikTok Arrow Scroll + Like
// @namespace    Violentmonkey Scripts
// @version      1.1
// @description  Dùng phím mũi tên để cuộn TikTok và nhấn L để like video
// @match        https://www.tiktok.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const scrollStep = 400;

    function isTypingTarget(el) {
        return (
            el.tagName === 'INPUT' ||
            el.tagName === 'TEXTAREA' ||
            el.isContentEditable
        );
    }

    function clickLikeButton() {
        const heartSvg = document.querySelector(
            'svg[width="24"][height="24"] path[fill-rule="evenodd"]'
        );

        if (!heartSvg) {
            console.warn('Không tìm thấy nút Tim');
            return;
        }

        let clickable = heartSvg.closest('button, div');

        if (clickable) {
            clickable.click();
            console.log('Đã like video');
        } else {
            console.warn('Không tìm thấy element có thể click');
        }
    }

    document.addEventListener('keydown', function (e) {
        if (isTypingTarget(e.target)) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            window.scrollBy({ top: scrollStep, behavior: 'smooth' });
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            window.scrollBy({ top: -scrollStep, behavior: 'smooth' });
        }

        if (e.key.toLowerCase() === 'l') {
            e.preventDefault();
            clickLikeButton();
        }
    });
})();
