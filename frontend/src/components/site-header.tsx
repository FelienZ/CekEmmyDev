import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SettingButton } from "./custom/setting-button";
import { HelpButton } from "./custom/help-button";

export function SiteHeader({ name }: { name: string }) {
  return (
    <header className="flex h-fit shrink-0 font-(family-name:--font-display) items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 p-2 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h--full"
        />
        <div className="flex flex-col">
          <h3 className="text-base font-medium font-(family-name:--font-sans)">
            Kedai
          </h3>
          <h1 className="text-xl font-bold tracking-tight">{name}</h1>
        </div>
        <div className="flex gap-3 items-center ml-auto justify-end">
          <HelpButton />
          <SettingButton />
        </div>
      </div>
    </header>
  );
}
