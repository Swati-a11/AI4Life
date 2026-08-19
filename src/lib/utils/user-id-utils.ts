export function getOrCreateLocalUserId(): string {
  if (typeof window === "undefined") return "anonymous_student_user";

  let userId = localStorage.getItem("ai4life_user_id");
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("ai4life_user_id", userId);
  }

  // Ensure cookie is synced for server API requests
  try {
    document.cookie = `ai4life_user_id=${userId}; path=/; max-age=31536000; SameSite=Lax`;
  } catch (e) {
    // Cookie fallback
  }

  return userId;
}
