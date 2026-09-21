import { getOccasions, getWardrobe } from "../../../sanity/queries/wardrobe";
import { urlForImage } from "../../../sanity/lib/image";

// Read-only JSON feed of the wardrobe. The site renders from Sanity directly;
// this exists so the mobile app can consume the same data without a Sanity SDK.
export default async function handler(_req, res) {
  try {
    const [items, occasions] = await Promise.all([
      getWardrobe(),
      getOccasions(),
    ]);

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300"
    );
    res.status(200).json({
      occasions,
      items: items.map(({ image, ...item }) => ({
        ...item,
        // A couple of sizes so the app can pick without re-deriving CDN URLs.
        image: {
          thumb: urlForImage(image).width(400).url(),
          full: urlForImage(image).width(1200).url(),
        },
      })),
    });
  } catch (error) {
    console.error("Failed to load wardrobe", error);
    res.status(500).json({ error: "Failed to load wardrobe" });
  }
}
