/** 注册用户唯一标识 */
export type UserId = string;

/** 游客会话标识（未登录设备 / 匿名会话） */
export type GuestSessionId = string;

/** 任意可关联到用户行为的主体 ID */
export type UserSubjectId = UserId | GuestSessionId;
