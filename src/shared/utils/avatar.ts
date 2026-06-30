import { CONFIG } from '../../config';

/**
 * Returns a fully-qualified URL for a user's profile picture or uploaded avatar.
 * Handles:
 *  - Google Profile URLs (starts with http/https)
 *  - Uploaded relative paths from Node backend (converts windows slashes and prefixes API host)
 * @param profilePicture The raw profile picture value stored in DB.
 */
export const getAvatarUri = (profilePicture: string | null | undefined): string | null => {
  if (!profilePicture || typeof profilePicture !== 'string' || profilePicture.trim().length === 0) {
    return null;
  }

  const trimmed = profilePicture.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Convert windows relative paths backslashes to web URL forward slashes
  const cleanPath = trimmed.replace(/\\/g, '/');
  
  // Clean up initial slashes to prevent double slashes
  const pathWithoutLeadingSlash = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;

  // Retrieve base backend URL by stripping /api/v1 from API_URL (e.g. http://localhost:8080)
  const baseUrl = CONFIG.API_URL.replace('/api/v1', '');
  
  return `${baseUrl}/${pathWithoutLeadingSlash}`;
};

export default getAvatarUri;
