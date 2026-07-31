import { Globe2 } from 'lucide-react';
import { copy } from '@/content/copy';
import MotionSection from '@/components/motion/MotionSection';
import { isChinaPrimaryMarket } from '@/lib/config/marketScope';
import {
  getAssetCdnBase,
  getImageCdnTemplate,
  hasAssetCdn,
  hasImageCdn,
  preferChinaCdn,
  resolvePublicAssetUrl,
} from '@/lib/cdn';

export default function AboutCdnSection() {
  if (!isChinaPrimaryMarket()) {
    return null;
  }

  const assetBase = getAssetCdnBase();
  const imageTemplate = getImageCdnTemplate();

  return (
    <MotionSection
      className="rounded-2xl border border-cyan-200/90 bg-gradient-to-br from-cyan-50/80 via-white to-white p-6 shadow-sm"
      delay={0.12}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600/10 text-cyan-700">
          <Globe2 className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{copy.about.cdnTitle}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{copy.about.cdnBadge}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600">{copy.about.cdnLead}</p>

      <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
        {copy.about.cdnBullets.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-cyan-600" aria-hidden>
              ·
            </span>
            {item}
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-2 rounded-xl border border-cyan-100 bg-white/90 p-4 text-xs">
        <div>
          <dt className="font-semibold text-slate-800">静态资源 CDN（VITE_CDN_BASE）</dt>
          <dd className="mt-1 break-all font-mono text-[10px] text-slate-600">
            {assetBase ?? '未配置（使用站点同源 /assets）'}
          </dd>
          <dd className="mt-0.5 text-slate-500">
            {hasAssetCdn() ? '构建时写入 Vite base，JS/CSS 从 CDN 加载' : '可在 OSS/COS 部署 dist 后填写'}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-800">图片加速（VITE_IMAGE_CDN）</dt>
          <dd className="mt-1 break-all font-mono text-[10px] text-slate-600">
            {imageTemplate ?? '未配置（直连 Unsplash 等境外源）'}
          </dd>
          <dd className="mt-0.5 text-slate-500">
            {hasImageCdn()
              ? '封面与 OptimizedImage 经 resolveRemoteImageUrl 代理'
              : '建议配置阿里云 CDN / 腾讯云 CI / 七牛图片处理'}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-800">示例 public 路径</dt>
          <dd className="mt-1 break-all font-mono text-[10px] text-slate-600">
            {resolvePublicAssetUrl('/favicon.svg')}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-800">中国版 CDN 策略</dt>
          <dd className="mt-0.5 text-slate-500">
            {preferChinaCdn() ? '已启用（默认关闭境外 wsrv.nl 演示代理）' : '已关闭 VITE_USE_CHINA_CDN'}
          </dd>
        </div>
      </dl>
    </MotionSection>
  );
}
