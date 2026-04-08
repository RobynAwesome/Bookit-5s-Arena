export const WELCOME_POPUP_STORAGE_KEY = "5sa_hide_welcome_popup";
export const NEWSLETTER_POPUP_DISMISSED_KEY = "5s_newsletter_dismissed_forever";
export const NEWSLETTER_POPUP_SUBSCRIBED_KEY = "5s_newsletter_subscribed";

function getStorage(storage) {
  if (storage) {
    return storage;
  }

  if (typeof window !== "undefined") {
    return window.localStorage;
  }

  return null;
}

export function readPopupPreferenceState(storage) {
  const target = getStorage(storage);

  if (!target) {
    return {
      welcomeEnabled: true,
      newsletterEnabled: true,
    };
  }

  return {
    welcomeEnabled: !target.getItem(WELCOME_POPUP_STORAGE_KEY),
    newsletterEnabled:
      !target.getItem(NEWSLETTER_POPUP_DISMISSED_KEY) &&
      !target.getItem(NEWSLETTER_POPUP_SUBSCRIBED_KEY),
  };
}

export function setWelcomePopupEnabled(enabled, storage) {
  const target = getStorage(storage);
  if (!target) {
    return;
  }

  if (enabled) {
    target.removeItem(WELCOME_POPUP_STORAGE_KEY);
    return;
  }

  target.setItem(WELCOME_POPUP_STORAGE_KEY, "1");
}

export function setNewsletterPopupEnabled(enabled, storage) {
  const target = getStorage(storage);
  if (!target) {
    return;
  }

  if (enabled) {
    target.removeItem(NEWSLETTER_POPUP_DISMISSED_KEY);
    target.removeItem(NEWSLETTER_POPUP_SUBSCRIBED_KEY);
    return;
  }

  target.setItem(NEWSLETTER_POPUP_DISMISSED_KEY, "true");
}
