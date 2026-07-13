"use client";

import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { plural } from "@/lib/utils";
import { FilterControls, type FilterControlsProps } from "./FilterControls";

export function FilterDrawer({
  open,
  onClose,
  onClearAll,
  resultCount,
  ...controls
}: FilterControlsProps & {
  open: boolean;
  onClose: () => void;
  onClearAll: () => void;
  resultCount: number;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="left"
      title="Filtry"
      widthClassName="max-w-sm"
      footer={
        // one red CTA; clearing is a quiet text action, not a competing button
        <div className="flex items-center gap-4 p-4">
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex min-h-11 shrink-0 items-center px-1 text-xs uppercase tracking-widest text-nf-dim transition-colors duration-250 ease-nf hover:text-white"
          >
            Wyczyść wszystko
          </button>
          <Button variant="primary" className="min-h-11 flex-1" onClick={onClose}>
            Pokaż {resultCount} {plural(resultCount, "wynik", "wyniki", "wyników")}
          </Button>
        </div>
      }
    >
      <div className="px-5 pb-2">
        <FilterControls {...controls} />
      </div>
    </Drawer>
  );
}
