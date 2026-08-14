export function getGoogleAvatarUrl(user) {
  return user?.providerData?.find(provider => provider.providerId === 'google.com' && provider.photoURL)?.photoURL || '';
}

export function getDefaultAvatarUrl(user) {
  return user?.photoURL || getGoogleAvatarUrl(user) || '';
}

export function getUserInitial(user) {
  return (user?.displayName || user?.email || 'U').charAt(0).toUpperCase();
}
