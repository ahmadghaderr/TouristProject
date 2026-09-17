interface SafariNavigator extends Navigator {
  standalone?: boolean;
}

// A literal iPhone/iPad/iPod check. Deliberately does NOT try to also catch an
// iPad requesting the desktop site (which reports a Mac-style user agent) -
// that "desktop-mode" case is excluded on purpose rather than guessed at.
export const isIosDevice = (): boolean => /iPhone|iPad|iPod/.test(window.navigator.userAgent);

export const isStandalonePwa = (): boolean =>
  (window.navigator as SafariNavigator).standalone === true ||
  window.matchMedia("(display-mode: standalone)").matches;

// True when the visitor is on iOS but hasn't added the site to the Home Screen yet -
// on iOS, the push permission prompt silently fails outside of standalone (installed) mode.
export const needsIosInstallInstructions = (): boolean => isIosDevice() && !isStandalonePwa();
