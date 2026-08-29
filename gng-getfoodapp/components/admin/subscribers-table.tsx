"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Search, X } from "lucide-react";

import { adminUpdateSubscriberAction } from "@/app/actions/admin/subscriber";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Subscriber, SubscriptionStatus } from "@/types/subscriber";

const STATUS_OPTIONS: SubscriptionStatus[] = [
  "Active",
  "Staff",
  "Inactive",
  "Deposit only",
  "Subscription only",
];

const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  Active:
    "bg-[color-mix(in_oklab,var(--brand-green),white_80%)] text-[color-mix(in_oklab,var(--brand-green),black_40%)]",
  Staff:
    "bg-[color-mix(in_oklab,var(--brand-yellow),white_55%)] text-[var(--brand-brown)]",
  Inactive: "bg-muted text-muted-foreground",
  "Deposit only": "bg-orange-100 text-orange-800",
  "Subscription only": "bg-blue-100 text-blue-800",
};

type EditState = {
  subscriber: Subscriber;
  email: string;
  status: SubscriptionStatus;
};

export function SubscribersTable({
  initialRows,
}: {
  initialRows: Subscriber[];
}) {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [edit, setEdit] = useState<EditState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = rows.filter((r) => {
    const q = query.toLowerCase();
    if (!q) return true;
    return (
      r.fullName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.subscriptionStatus.toLowerCase().includes(q)
    );
  });

  function openEdit(sub: Subscriber) {
    setError(null);
    setEdit({
      subscriber: sub,
      email: sub.email,
      status: sub.subscriptionStatus,
    });
  }

  function handleSave() {
    if (!edit) return;
    setError(null);

    start(async () => {
      const res = await adminUpdateSubscriberAction({
        subscriberId: edit.subscriber.id,
        email: edit.email !== edit.subscriber.email ? edit.email : undefined,
        subscriptionStatus:
          edit.status !== edit.subscriber.subscriptionStatus
            ? edit.status
            : undefined,
      });

      if (!res.ok) {
        setError(res.message);
        return;
      }

      if (res.subscriber) {
        setRows((prev) =>
          prev.map((r) =>
            r.id === res.subscriber!.id ? res.subscriber! : r
          )
        );
      }
      setEdit(null);
      router.refresh();
    });
  }

  const statusCounts = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.subscriptionStatus] = (acc[r.subscriptionStatus] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* summary pills */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.filter((s) => statusCounts[s]).map((s) => (
          <span
            key={s}
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[s]}`}
          >
            {s}: {statusCounts[s]}
          </span>
        ))}
        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          Total: {rows.length}
        </span>
      </div>

      {/* search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-10 pl-9 pr-9"
          placeholder="Search neighbor name, email, or status…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {/* table */}
      <div className="w-full overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[60px] text-right">Edit</TableHead>
              <TableHead className="min-w-[180px]">Name</TableHead>
              <TableHead className="min-w-[150px]">Status</TableHead>
              <TableHead className="min-w-[220px]">Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  {query ? "No neighbors match that search." : "No neighbors found."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      aria-label={`Edit ${sub.fullName}`}
                      onClick={() => openEdit(sub)}
                      className="inline-flex size-8 items-center justify-center rounded-full hover:bg-muted"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  </TableCell>
                  <TableCell className="font-medium">{sub.fullName}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[sub.subscriptionStatus]}`}
                    >
                      {sub.subscriptionStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {sub.email || "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* edit dialog */}
      <Dialog
        open={edit !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEdit(null);
            setError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit neighbor</DialogTitle>
            <DialogDescription>
              {edit?.subscriber.fullName}
            </DialogDescription>
          </DialogHeader>

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Couldn&apos;t save</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="sub-email">Email</Label>
              <Input
                id="sub-email"
                type="email"
                inputMode="email"
                autoComplete="off"
                className="h-11"
                value={edit?.email ?? ""}
                onChange={(e) =>
                  setEdit((prev) =>
                    prev ? { ...prev, email: e.target.value } : prev
                  )
                }
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sub-status">Status</Label>
              <Select
                value={edit?.status ?? "Active"}
                onValueChange={(v) =>
                  setEdit((prev) =>
                    prev
                      ? { ...prev, status: v as SubscriptionStatus }
                      : prev
                  )
                }
                disabled={isPending}
              >
                <SelectTrigger id="sub-status" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setEdit(null);
                setError(null);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
