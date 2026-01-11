# Video Speed Controller - 视频倍速控制器

一个油猴脚本，实现长按鼠标右键加速视频播放，松开恢复原速度，类似手机端的长按加速体验。

## 功能特性

- 长按鼠标右键（>200ms）视频加速到 2 倍速
- 松开右键立即恢复原始播放速度
- 短按右键保留原有右键菜单功能
- 视频上方显示倍速提示（⚡ 2x）
- 支持全屏模式
- 支持主流视频网站

## 支持的网站

- Bilibili（哔哩哔哩）
- YouTube
- 爱奇艺
- 优酷
- 腾讯视频
- 抖音网页版
- Netflix
- Twitch

## 安装方法

### 前置要求

浏览器需安装 Tampermonkey 扩展：
- [Chrome 网上应用店](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Firefox 附加组件](https://addons.mozilla.org/firefox/addon/tampermonkey/)
- [Edge 外接程序](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### 安装脚本

**方法一：直接安装**
1. 点击 Tampermonkey 图标 → "添加新脚本"
2. 删除默认内容，粘贴 `video-speed-controller.user.js` 的全部代码
3. 按 `Ctrl+S` 保存

**方法二：文件安装**
1. 将 `video-speed-controller.user.js` 文件拖拽到浏览器窗口
2. 在弹出的 Tampermonkey 安装页面点击"安装"

## 使用方法

| 操作 | 效果 |
|------|------|
| 长按右键（>200ms） | 视频加速到 2x，显示 ⚡ 2x 提示 |
| 松开右键 | 恢复原速度，提示消失 |
| 短按右键 | 正常弹出右键菜单 |

## 配置选项

脚本顶部的 `CONFIG` 对象可自定义：

```javascript
const CONFIG = {
    LONG_PRESS_DELAY: 200,  // 长按判定时间（毫秒）
    SPEED_RATE: 2,          // 加速倍率
};
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `LONG_PRESS_DELAY` | 长按触发的时间阈值 | 200ms |
| `SPEED_RATE` | 加速时的播放倍率 | 2 |

## 常见问题

**Q: 为什么某些网站不生效？**

A: 部分网站使用自定义播放器可能存在兼容性问题。可以在脚本的 `@match` 部分添加网站地址来启用支持。

**Q: 如何修改加速倍率？**

A: 编辑脚本，修改 `CONFIG.SPEED_RATE` 的值，例如改为 `3` 即为 3 倍速。

**Q: 如何添加新网站支持？**

A: 在脚本头部的 `@match` 区域添加新网站，格式如：
```javascript
// @match        *://*.example.com/*
```

## 技术实现

- 监听 `mousedown`/`mouseup` 事件检测长按
- 通过 `video.playbackRate` API 控制播放速度
- 检测 `document.fullscreenElement` 处理全屏模式
- 使用定时器区分长按与普通点击

## License

MIT
