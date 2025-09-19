import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}

export function urlIsActive(urlToCheck, currentUrl) {
  return toUrl(urlToCheck) === currentUrl;
}

export function toUrl(href) {
  return typeof href === 'string' ? href : href && href.url;
}

export function valueUpdater(updaterOrValue, targetRef) {
  if (typeof updaterOrValue === "function") {
    targetRef.value = updaterOrValue(targetRef.value);
  } else {
    targetRef.value = updaterOrValue;
  }
}
