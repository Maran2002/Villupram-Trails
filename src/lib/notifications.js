export const NOTIFICATION_TITLE_LIMIT = 120
export const NOTIFICATION_DESCRIPTION_LIMIT = 2000
export const NOTIFICATION_BADGE_LIMIT = 32

export function normalizeNotificationInput(body, availableRoles) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { value: null, error: 'Notification data is required' }
  }

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const badge = typeof body.badge === 'string' ? body.badge.trim() : ''
  const audienceRoles = Array.isArray(body.audienceRoles)
    ? [...new Set(body.audienceRoles.filter((role) => typeof role === 'string'))]
    : []

  if (!title || title.length > NOTIFICATION_TITLE_LIMIT) {
    return { value: null, error: `Title must be between 1 and ${NOTIFICATION_TITLE_LIMIT} characters` }
  }
  if (!description || description.length > NOTIFICATION_DESCRIPTION_LIMIT) {
    return { value: null, error: `Description must be between 1 and ${NOTIFICATION_DESCRIPTION_LIMIT} characters` }
  }
  if (badge.length > NOTIFICATION_BADGE_LIMIT) {
    return { value: null, error: `Badge must be ${NOTIFICATION_BADGE_LIMIT} characters or fewer` }
  }
  if (!audienceRoles.length || audienceRoles.some((role) => !availableRoles.includes(role))) {
    return { value: null, error: 'Select at least one valid audience role' }
  }

  return {
    value: { title, description, badge: badge || null, audienceRoles },
    error: null,
  }
}

export async function getAvailableNotificationRoles(db) {
  const roles = await db.collection('users').distinct('role')
  return [...new Set(roles.filter((role) => typeof role === 'string' && role.trim()).map((role) => role.trim()))]
    .sort((a, b) => a.localeCompare(b))
}

export function serializeNotification(notification) {
  return {
    id: notification._id.toString(),
    title: notification.title,
    description: notification.description,
    badge: notification.badge || null,
    audienceRoles: Array.isArray(notification.audienceRoles) ? notification.audienceRoles : [],
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt || notification.createdAt,
  }
}
