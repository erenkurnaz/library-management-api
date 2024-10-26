import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, USE_HIERARCHY_KEY } from '../../api/decorators';
import { UserRole } from '../../database/user';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly roleHierarchy = [UserRole.USER, UserRole.ADMIN] as const;

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    const useHierarchy = this.reflector.getAllAndOverride<boolean>(
      USE_HIERARCHY_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!useHierarchy) return requiredRoles.includes(user.role);

    return requiredRoles.some(
      (role) =>
        this.roleHierarchy.indexOf(user.role) >=
        this.roleHierarchy.indexOf(role),
    );
  }
}
