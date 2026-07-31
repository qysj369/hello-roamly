import { BookOpen, Compass, MessageCircle, Search, User, Users } from 'lucide-react';
import { paths } from '@/router/paths';

type PrimaryNavIconProps = {
  to: string;
  className?: string;
};

/** 主导航图标（底栏与桌面顶栏共用） */
export default function PrimaryNavIcon({ to, className = 'h-5 w-5' }: PrimaryNavIconProps) {
  if (to === paths.home) {
    return <Compass className={className} aria-hidden />;
  }
  if (to === paths.discover) {
    return <Search className={className} aria-hidden />;
  }
  if (to === paths.guides) {
    return <BookOpen className={className} aria-hidden />;
  }
  if (to === paths.travelBuddies) {
    return <Users className={className} aria-hidden />;
  }
  if (to === paths.messages) {
    return <MessageCircle className={className} aria-hidden />;
  }
  return <User className={className} aria-hidden />;
}
