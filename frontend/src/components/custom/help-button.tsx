import { MessageCircleMore } from "lucide-react";
import { Button } from "../ui/button";

export function HelpButton() {
  return (
    <Button variant="outline" className="rounded-sm">
      <MessageCircleMore />
    </Button>
  );
}
