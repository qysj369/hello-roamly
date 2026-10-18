# city-ai · 二线城市 AI 配套图

用于城市弹窗图栏二级降级（无本地实拍白名单时）：

- 目录：`/city-ai/{slug}/01.svg` … `04.svg`（也可换成 `.jpg`/`.webp`，同步改 `AI_COMPANION_FILES`）
- 名单：`src/data/holoCityPreviewGalleryResolve.ts` → `AI_COMPANION_GALLERY_CITIES`
- 实拍优先：白名单有可加载图时不会走到本目录

补图只需放入对应 slug 目录，无需改弹窗组件。
