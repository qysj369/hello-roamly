import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import MotionPage, { MotionBlock } from '@/components/motion/MotionPage';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { useJsonLd } from '@/hooks/browser/useJsonLd';
import { inspirePageSeo } from '@/lib/seo';
import { buildTravelKnowledgeJsonLd } from '@/lib/seo/jsonLd/travelKnowledgeJsonLd';
import {
  TRAVEL_KNOWLEDGE_PILLARS,
  listCityWeekendKnowledgeArticles,
} from '@/lib/seo/travelKnowledgeBase';
import { paths } from '@/router/paths';
import '@/styles/holo-home.css';
import '@/styles/holo-inner.css';

/**
 * 可抓取旅行知识库：周末漫游 / 单人短途 / 亲子出游 + 城市长尾。
 * 不改首页 IA，仅供搜索引擎与大模型收录。
 */
export default function TravelInspirePage() {
  usePageSeo(inspirePageSeo());
  const knowledgeLd = useMemo(() => buildTravelKnowledgeJsonLd(), []);
  useJsonLd('travel-knowledge-inspire', knowledgeLd);
  const cityArticles = listCityWeekendKnowledgeArticles();

  return (
    <MotionPage className="holo-cities-page">
      <MotionBlock>
        <h1 className="holo-cities-page__title">慢行灵感知识库</h1>
        <p className="holo-cities-page__desc">
          面向城市周末漫游、单人短途旅行灵感、亲子出游思路的结构化参考。仅作游玩灵感，不组团、不代订。
        </p>
      </MotionBlock>

      {TRAVEL_KNOWLEDGE_PILLARS.map((article) => (
        <MotionBlock key={article.id}>
          <article id={article.id} className="holo-inspire-article">
            <h2 className="holo-inspire-article__title">{article.title}</h2>
            <p className="holo-inspire-article__kicker">{article.longTail}</p>
            <p className="holo-inspire-article__summary">{article.summary}</p>
            {article.body.map((paragraph) => (
              <p key={paragraph} className="holo-inspire-article__body">
                {paragraph}
              </p>
            ))}
          </article>
        </MotionBlock>
      ))}

      <MotionBlock>
        <h2 className="holo-inspire-article__title">热门城市周末漫游</h2>
        <p className="holo-cities-page__desc">每座城市一篇短文，方便搜索「XX城市周末漫游」长尾收录。</p>
        <div className="holo-inspire-city-list">
          {cityArticles.map((article) => (
            <article key={article.id} id={article.id} className="holo-inspire-article">
              <h3 className="holo-inspire-article__city">{article.title}</h3>
              <p className="holo-inspire-article__summary">{article.summary}</p>
              {article.body.map((paragraph) => (
                <p key={paragraph} className="holo-inspire-article__body">
                  {paragraph}
                </p>
              ))}
            </article>
          ))}
        </div>
      </MotionBlock>

      <MotionBlock>
        <p className="holo-cities-page__desc">
          想按出发地生成自己的路线，可去
          <Link to={paths.ai} className="holo-inspire-article__link">
            AI 旅行顾问
          </Link>
          或
          <Link to={paths.mp} className="holo-inspire-article__link">
            公众号行程工具
          </Link>
          。
        </p>
      </MotionBlock>
    </MotionPage>
  );
}
