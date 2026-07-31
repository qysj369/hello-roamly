# 驾驶舱真实视频路线

把**第一人称行车/街景实拍 MP4**放到本目录，并在 `src/data/holoDriveRoutes.ts` 里配置城市与路况节奏。

## 建议规格

- 格式：`H.264` + `AAC` 的 `.mp4`（浏览器兼容最好）
- 画幅：横屏 16:9 或 车机视角；分辨率 720p～1080p
- 时长：30 秒～3 分钟可循环；更长也可
- 内容：挡风玻璃/车头视角，尽量稳定、少剧烈晃动

## 命名示例

| 文件 | 城市 |
|------|------|
| `hangzhou.mp4` | 杭州 |
| `chengdu.mp4` | 成都 |
| `xian.mp4` | 西安 |

配置里把 `src` 改成 `/drive-routes/hangzhou.mp4`，并去掉 `isDemo: true`。

## 路况节奏 `paceSegments`

按视频时间轴自动加减速（模拟真实开车）：

```ts
paceSegments: [
  { atSec: 0, speedKmh: 28, rate: 0.85 },  // 起步慢
  { atSec: 20, speedKmh: 40, rate: 1.05 }, // 直行快一点
  { atSec: 45, speedKmh: 18, rate: 0.7 },  // 路口减速
]
```

- `speedKmh`：仪表显示
- `rate`：视频播放倍速（再乘用户选的「稳妥/常态/稍快」）

## 当前演示文件

`*-demo.mp4` 仅为打通播放链路的占位素材，**不是**对应城市实拍。上线前请替换为真实路况视频。
