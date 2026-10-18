/// <reference types="vite/client" />

declare module 'virtual:pwa-register' {
  export function registerSW(options?: {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
  }): (reloadPage?: boolean) => Promise<void>;
}

interface ImportMetaEnv {
  /** 生产站点根 URL（SEO canonical / og:url / sitemap） */
  readonly VITE_SITE_URL?: string;
  readonly VITE_MAPBOX_TOKEN?: string;
  /** 轨迹墙自定义 Mapbox 样式 ID，如 mapbox://styles/username/xxx 或 Studio 样式 URL */
  readonly VITE_MAPBOX_TRAIL_STYLE?: string;
  /** 百度地图浏览器端 AK（驾驶舱街景，高德街景已下线） */
  readonly VITE_BAIDU_MAP_AK?: string;
  /** Mapillary Access Token（连续序列街景）— https://www.mapillary.com/dashboard/developers */
  readonly VITE_MAPILLARY_ACCESS_TOKEN?: string;
  /** 高德 Web Key（中国版推荐，用于 JS 地图展示） */
  readonly VITE_AMAP_KEY?: string;
  /** 天地图 tk（蜗牛号底图优先；国界遵循中国标准地图） */
  readonly VITE_TIANDITU_TK?: string;
  /** 高德 Web 服务 Key（逆地理/地理编码 REST API；可与 JS Key 相同或单独创建） */
  readonly VITE_AMAP_WEB_SERVICE_KEY?: string;
  /** 高德 JS API 2.0 安全密钥 */
  readonly VITE_AMAP_SECURITY_CODE?: string;
  /** 腾讯位置服务 Key（逆地理，GEOCODE_PROVIDER=tencent 时） */
  readonly VITE_TENCENT_MAP_KEY?: string;
  /** 逆地理服务商：amap | tencent */
  readonly VITE_GEOCODE_PROVIDER?: string;
  /** 地图服务商：auto | amap | mapbox */
  readonly VITE_MAP_PROVIDER?: string;
  /** 首页轨迹墙高德底图样式，如 amap://styles/blue */
  readonly VITE_AMAP_TRAIL_STYLE?: string;
  /** 应用模式：production | online 上线（关闭 Mock）；development | demo 演示 */
  readonly VITE_APP_MODE?: string;
  /** 首页布局：holo 全息极简 | capsule 驾驶舱 | launch 推广版 | plan-a 原紧凑版 */
  readonly VITE_HOME_LAYOUT?: string;
  /** 站点语言：zh | en（国际站） */
  readonly VITE_LOCALE?: string;
  /** 开发演示地图：0 | false 关闭（默认 dev 开启） */
  readonly VITE_MAP_DEV_DEMO?: string;
  /** 首页粒子背景：0 | false 关闭（仅 CSS 渐变，更流畅） */
  readonly VITE_HOME_PARTICLES?: string;
  /** 构建市场：CN（默认，中国版）| GLOBAL */
  readonly VITE_MARKET?: string;
  /** 展示支付 UI（1 | true） */
  readonly VITE_PAYMENT_UI_ENABLED?: string;
  readonly VITE_PAYMENT_ALIPAY_ENABLED?: string;
  readonly VITE_PAYMENT_WECHAT_ENABLED?: string;
  readonly VITE_CONTENT_MODERATION_ENABLED?: string;
  readonly VITE_CONTENT_MODERATION_STRICT?: string;
  readonly VITE_CONTENT_MODERATION_DEMO_BLOCK?: string;
  /** 静态资源 CDN 根路径（构建时 Vite base） */
  readonly VITE_CDN_BASE?: string;
  /** 远程图片代理模板，支持 {url} */
  readonly VITE_IMAGE_CDN?: string;
  readonly VITE_USE_CHINA_CDN?: string;
  readonly VITE_ALLOW_FOREIGN_IMAGE_PROXY?: string;
  /** 分享效果统计（默认开启；0 关闭） */
  readonly VITE_SHARE_ANALYTICS_ENABLED?: string;
  /** 邀请好友奖励（须 VITE_OPEN_BUSINESS=1 且本开关=1） */
  readonly VITE_INVITE_ENABLED?: string;
  /** 商业扩展总开关 isOpenBusiness（1 开启插槽/分销/会员增量；默认关闭） */
  readonly VITE_OPEN_BUSINESS?: string;
  /** 后端 API 根路径；未配置则用 demo 数据 */
  readonly VITE_API_BASE_URL?: string;
  /** 开发/演示 Bearer（会打进前端，生产慎用） */
  readonly VITE_API_TOKEN?: string;
  readonly VITE_DEEPSEEK_API_KEY?: string;
  readonly VITE_DEEPSEEK_BASE_URL?: string;
  readonly VITE_DEEPSEEK_MODEL?: string;
  /** Sentry DSN — https://sentry.io 项目设置 */
  readonly VITE_SENTRY_DSN?: string;
  /** 1 | true 启用；0 关闭（即使配置了 DSN） */
  readonly VITE_SENTRY_ENABLED?: string;
  /** 开发环境也上报（调试用） */
  readonly VITE_SENTRY_DEBUG?: string;
  /** 如 production / staging */
  readonly VITE_SENTRY_ENVIRONMENT?: string;
  /** 发布版本，如 hello-roamly@1.2.0 */
  readonly VITE_SENTRY_RELEASE?: string;
  /** 性能追踪采样率 0–1，默认生产 0.1 */
  readonly VITE_SENTRY_TRACES_SAMPLE_RATE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
