import { Users } from 'lucide-react';
import DiscoverGridSection from '@/components/features/discover/DiscoverGridSection';
import DiscoverPopularUserCard from '@/components/features/discover/DiscoverPopularUserCard';
import DiscoverSectionEmptyHint from '@/components/features/discover/DiscoverSectionEmptyHint';
import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';
import type { DiscoverRecommendedUser } from '@/hooks/discover/useDiscoverGridModel';

type DiscoverUsersSectionProps = {
  users: DiscoverRecommendedUser[];
  sortHint?: string;
};

export default function DiscoverUsersSection({ users, sortHint }: DiscoverUsersSectionProps) {
  return (
    <DiscoverGridSection
      id="discover-grid-users"
      title={SNAIL_GLOBAL_COPY.hotMembers}
      subtitle="同频蜗友 · 按人气与旅行 DNA 推荐"      icon={Users}
      count={users.length}
      sortHint={sortHint}
    >
      {users.length === 0 ? (
        <DiscoverSectionEmptyHint message={SNAIL_GLOBAL_COPY.emptyState} />      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {users.map((user) => (
            <li key={user.id}>
              <DiscoverPopularUserCard
                user={user}
                recommendScore={user.recommendScore}
                recommendReasons={user.recommendReasons}
              />
            </li>
          ))}
        </ul>
      )}
    </DiscoverGridSection>
  );
}
