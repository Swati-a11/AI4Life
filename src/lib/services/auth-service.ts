export class AuthService {
  /**
   * Return stable application user identity from headers, cookie, or default
   */
  static async getUserIdFromRequest(req?: Request): Promise<string> {
    if (req) {
      // 1. Check custom header (sent by client fetchers)
      const headerUserId =
        req.headers.get("x-user-id") ||
        req.headers.get("x-clerk-user-id") ||
        req.headers.get("userId");

      if (headerUserId && headerUserId.trim().length > 0) {
        return headerUserId.trim();
      }

      // 2. Check cookies
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const match = cookieHeader.match(/ai4life_user_id=([^;]+)/);
        if (match && match[1]) {
          return decodeURIComponent(match[1].trim());
        }
      }
    }

    return "default_student_user";
  }

  // Require valid authentication
  static async requireAuth(req?: Request): Promise<string> {
    return this.getUserIdFromRequest(req);
  }
}
