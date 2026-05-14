"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import type { DraftHarvestRow } from "@/types/draft-harvest";
import { deleteDraftHarvest, updateDraftHarvestStatus } from "@/app/actions/harvest-admin";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PendingStatusChange = {
  recordId: string;
  name: string;
  from: string;
  to: string;
};

export function DraftHarvestsTable({ rows }: { rows: DraftHarvestRow[] }) {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<PendingStatusChange | null>(null);

  const valueForSelect = useMemo(() => {
    return (status: string | null) => (status && status.trim() ? status.trim() : "Draft");
  }, []);

  return (
    <div className="space-y-3">
      <Dialog
        open={pendingStatus !== null}
        onOpenChange={(open) => {
          if (!open) setPendingStatus(null);
        }}
      >
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change harvest status?</DialogTitle>
            <DialogDescription>
              {pendingStatus ? (
                <>
                  <span className="font-medium text-foreground">{pendingStatus.name}</span> will move
                  from <span className="font-medium text-foreground">{pendingStatus.from}</span> to{" "}
                  <span className="font-medium text-foreground">{pendingStatus.to}</span>. Only continue if
                  this is intentional.
                </>
              ) : (
                "\u00a0"
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t-0 bg-transparent p-0 pt-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingStatus(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending || !pendingStatus}
              onClick={() => {
                if (!pendingStatus) return;
                const change = pendingStatus;
                setPendingStatus(null);
                setActionError(null);
                start(async () => {
                  const res = await updateDraftHarvestStatus({
                    recordId: change.recordId,
                    status: change.to,
                  });
                  if (!res.ok) {
                    setActionError(res.message);
                    return;
                  }
                  router.refresh();
                });
              }}
            >
              {isPending ? "Updating…" : "Yes, change status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {actionError ? (
        <Alert variant="destructive">
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="w-full overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[220px]">Harvest</TableHead>
              <TableHead className="min-w-[120px]">Start Date</TableHead>
              <TableHead className="min-w-[180px]">Last Modified</TableHead>
              <TableHead className="min-w-[220px]">Status</TableHead>
              <TableHead className="w-[72px] text-right"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">{r.startDate ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">{r.lastModified ?? "—"}</TableCell>
                <TableCell>
                  <Select
                    value={valueForSelect(r.status)}
                    disabled={isPending}
                    onValueChange={(next) => {
                      const current = valueForSelect(r.status);
                      if (next === current) return;
                      setActionError(null);
                      setPendingStatus({
                        recordId: r.id,
                        name: r.name,
                        from: current,
                        to: next,
                      });
                    }}
                  >
                    <SelectTrigger className="h-12 w-full min-w-[200px] sm:w-[240px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Publish">Publish</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-12 w-12"
                        aria-label={`Open actions for ${r.name}`}
                        disabled={isPending}
                      >
                        <MoreHorizontal className="size-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem asChild className="h-11 text-base">
                        <Link href={`/publish/${r.id}`}>Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="h-11 text-base text-destructive focus:text-destructive"
                        onSelect={() => {
                          setActionError(null);
                          const ok = window.confirm(`Delete this draft harvest?\n\n“${r.name}”`);
                          if (!ok) return;
                          start(async () => {
                            const res = await deleteDraftHarvest({ recordId: r.id });
                            if (!res.ok) {
                              setActionError(res.message);
                              return;
                            }
                            router.refresh();
                          });
                        }}
                        disabled={isPending}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
