"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";

import {
  deleteHarvestAlbumPhotoAction,
  listHarvestAlbumPhotosAction,
} from "@/app/actions/admin/harvest-album";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { HarvestAlbumPhoto } from "@/types/album-photo";

export function HarvestAlbumDialog({
  open,
  harvestId,
  harvestName,
  onOpenChange,
}: {
  open: boolean;
  harvestId: string | null;
  harvestName: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [photos, setPhotos] = useState<HarvestAlbumPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open || !harvestId) return;

    let cancelled = false;
    setError(null);

    void listHarvestAlbumPhotosAction(harvestId).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setError(result.message);
        setPhotos([]);
        return;
      }
      setPhotos(result.photos);
    });

    return () => {
      cancelled = true;
    };
  }, [open, harvestId]);

  function handleDelete(photoId: string) {
    if (!harvestId) return;
    setError(null);

    start(async () => {
      const result = await deleteHarvestAlbumPhotoAction({
        harvestId,
        photoId,
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setPhotos((current) => current.filter((photo) => photo.id !== photoId));
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl" showCloseButton>
        <DialogHeader>
          <DialogTitle>Community album</DialogTitle>
          <DialogDescription>
            {harvestName ? (
              <>
                Photos shared for{" "}
                <span className="font-medium text-foreground">{harvestName}</span>.
                Remove anything that shouldn&apos;t be public.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {photos.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            No photos shared yet for this harvest.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-xl border bg-muted/20"
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src={photo.imageUrl}
                    alt={photo.caption ?? `Photo by ${photo.authorName}`}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
                <div className="space-y-2 p-3">
                  <div className="space-y-0.5">
                    <p className="truncate text-xs font-medium">
                      {photo.authorName}
                    </p>
                    {photo.caption ? (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {photo.caption}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-9 w-full"
                    disabled={pending}
                    onClick={() => handleDelete(photo.id)}
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            className="h-12"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
