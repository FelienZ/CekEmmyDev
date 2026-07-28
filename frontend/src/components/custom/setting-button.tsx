"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Home, LogOut, Menu, User } from "lucide-react";
import { ThemeToggler } from "../theme-toggler";

export function SettingButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-sm bg-sidebar-accent text-white"
        >
          <Menu className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={18}
        className="w-48 bg-sidebar text-background dark:text-white"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>App Menu</DropdownMenuLabel>
          <DropdownMenuItem>
            <Home /> Homepage
          </DropdownMenuItem>
          <ThemeToggler />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <LogOut /> Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
