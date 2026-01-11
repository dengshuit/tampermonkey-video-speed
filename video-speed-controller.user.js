// ==UserScript==
// @name         Video Speed Controller - Long Press Right Click
// @name:zh-CN   视频倍速控制器 - 长按右键加速
// @namespace    https://github.com/video-speed-controller
// @version      1.0.0
// @description  Long press right mouse button to speed up video playback to 2x, release to restore original speed
// @description:zh-CN  长按鼠标右键将视频加速到2倍速，松开恢复原速度
// @author       You
// @match        *://*.bilibili.com/*
// @match        *://*.youtube.com/*
// @match        *://*.iqiyi.com/*
// @match        *://*.youku.com/*
// @match        *://*.v.qq.com/*
// @match        *://*.douyin.com/*
// @match        *://*.netflix.com/*
// @match        *://*.twitch.tv/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // 配置常量
    const CONFIG = {
        LONG_PRESS_DELAY: 200,    // 长按判定时间（毫秒）
        SPEED_RATE: 2,            // 倍速值
        INDICATOR_POSITION: 'center'  // 提示位置：'center' 或 'top-right'
    };

    // 状态变量
    let pressTimer = null;
    let isLongPress = false;
    let shouldPreventContextMenu = false;  // 单独标志，用于阻止右键菜单
    let originalRate = 1;
    let currentVideo = null;
    let indicator = null;

    /**
     * 获取当前页面的视频元素
     * 优先获取正在播放或可见的视频
     */
    function getVideo() {
        const videos = document.querySelectorAll('video');
        if (videos.length === 0) return null;
        if (videos.length === 1) return videos[0];

        // 多个视频时，优先选择正在播放的
        for (const video of videos) {
            if (!video.paused && video.readyState >= 2) {
                return video;
            }
        }

        // 否则选择可见的视频
        for (const video of videos) {
            const rect = video.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                return video;
            }
        }

        return videos[0];
    }

    /**
     * 获取提示元素应该挂载的容器
     * 全屏时返回全屏元素，否则返回 body
     */
    function getIndicatorContainer() {
        return document.fullscreenElement || document.webkitFullscreenElement || document.body;
    }

    /**
     * 创建倍速提示元素
     */
    function createIndicator(container) {
        const el = document.createElement('div');
        el.id = 'video-speed-indicator';
        el.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.7);
            color: #fff;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 24px;
            font-weight: bold;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            z-index: 2147483647;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.15s ease-in-out;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        el.innerHTML = `<span style="font-size: 20px;">&#9889;</span> ${CONFIG.SPEED_RATE}x`;
        container.appendChild(el);
        return el;
    }

    /**
     * 显示倍速提示
     */
    function showIndicator() {
        const container = getIndicatorContainer();

        // 如果容器变了（比如进入/退出全屏），需要重新创建 indicator
        if (indicator && indicator.parentElement !== container) {
            indicator.remove();
            indicator = null;
        }

        if (!indicator) {
            indicator = createIndicator(container);
        }

        // 调整位置到视频顶部 1/9 处
        const video = currentVideo;
        if (video) {
            const rect = video.getBoundingClientRect();
            indicator.style.top = `${rect.top + rect.height / 9}px`;
            indicator.style.left = `${rect.left + rect.width / 2}px`;
        }

        indicator.style.opacity = '1';
    }

    /**
     * 隐藏倍速提示
     */
    function hideIndicator() {
        if (indicator) {
            indicator.style.opacity = '0';
        }
    }

    /**
     * 开始加速
     */
    function startSpeedUp() {
        currentVideo = getVideo();
        if (!currentVideo) return;

        originalRate = currentVideo.playbackRate;
        currentVideo.playbackRate = CONFIG.SPEED_RATE;
        shouldPreventContextMenu = true;  // 标记需要阻止右键菜单
        showIndicator();

        console.log(`[Video Speed Controller] Speed up: ${originalRate}x -> ${CONFIG.SPEED_RATE}x`);
    }

    /**
     * 停止加速，恢复原速
     */
    function stopSpeedUp() {
        if (!currentVideo) return;

        currentVideo.playbackRate = originalRate;
        hideIndicator();

        console.log(`[Video Speed Controller] Speed restored: ${originalRate}x`);
        currentVideo = null;
    }

    /**
     * 鼠标按下事件处理
     */
    function handleMouseDown(e) {
        // 仅处理右键
        if (e.button !== 2) return;

        // 检查是否在视频元素或其容器上
        const video = getVideo();
        if (!video) return;

        // 清除可能存在的定时器
        if (pressTimer) {
            clearTimeout(pressTimer);
        }

        // 设置长按定时器
        pressTimer = setTimeout(() => {
            isLongPress = true;
            startSpeedUp();
        }, CONFIG.LONG_PRESS_DELAY);
    }

    /**
     * 鼠标松开事件处理
     */
    function handleMouseUp(e) {
        if (e.button !== 2) return;

        // 清除定时器
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }

        // 如果是长按触发的加速，则恢复速度
        if (isLongPress) {
            stopSpeedUp();
            isLongPress = false;
        }
    }

    /**
     * 鼠标离开事件处理（防止鼠标移出窗口时未触发 mouseup）
     */
    function handleMouseLeave(e) {
        if (isLongPress) {
            stopSpeedUp();
            isLongPress = false;
        }

        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    }

    /**
     * 右键菜单事件处理
     * 长按时阻止菜单弹出，普通点击保留原有功能
     */
    function handleContextMenu(e) {
        if (shouldPreventContextMenu) {
            e.preventDefault();
            e.stopPropagation();
            shouldPreventContextMenu = false;  // 重置标志
            return false;
        }
    }

    /**
     * 初始化事件监听
     */
    function init() {
        document.addEventListener('mousedown', handleMouseDown, true);
        document.addEventListener('mouseup', handleMouseUp, true);
        document.addEventListener('mouseleave', handleMouseLeave, true);
        document.addEventListener('contextmenu', handleContextMenu, true);

        // 处理页面可见性变化（切换标签页时恢复速度）
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && isLongPress) {
                stopSpeedUp();
                isLongPress = false;
            }
        });

        console.log('[Video Speed Controller] Initialized');
    }

    // 启动脚本
    init();

})();
