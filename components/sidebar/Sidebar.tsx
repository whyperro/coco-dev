'use client'

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { useStore } from "@/hooks/useStore";
import { Menu } from "./Menu";
import { SidebarToggle } from "./SidebarToggle";
import { useSession } from "next-auth/react";

export function Sidebar() {
  const { data: session } = useSession();
  const sidebar = useStore(useSidebarToggle, (state) => state);

  if (!sidebar) return null;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        sidebar?.isOpen === false ? "w-[90px]" : "w-72"
      )}
    >
      <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />
      <div className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800">
        <Button
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1",
            sidebar?.isOpen === false ? "translate-x-1" : "translate-x-0"
          )}
          variant="link"
          asChild
        >
          <Link href={session?.user.user_role === 'ADMIN' || session?.user.user_role === 'AUDITOR' ? "/dashboard" : "/estadisticas"} className="flex items-center gap-2">
            <h1
              className={cn(
                "text-[#63c144] font-extrabold text-5xl mt-8 whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300 ",
                sidebar?.isOpen === false
                  ? "-translate-x-96 opacity-0 text-lg"
                  : "translate-x-0 opacity-100"
              )}
            >
              Berkana
            </h1>
          </Link>
        </Button>
        <Menu isOpen={sidebar?.isOpen} />
      </div>
    </aside>
  );
}
