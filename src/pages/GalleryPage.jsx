import { GalleryGridBlock } from "@/components/ui/gallery-grid-block-shadcnui";
import ThreeDGalleryMemories from "@/components/ThreeDGalleryMemories";

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-background">
      <GalleryGridBlock />
      <ThreeDGalleryMemories />
    </div>
  );
}
