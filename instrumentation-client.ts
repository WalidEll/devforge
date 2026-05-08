import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://2be914fbca19a89194fe6ffa9b5ac225@o4511038357700608.ingest.de.sentry.io/4511351005249616",

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Set tracePropagationTargets to control which URLs distributed tracing is enabled for
  tracePropagationTargets: ["localhost", /^https:\/\/devforge\.tools\//],

  enableLogs: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
