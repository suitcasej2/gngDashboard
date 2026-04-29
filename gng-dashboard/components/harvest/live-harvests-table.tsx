"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import type { DraftHarvestRow } from "@/types/draft-harvest";
import { updateLiveHarvestFields, updateLiveHarvestStatus } from "@/app/actions/harvest-admin";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LiveHarvestsTable({ rows }: { rows: DraftHarvestRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [active, setActive] = useState<DraftHarvestRow | null>(null);
  const [draftUrgent, setDraftUrgent] = useState("");
  const [draftSend, setDraftSend] = useState(false);
  const [draftStatus, setDraftStatus] = useState<"Completed" | "Sent">("Completed");

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusActive, setStatusActive] = useState<DraftHarvestRow | null>(null);

  function openDialog(row: DraftHarvestRow) {
    setActionError(null);
    setActive(row);
    setDraftUrgent(row.urgentUpdate ?? "");
    setDraftSend(row.sendUpdateNow === true);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setActive(null);
  }

  function openStatusDialog(row: DraftHarvestRow) {
    setActionError(null);
    setStatusActive(row);
    setDraftStatus(row.status === "Sent" ? "Sent" : "Completed");
    setStatusDialogOpen(true);
  }

  function closeStatusDialog() {
    setStatusDialogOpen(false);
    setStatusActive(null);
  }

  return (
    <div className="space-y-3">
      {actionError ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn’t save to Airtable</AlertTitle>
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
              <TableHead className="min-w-[160px]">Status</TableHead>
              <TableHead className="w-[72px] text-right"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} className="align-middle">
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">{r.startDate ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">{r.lastModified ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {r.status?.trim() ? r.status : "—"}
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
                        disabled={pending}
                      >
                        <MoreHorizontal className="size-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem
                        className="h-11 text-base"
                        onSelect={() => {
                          // Let the menu close before opening a modal (avoids focus/overlay glitches)
                          window.setTimeout(() => openDialog(r), 0);
                        }}
                      >
                        Send Urgent Message
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="h-11 text-base"
                        onSelect={() => {
                          window.setTimeout(() => openStatusDialog(r), 0);
                        }}
                      >
                        Change Status
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="sm:max-w-lg" showCloseButton>
          <DialogHeader>
            <DialogTitle>Send Urgent Message</DialogTitle>
            <DialogDescription>
              {active ? (
                <>
                  Update messaging for <span className="font-medium text-foreground">{active.name}</span>.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="urgent-update">Urgent Update</Label>
              <Textarea
                id="urgent-update"
                value={draftUrgent}
                onChange={(e) => setDraftUrgent(e.target.value)}
                rows={6}
                className="min-h-40 resize-y text-base"
                disabled={pending}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/20 px-3 py-3">
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium">Send Update Now</p>
                <p className="text-xs text-muted-foreground">Airtable checkbox: Send Update Now</p>
              </div>
              <Switch
                checked={draftSend}
                onCheckedChange={setDraftSend}
                disabled={pending}
                aria-label="Send update now"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" className="h-12" disabled={pending} onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              className="h-12 px-6"
              disabled={pending || !active}
              onClick={() => {
                if (!active) return;
                setActionError(null);
                start(async () => {
                  const res = await updateLiveHarvestFields({
                    recordId: active.id,
                    urgentUpdate: draftUrgent,
                    sendUpdateNow: draftSend,
                  });
                  if (!res.ok) {
                    setActionError(res.message);
                    return;
                  }
                  closeDialog();
                  router.refresh();
                });
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={statusDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeStatusDialog();
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>
              {statusActive ? (
                <>
                  Update status for <span className="font-medium text-foreground">{statusActive.name}</span>.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={draftStatus} onValueChange={(v) => setDraftStatus(v as any)} disabled={pending}>
              <SelectTrigger className="h-12 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" className="h-12" disabled={pending} onClick={closeStatusDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              className="h-12 px-6"
              disabled={pending || !statusActive}
              onClick={() => {
                if (!statusActive) return;
                setActionError(null);
                start(async () => {
                  const res = await updateLiveHarvestStatus({
                    recordId: statusActive.id,
                    status: draftStatus,
                  });
                  if (!res.ok) {
                    setActionError(res.message);
                    return;
                  }
                  closeStatusDialog();
                  router.refresh();
                });
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
