export function ExperienceAnalytics() {
  const configuredId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || "111757927";
  const metrikaId = configuredId && /^\d+$/.test(configuredId) ? Number(configuredId) : null;

  return (
    <script
      id="rpm-experience-analytics"
      dangerouslySetInnerHTML={{
        __html: `(function () {
        if (window.__rpmAnalyticsReady) return;
        window.__rpmAnalyticsReady = true;
        window.dataLayer = window.dataLayer || [];
        document.documentElement.dataset.rpmAnalyticsReady = "true";
        var metrikaId = ${JSON.stringify(metrikaId)};
        var lastPath = "";

        function emit(event, label) {
          var detail = {
            event: event,
            label: label || undefined,
            path: window.location.pathname,
            timestamp: Date.now()
          };
          window.dispatchEvent(new CustomEvent("rpm:analytics", { detail: detail }));
          window.dataLayer.push(detail);
          document.documentElement.dataset.rpmLastEvent = event;
          if (metrikaId && typeof window.ym === "function") {
            window.ym(metrikaId, "reachGoal", event, label ? { label: label } : undefined);
          }
        }

        function emitFromTarget(target) {
          var element = target instanceof Element ? target.closest("[data-event]") : null;
          if (element) emit(element.dataset.event || "interaction", element.dataset.eventLabel);
        }

        window.addEventListener("rpm:analytics-track", function (event) {
          var detail = event && event.detail;
          if (detail && detail.event) emit(detail.event, detail.label);
        });

        function emitPathOpen() {
          var path = window.location.pathname;
          if (path === lastPath) return;
          lastPath = path;
          if (path === "/cars") emit("catalog_open");
          if (path === "/booking") emit("booking_open");
        }

        document.addEventListener("click", function (event) { emitFromTarget(event.target); }, true);
        document.addEventListener("change", function (event) { emitFromTarget(event.target); }, true);
        document.addEventListener("submit", function (event) { emitFromTarget(event.target); }, true);
        window.addEventListener("popstate", emitPathOpen);
        new MutationObserver(emitPathOpen).observe(document.documentElement, { childList: true, subtree: true });
        emitPathOpen();
      })();`
      }}
    />
  );
}
