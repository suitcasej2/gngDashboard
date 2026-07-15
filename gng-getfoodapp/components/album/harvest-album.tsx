"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Images } from "lucide-react";

import { uploadHarvestAlbumPhotoAction } from "@/app/actions/album";
import { MAX_ALBUM_PHOTOS_PER_SUBSCRIBER } from "@/lib/harvest-album";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMessageTime } from "@/lib/format";
import type { HarvestAlbumPhoto } from "@/types/album-photo";
import { X } from "lucide-react";

export function HarvestAlbum({
  harvestId,
  harvestName,
  initialPhotos,
  currentSubscriberId,
}: {
  harvestId: string;
  harvestName: string;
  initialPhotos: HarvestAlbumPhoto[];
  currentSubscriberId: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [error, setError] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [selected, setSelected] = useState<HarvestAlbumPhoto | null>(null);
  const [isPending, startTransition] = useTransition();

  const myPhotoCount = photos.filter(
    (photo) => photo.subscriberId === currentSubscriberId
  ).length;
  const canUpload = myPhotoCount < MAX_ALBUM_PHOTOS_PER_SUBSCRIBER;

  function handlePickClick() {
    setError(null);
    inputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    startTransition(async () => {
      const result = await uploadHarvestAlbumPhotoAction({
        harvestId,
        file,
        caption,
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setPhotos((current) => [result.photo, ...current]);
      setCaption("");
      setError(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Share moments from this harvest — box pickups, garden visits, and
          what you made with your share.
        </p>
        {canUpload ? (
          <p className="text-xs text-muted-foreground">
            You can add {MAX_ALBUM_PHOTOS_PER_SUBSCRIBER - myPhotoCount} more
            photo
            {MAX_ALBUM_PHOTOS_PER_SUBSCRIBER - myPhotoCount === 1 ? "" : "s"}.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            You&apos;ve shared the maximum number of photos for this harvest.
          </p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {canUpload && (
        <div className="space-y-3 rounded-2xl border bg-muted/20 p-4">
          <div className="space-y-2">
            <Label htmlFor="album-caption">Caption (optional)</Label>
            <Input
              id="album-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What made this moment special?"
              disabled={isPending}
              maxLength={200}
            />
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            className="h-12 w-full rounded-full"
            disabled={isPending}
            onClick={handlePickClick}
          >
            <Camera className="size-4" />
            {isPending ? "Uploading…" : "Add a photo"}
          </Button>
        </div>
      )}

      {photos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
          <Images className="size-8 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium">No photos yet</p>
            <p className="text-sm text-muted-foreground">
              Be the first to share a moment from {harvestName}.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              className="group overflow-hidden rounded-2xl border bg-background text-left shadow-sm ring-1 ring-foreground/5 transition hover:ring-foreground/15"
              onClick={() => setSelected(photo)}
            >
              <div className="relative aspect-square w-full bg-muted/30">
                <Image
                  src={photo.imageUrl}
                  alt={photo.caption ?? `Photo by ${photo.authorName}`}
                  fill
                  className="object-cover transition group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </div>
              <div className="space-y-0.5 px-3 py-2">
                <p className="truncate text-xs font-medium">{photo.authorName}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatMessageTime(photo.createdAt)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo by ${selected.authorName}`}
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2 text-white"
              onClick={() => setSelected(null)}
              aria-label="Close photo"
            >
              <X className="size-4" />
            </button>
            <div className="relative aspect-[4/5] w-full bg-muted/30 sm:aspect-square">
              <Image
                src={selected.imageUrl}
                alt={selected.caption ?? `Photo by ${selected.authorName}`}
                fill
                className="object-contain"
                sizes="(max-width: 512px) 100vw, 512px"
              />
            </div>
            <div className="space-y-1 px-4 py-4">
              <p className="text-sm font-medium">{selected.authorName}</p>
              {selected.caption && (
                <p className="text-sm text-muted-foreground">
                  {selected.caption}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatMessageTime(selected.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
