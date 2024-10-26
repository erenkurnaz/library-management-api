import { applyDecorators, SetMetadata } from '@nestjs/common';
import { UserRole } from '../../database/user';

export const ROLES_KEY = 'roles';
export const USE_HIERARCHY_KEY = 'useHierarchy';
export const Roles = (roles: UserRole[], useHierarchy = false) => {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    SetMetadata(USE_HIERARCHY_KEY, useHierarchy),
  );
};
