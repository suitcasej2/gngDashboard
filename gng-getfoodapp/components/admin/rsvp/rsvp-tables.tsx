import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShareCsvButton } from "@/components/admin/rsvp/shareable-table";
import type { AllRsvpRow, DeliveryRow, GiftRecipientRow, NonResponderRow } from "@/lib/rsvp-tables";

export function NeedsDeliveryTable({ rows }: { rows: DeliveryRow[] }) {
  const shareRows = rows.map((r) => ({
    Name: r.name,
    Email: r.email,
    "Shipping Address": r.shippingAddress,
    "Harvest Name": r.harvestName,
  }));

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Share this list with your delivery team.
        </p>
        <ShareCsvButton
          filename="needs-delivery.csv"
          columns={["Name", "Email", "Shipping Address", "Harvest Name"]}
          rows={shareRows}
        />
      </div>

      <div className="w-full overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">Name</TableHead>
              <TableHead className="min-w-[220px]">Email</TableHead>
              <TableHead className="min-w-[260px]">Shipping Address</TableHead>
              <TableHead className="min-w-[200px]">Harvest Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{r.email ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{r.shippingAddress ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{r.harvestName ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function GiftRecipientsTable({ rows }: { rows: GiftRecipientRow[] }) {
  const shareRows = rows.map((r) => ({
    Name: r.name,
    Email: r.email,
    "Gift Recipient Name": r.giftRecipientName,
    "Harvest Name": r.harvestName,
  }));

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Share this list with your team (gift recipients).
        </p>
        <ShareCsvButton
          filename="gift-recipients.csv"
          columns={["Name", "Email", "Gift Recipient Name", "Harvest Name"]}
          rows={shareRows}
        />
      </div>

      <div className="w-full overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">Name</TableHead>
              <TableHead className="min-w-[220px]">Email</TableHead>
              <TableHead className="min-w-[220px]">Gift Recipient Name</TableHead>
              <TableHead className="min-w-[200px]">Harvest Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{r.email ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{r.giftRecipientName ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{r.harvestName ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function NonRespondersTable({ rows }: { rows: NonResponderRow[] }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[180px]">Name</TableHead>
            <TableHead className="min-w-[220px]">Email</TableHead>
            <TableHead className="min-w-[200px]">Harvest Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{r.email ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{r.harvestName ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function AllRsvpsTable({ rows }: { rows: AllRsvpRow[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          All RSVPs for harvests with linked Status ={" "}
          <span className="font-medium text-foreground">Publish</span>,{" "}
          <span className="font-medium text-foreground">Published</span>, or{" "}
          <span className="font-medium text-foreground">Sent</span>.
        </p>
        <p className="text-sm text-muted-foreground tabular-nums">{rows.length}</p>
      </div>

      <div className="w-full overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[220px]">Name</TableHead>
              <TableHead className="min-w-[260px]">Email</TableHead>
              <TableHead className="min-w-[160px]">Choice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{r.email ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{r.choice ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

