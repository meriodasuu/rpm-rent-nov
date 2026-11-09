"use client";

import Script from "next/script";
import { useRef } from "react";

declare global {
  interface Window {
    myReviews?: { BlockWidget: new (options: { uuid: string; name: string; additionalFrame: string; lang: string; widgetId: string }) => { init: () => void } };
  }
}

export function MyReviewsWidget() {
  const initialized = useRef(false);
  const initialize = () => {
    if (initialized.current || !window.myReviews?.BlockWidget) return;
    initialized.current = true;
    new window.myReviews.BlockWidget({ uuid: "15de83ca-ce7c-4863-91a1-e56483fe99a4", name: "g92456431", additionalFrame: "none", lang: "ru", widgetId: "2" }).init();
  };

  return <><div className="myreviews-widget-frame"><iframe title="Отзывы клиентов RPM Rent" id="myReviews__block-widget" /></div><Script id="myreviews-block-widget" src="https://myreviews.dev/widget/dist/blockWidget.js" strategy="afterInteractive" onReady={initialize} /></>;
}
