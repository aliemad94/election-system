export type Role = 'ADMIN' | 'KEY_USER' | 'OBSERVER';

export const canEdit = (role: Role) => role === 'ADMIN' || role === 'KEY_USER';
export const canDelete = (role: Role) => role === 'ADMIN';
export const canBulkAction = (role: Role) => role === 'ADMIN';
