export const SYSTEM_OWNER_USERNAME = 'Shaheen123';

export const SYSTEM_OWNER_SESSION_ID = 0;

export const USR_GROUP_DENY_USER_MGMT_ID = 9;

export function isSystemOwnerUsername(userName: string | null | undefined): boolean {
  return (userName ?? '').trim().toLowerCase() === SYSTEM_OWNER_USERNAME.toLowerCase();
}

export function isSystemOwnerSession(
  session: { userName?: string | null; isSystemOwner?: boolean } | null | undefined,
): boolean {
  if (!session) {
    return false;
  }
  return session.isSystemOwner === true || isSystemOwnerUsername(session.userName);
}
