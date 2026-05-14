export type Permission = string;

export const PERMISSIONS = {
  ALERT_CREATE: 'ALERT_CREATE',
  ALERT_UPDATE: 'ALERT_UPDATE',
  ALERT_DELETE: 'ALERT_DELETE',
  USER_MANAGE: 'USER_MANAGE',
  SYSTEM_CONFIG: 'SYSTEM_CONFIG',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
