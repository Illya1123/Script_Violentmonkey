// ==UserScript==
// @name         TikTok Scripts
// @namespace    Violentmonkey Scripts
// @version      1.2
// @description  Arrow cuộn, L like, C mở comment TikTok
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

    function clickFromSvg(svg) {
        let clickable = svg.closest('button, div');
        if (clickable) {
            clickable.click();
            return true;
        }
        return false;
    }

    function clickLikeButton() {
        const heartSvg = document.querySelector(
            'svg[width="24"][height="24"] path[fill-rule="evenodd"]'
        );
        if (!heartSvg) {
            console.warn('Không tìm thấy nút Like');
            return;
        }
        clickFromSvg(heartSvg);
    }

    function clickCommentButton() {
        const commentSvg = document.querySelector(
            'svg[width="24"][height="24"][viewBox="0 0 48 48"] path[fill-rule="evenodd"]'
        );
        if (!commentSvg) {
            console.warn('Không tìm thấy nút Comment');
            return;
        }
        clickFromSvg(commentSvg);
    }

    document.addEventListener('keydown', function (e) {
        if (isTypingTarget(e.target)) return;

        switch (e.key.toLowerCase()) {
            case 'arrowdown':
                e.preventDefault();
                window.scrollBy({ top: scrollStep, behavior: 'smooth' });
                break;

            case 'arrowup':
                e.preventDefault();
                window.scrollBy({ top: -scrollStep, behavior: 'smooth' });
                break;

            case 'l':
                e.preventDefault();
                clickLikeButton();
                break;

            case 'c':
                e.preventDefault();
                clickCommentButton();
                break;
        }
    });
})();
