// ============================================
// GOCus — Interface: JWT Payload
// ============================================

export interface JwtPayload {
  sub: string;       // userId
  email: string;
  roleId: string;
  companyId: string;
  branchId?: string;
}
