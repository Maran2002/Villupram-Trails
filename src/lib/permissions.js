export const SUPERADMIN_ID = '6a01cdc39618522cd98e7bbf';

export function hasPermission(user, module, action = 'view') {
  if (!user || user.role !== 'admin') return false;
  // .toString() handles both string (_id from frontend store) and ObjectId (from backend DB lookup)
  if (user._id?.toString() === SUPERADMIN_ID) return true;
  // profile and overview are accessible to all admins
  if (module === 'profile' || module === 'overview') return true;
  return !!user.permissions?.[module]?.[action];
}
