"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { apiUrl } from "@/lib/api";

interface SiteStatus {
  enabled: boolean;
  message: string;
}

export default function MaintenanceGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [status, setStatus] = useState<SiteStatus | null>(null);
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(apiUrl("/site/status"), { cache: "no-store" });
        if (!res.ok) return;
        const data: SiteStatus = await res.json();
        if (!cancelled) setStatus(data);
      } catch {
        if (!cancelled) setStatus({ enabled: false, message: "" });
      }
    };

    void load();
    const timer = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  if (status?.enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3] px-6 py-16">
        <div className="max-w-lg w-full bg-white border border-black/20 p-10 text-center text-black">
          <p className="text14 uppercase tracking-widest text-gray-500 mb-4">
            VogueWay
          </p>
          <h1 className="h32 mb-4">Технические работы</h1>
          <p className="text16 text-gray-600 leading-relaxed">
            {status.message}
          </p>
          <p className="text14 text-gray-400 mt-8">
            Страница обновится автоматически, когда сайт снова откроется.
          </p>
        </div>
      </div>
    );
  }

  if (status === null) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text20 text-gray-500">
        Загрузка…
      </div>
    );
  }

  return <>{children}</>;
}
