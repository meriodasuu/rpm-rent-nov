"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";
import { VkPixel } from "./vk-pixel";

const consentKey = "rpm-cookie-consent";
type Consent = "accepted" | "declined" | null;

export function Analytics() {
  const configuredId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || "111757927";
  const id = configuredId && /^\d+$/.test(configuredId) ? configuredId : null;
  const consent = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("rpm:cookie-consent", onChange);
      return () => window.removeEventListener("rpm:cookie-consent", onChange);
    },
    () => {
      const stored = window.localStorage.getItem(consentKey);
      return stored === "accepted" || stored === "declined" ? stored : null;
    },
    () => null
  ) as Consent;

  const choose = (value: Exclude<Consent, null>) => {
    window.localStorage.setItem(consentKey, value);
    window.dispatchEvent(new Event("rpm:cookie-consent"));
  };

  return (
    <>
      {consent === "accepted" ? <VkPixel /> : null}
      {id && consent === "accepted" ? <Script id="yandex-metrika" strategy="afterInteractive">
        {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${id},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`}
      </Script> : null}
      {consent === null ? <aside className="cookie-consent" aria-label="Настройки cookie">
        <div><strong>Настройки конфиденциальности</strong><p>Сайт использует обязательные технические данные. Яндекс Метрику и пиксель VK Рекламы включим только с вашего согласия.</p></div>
        <div className="cookie-consent-actions"><button className="button ghost" type="button" onClick={() => choose("declined")}>Только необходимые</button><button className="button red" type="button" onClick={() => choose("accepted")}>Разрешить аналитику</button><a className="text-link" href="/cookies">Подробнее</a></div>
      </aside> : null}
    </>
  );
}
