import { APP_NAME } from '@/lib/config/brand';
import { DEFAULT_OG_IMAGE_URL, resolveSiteOrigin } from '@/lib/seo/config';
import { travelPlanDetailPath, userProfilePath } from '@/router/paths';
import type { TravelPlan, TravelPlanActivity, TravelPlanDay } from '@/types/domain/travelPlan';
import { isEnrichedTravelPlan } from '@/types/domain/travelPlan';

type JsonLdObject = Record<string, unknown>;

function buildActivityItem(activity: TravelPlanActivity, position: number): JsonLdObject {
  const item: JsonLdObject = {
    '@type': 'TouristAttraction',
    name: activity.description,
  };

  if (activity.location) {
    item.address = {
      '@type': 'PostalAddress',
      addressLocality: activity.location,
    };
  }

  if (activity.coordinates) {
    item.geo = {
      '@type': 'GeoCoordinates',
      latitude: activity.coordinates.latitude,
      longitude: activity.coordinates.longitude,
    };
  }

  return {
    '@type': 'ListItem',
    position,
    item,
  };
}

function buildDayItem(day: TravelPlanDay): JsonLdObject {
  return {
    '@type': 'ListItem',
    position: day.day,
    item: {
      '@type': 'Trip',
      name: day.title,
      itinerary: {
        '@type': 'ItemList',
        numberOfItems: day.activities.length,
        itemListElement: day.activities.map((activity, index) =>
          buildActivityItem(activity, index + 1),
        ),
      },
    },
  };
}

/** 为旅行计划详情页生成 schema.org TouristTrip JSON-LD */
export function buildTravelPlanJsonLd(
  plan: TravelPlan,
  planId: string,
): JsonLdObject {
  const origin = resolveSiteOrigin();
  const pageUrl = `${origin}${travelPlanDetailPath(planId)}`;
  const enriched = isEnrichedTravelPlan(plan) ? plan : null;

  const jsonLd: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    '@id': `${pageUrl}#trip`,
    name: plan.title,
    description: plan.summary,
    url: pageUrl,
    inLanguage: 'zh-CN',
    keywords: plan.tags.join(', '),
    provider: {
      '@type': 'Organization',
      name: APP_NAME,
      url: origin,
    },
    offers: {
      '@type': 'Offer',
      price: plan.totalCost,
      priceCurrency: 'CNY',
      availability: 'https://schema.org/InStock',
      url: pageUrl,
    },
    itinerary: {
      '@type': 'ItemList',
      numberOfItems: plan.dailyPlans.length,
      itemListElement: plan.dailyPlans.map((day) => buildDayItem(day)),
    },
  };

  if (enriched?.presentation.destination) {
    jsonLd.touristDestination = {
      '@type': 'Place',
      name: enriched.presentation.destination,
    };
  }

  if (plan.suitableAudience) {
    jsonLd.audience = {
      '@type': 'Audience',
      audienceType: plan.suitableAudience,
    };
  }

  const image = enriched?.presentation.coverImageUrl ?? DEFAULT_OG_IMAGE_URL;
  jsonLd.image = image;

  if (enriched?.presentation.generatedAt) {
    jsonLd.datePublished = enriched.presentation.generatedAt;
    jsonLd.dateModified = enriched.presentation.generatedAt;
  }

  if (enriched?.presentation.creator) {
    const { creator } = enriched.presentation;
    jsonLd.author = {
      '@type': 'Person',
      name: creator.nickname,
      url: `${origin}${userProfilePath(creator.id)}`,
      ...(creator.avatarUrl ? { image: creator.avatarUrl } : {}),
    };
  }

  if (enriched?.presentation.stats?.likeCount !== undefined) {
    jsonLd.interactionStatistic = {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/LikeAction',
      userInteractionCount: enriched.presentation.stats.likeCount,
    };
  }

  return jsonLd;
}
