export const SUPERADMIN_ID = process.env.SUPERADMIN_ID || ''

export const ADMIN_MODULES = Object.freeze([
  'places', 'reviews', 'users', 'audit', 'reports', 'settings',
  'contributors', 'logs', 'approvals', 'support', 'newsletter', 'notifications', 'search',
])

export const PERMISSION_ACTIONS = Object.freeze(['view', 'add', 'edit', 'delete'])

export function isSuperAdmin(user) {
  if (user?.role !== 'admin') return false

  // The server keeps the configured ID private. Browser UI uses the boolean
  // included in the authenticated user response instead of exposing that ID.
  if (typeof window !== 'undefined') return user.isSuperAdmin === true
  return Boolean(SUPERADMIN_ID) && user._id?.toString() === SUPERADMIN_ID
}

export function sanitizePermissions(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { permissions: null, error: 'permissions must be an object' }
  }

  const permissions = {}
  for (const [module, actions] of Object.entries(input)) {
    if (!ADMIN_MODULES.includes(module)) {
      return { permissions: null, error: `Unknown permission module: ${module}` }
    }
    if (!actions || typeof actions !== 'object' || Array.isArray(actions)) {
      return { permissions: null, error: `Permissions for ${module} must be an object` }
    }
    for (const [action, enabled] of Object.entries(actions)) {
      if (!PERMISSION_ACTIONS.includes(action) || typeof enabled !== 'boolean') {
        return { permissions: null, error: `Invalid permission ${module}.${action}` }
      }
      permissions[module] ||= {}
      permissions[module][action] = enabled
    }
  }

  return { permissions, error: null }
}

export function hasPermission(user, module, action = 'view') {
  if (!user || user.role !== 'admin') return false;
  // .toString() handles both string (_id from frontend store) and ObjectId (from backend DB lookup)
  if (isSuperAdmin(user)) return true;
  // profile and overview are accessible to all admins
  if (module === 'profile' || module === 'overview') return true;
  return !!user.permissions?.[module]?.[action];
}
