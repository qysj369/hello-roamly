import { Link } from 'react-router-dom';
import { SNAIL_COMMUNITY } from '@/lib/config/snailCommunity';
import { paths } from '@/router/paths';

/** 首页底部 — 蜗牛黑话手册入口 */
export default function HomeSnailCultureStrip() {
  return (
    <p className="border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
      不懂黑话？
      <Link
        to={paths.snailCulture}
        className="ml-1 font-medium text-emerald-700 underline-offset-2 hover:underline"
      >
        查看{SNAIL_COMMUNITY.glossaryTitle}
      </Link>
      <span className="mx-2 text-slate-300">·</span>
      我们是{SNAIL_COMMUNITY.memberTerm}，慢爬就好
    </p>
  );
}
