/**
 * 商业扩展层公共出口
 * 免费基座不得 import 本目录以外的商业实现细节。
 */

export {
  getIsOpenBusiness,
  isBusinessModuleEnabled,
  isOpenBusiness,
  type BusinessModuleId,
} from '@/lib/business/businessConfig';

export {
  canAccessMemberOnlyContent,
  hasBusinessPayload,
  hasFullFreeBaseAccess,
  hasMemberAddonAccess,
  resolveActivityTag,
  resolveDistributeLink,
  resolvePaidGuideId,
  resolveUserAccessLane,
  shouldRenderBusinessSlot,
  type BusinessUserContext,
  type UserAccessLane,
} from '@/lib/business/businessAccess';
