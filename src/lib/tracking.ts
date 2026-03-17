// Centralized tracking utilities for Meta Pixel and Google Ads

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export const trackLead = (source: string) => {
  window.fbq?.("track", "Lead", { content_name: source });
  window.gtag?.("event", "conversion", { send_to: "AW-672956729", event_category: "lead", event_label: source });
};

export const trackRegistration = (source: string) => {
  window.fbq?.("track", "CompleteRegistration", { content_name: source });
  window.gtag?.("event", "sign_up", { method: "google", event_label: source });
};

export const trackInitiateCheckout = (source: string) => {
  window.fbq?.("track", "InitiateCheckout", { content_name: source });
  window.gtag?.("event", "begin_checkout", { event_label: source });
};

// Google Ads "UT | Form submit" conversion — fires once per session
let comparisonConversionFired = false;
export const trackComparisonFormSubmit = () => {
  if (comparisonConversionFired) return;
  comparisonConversionFired = true;
  window.gtag?.("event", "conversion", {
    send_to: "AW-672956729/oUskCLKy_aUaELmC8sAC",
  });
};

// Google Ads — WhatsApp click conversion
export const trackWhatsAppClick = () => {
  window.gtag?.("event", "conversion", {
    send_to: "AW-672956729/EtdBCNXFh9ECELmC8sAC",
  });
};

// Google Ads — any form submit conversion
export const trackFormSubmitConversion = () => {
  window.gtag?.("event", "conversion", {
    send_to: "AW-672956729/oUskCLKy_aUaELmC8sAC",
  });
};
