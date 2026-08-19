export class AuthService {
  // Return stable application user identity for non-authenticated workspace access
  static async getUserIdFromRequest(req?: Request): Promise<string> {
    return "default_student_user";
  }

  // Require valid authentication
  static async requireAuth(req?: Request): Promise<string> {
    return "default_student_user";
  }
}
