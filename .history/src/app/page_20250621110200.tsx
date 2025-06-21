import { headers } from 'next/headers';
import BannerClientComponent from "@/components/BannerClientComponent";
import { getPlaiceholder } from "plaiceholder";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from 'mongodb';

// Type definition for Banner to be used on the server
interface Banner {
  _id: string;
  imageUrl: string;
  title?: string;
  isMobile: boolean;
  blurDataURL?: string;
}

// This interface represents the raw banner object from MongoDB
interface MongoBanner {
  _id: ObjectId;
  imageUrl: string;
  mobileImageUrl?: string;
  title?: string;
  link?: string;
  order?: number;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Fetch banners on the server
async function getBanners(isMobile: boolean): Promise<Banner[]> {
  try {
    const client = await clientPromise;
    const db = client.db("aishh");
    
    // Base query
    const query = { isActive: true };
    
    const banners = await db.collection<MongoBanner>("banners").find(query).sort({ order: 1 }).toArray();

    // Filter banners that have a valid image URL for the specific device
    const relevantBanners = banners.filter(banner => {
      const imageUrl = isMobile ? banner.mobileImageUrl : banner.imageUrl;
      return imageUrl && imageUrl.trim() !== '';
    });

    // Generate blurDataURL for each banner
    const bannersWithBlur = await Promise.all(
      relevantBanners.map(async (banner) => {
        // Use mobile image if available on mobile, otherwise fallback to main image
        const finalImageUrl = (isMobile && banner.mobileImageUrl) ? banner.mobileImageUrl : banner.imageUrl;

        try {
          const buffer = await fetch(finalImageUrl).then(async (res) =>
            Buffer.from(await res.arrayBuffer())
          );
          const { base64 } = await getPlaiceholder(buffer);
          return {
            _id: banner._id.toString(),
            title: banner.title,
            imageUrl: finalImageUrl,
            isMobile: isMobile,
            blurDataURL: base64,
          };
        } catch (err) {
          console.error(`Failed to generate placeholder for ${finalImageUrl}`, err);
          return {
            _id: banner._id.toString(),
            title: banner.title,
            imageUrl: finalImageUrl,
            isMobile: isMobile,
            blurDataURL: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
          };
        }
      })
    );
    // Add a type assertion here
    return bannersWithBlur as Banner[];
  } catch (error) {
    console.error('Error fetching banners:', error);
    return []; // Return empty array on error
  }
}

export default async function Home() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  // Simple regex to detect mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  const banners = await getBanners(isMobile);

  return <BannerClientComponent initialBanners={banners} />;
} 