// Sistema de Control de Acceso Basado en Roles (RBAC)

export const ROLES = {
  GUEST: 'guest',
  USER: 'user',
  PSYCHOLOGIST: 'psychologist',
  ADMIN: 'admin'
};

export const PERMISSIONS = {
  // Permisos de Chat
  VIEW_CHAT: 'view_chat',
  
  // Permisos de Historia
  VIEW_OWN_HISTORY: 'view_own_history',
  VIEW_ALL_HISTORY: 'view_all_history',
  
  // Permisos de Dashboard
  VIEW_DASHBOARD: 'view_dashboard',
  
  // Permisos de Admin
  VIEW_ADMIN_PANEL: 'view_admin_panel',
  MANAGE_ROLES: 'manage_roles',
  MANAGE_USERS: 'manage_users',
  
  // Permisos de Sistema
  VIEW_SYSTEM_STATUS: 'view_system_status',
  MANAGE_LEXICON: 'manage_lexicon',
  UPLOAD_DOCUMENTS: 'upload_documents',
  
  // Permisos de Reportes
  VIEW_REPORTS: 'view_reports',
  VIEW_PSYCHOLOGIST_REPORTS: 'view_psychologist_reports'
};

// Definir permisos por rol
export const ROLE_PERMISSIONS = {
  [ROLES.GUEST]: [
    PERMISSIONS.VIEW_CHAT
  ],
  [ROLES.USER]: [
    PERMISSIONS.VIEW_CHAT,
    PERMISSIONS.VIEW_OWN_HISTORY
  ],
  [ROLES.PSYCHOLOGIST]: [
    PERMISSIONS.VIEW_CHAT,
    PERMISSIONS.VIEW_PSYCHOLOGIST_REPORTS
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_CHAT,
    PERMISSIONS.VIEW_OWN_HISTORY,
    PERMISSIONS.VIEW_ALL_HISTORY,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ADMIN_PANEL,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_SYSTEM_STATUS,
    PERMISSIONS.MANAGE_LEXICON,
    PERMISSIONS.UPLOAD_DOCUMENTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_PSYCHOLOGIST_REPORTS
  ]
};

// Verificar si un rol tiene un permiso específico
export const hasPermission = (role, permission) => {
  if (!role) {
    role = ROLES.GUEST;
  }
  
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[ROLES.GUEST];
  return permissions.includes(permission);
};

// Verificar si un rol tiene alguno de los permisos especificados
export const hasAnyPermission = (role, permissions) => {
  return permissions.some(permission => hasPermission(role, permission));
};

// Verificar si un rol tiene todos los permisos especificados
export const hasAllPermissions = (role, permissions) => {
  return permissions.every(permission => hasPermission(role, permission));
};

// Obtener todos los permisos de un rol
export const getRolePermissions = (role) => {
  if (!role) {
    return ROLE_PERMISSIONS[ROLES.GUEST];
  }
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[ROLES.GUEST];
};

// Definir las rutas de navegación permitidas por rol
export const NAVIGATION_ITEMS = {
  [ROLES.GUEST]: [
    { path: '/chat', label: 'Chat', permission: PERMISSIONS.VIEW_CHAT }
  ],
  [ROLES.USER]: [
    { path: '/chat', label: 'Chat', permission: PERMISSIONS.VIEW_CHAT },
    { path: '/history', label: 'Historia', permission: PERMISSIONS.VIEW_OWN_HISTORY }
  ],
  [ROLES.PSYCHOLOGIST]: [
    { path: '/chat', label: 'Chat', permission: PERMISSIONS.VIEW_CHAT },
    { path: '/psychologist-reports', label: 'Reportes', permission: PERMISSIONS.VIEW_PSYCHOLOGIST_REPORTS }
  ],
  [ROLES.ADMIN]: [
    { path: '/chat', label: 'Chat', permission: PERMISSIONS.VIEW_CHAT },
    { path: '/history', label: 'Historia', permission: PERMISSIONS.VIEW_OWN_HISTORY },
    { path: '/dashboard', label: 'Dashboard', permission: PERMISSIONS.VIEW_DASHBOARD },
    { path: '/admin', label: 'Admin', permission: PERMISSIONS.VIEW_ADMIN_PANEL },
    { path: '/admin/roles', label: 'Gestión de Roles', permission: PERMISSIONS.MANAGE_ROLES },
    { path: '/status', label: 'Estado', permission: PERMISSIONS.VIEW_SYSTEM_STATUS }
  ]
};

// Obtener items de navegación permitidos para un rol
export const getNavigationItems = (role) => {
  if (!role) {
    return NAVIGATION_ITEMS[ROLES.GUEST];
  }
  return NAVIGATION_ITEMS[role] || NAVIGATION_ITEMS[ROLES.GUEST];
};