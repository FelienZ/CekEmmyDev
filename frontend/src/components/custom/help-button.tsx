import { MessageCircleMore } from "lucide-react";
import { Button } from "../ui/button";

export function HelpButton() {
  return (
    <Button
      variant="outline"
      className="rounded-sm bg-sidebar-accent text-white"
    >
      <MessageCircleMore />
    </Button>
  );
}
