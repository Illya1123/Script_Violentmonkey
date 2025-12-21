// ==UserScript==
// @name         TikTok Scripts (data-e2e)
// @namespace    Violentmonkey Scripts
// @version      1.3
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

    function clickLikeButton() {
        const heart = document.querySelector('[data-e2e="like-icon"], [data-e2e="browse-like-icon"]');
        if (!heart) {
            console.warn('Không tìm thấy nút Like');
            return;
        }

        (heart.closest('button, div') || heart).click();
    }

    function clickCommentButton() {
        const comment = document.querySelector('[data-e2e="comment-icon"]');
        if (!comment) {
            console.warn('Không tìm thấy nút Comment');
            return;
        }

        (comment.closest('button, div') || comment).click();
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
