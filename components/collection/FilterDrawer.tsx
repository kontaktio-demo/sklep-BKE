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
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" className="min-h-11 flex-1" onClick={onClearAll}>
            Wyczyść wszystko
          </Button>
          <Button variant="primary" className="min-h-11 flex-1" onClick={onClose}>
            Pokaż {resultCount} {plural(resultCount, "wynik", "wyniki", "wyników")}
          </Button>
        </div>
      }
    >
      <div className="px-5">
        <FilterControls {...controls} />
      </div>
    </Drawer>
  );
}
