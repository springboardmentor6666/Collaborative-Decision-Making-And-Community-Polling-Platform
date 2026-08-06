import React from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface MobileMenuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function MobileMenu({ open, setOpen }: MobileMenuProps) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="p-0 w-72">
        <VisuallyHidden.Root>
            <SheetTitle>Navigation Menu</SheetTitle>
        </VisuallyHidden.Root>
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}
