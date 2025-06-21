import { headers } from 'next/headers';
import BannerClientComponent from "@/components/BannerClientComponent";
import { getPlaiceholder } from "plaiceholder";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from 'mongodb';

interface Banner {
  _id: string;
  imageUrl: string;
  title?: string;
  isMobile: boolean;
  blurDataURL?: string;
}

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

// Represents the banner after _id is converted to a string
interface ProcessedBanner extends Omit<MongoBanner, '_id'> {
  _id: string;
}

async function getBanners(): Promise<ProcessedBanner[]> {
    const client = await clientPromise;
    const db = client.db("aishh");
    const banners = await db.collection<MongoBanner>("banners").find({ isActive: true }).sort({ order: 1 }).toArray();
    return banners.map(banner => ({...banner, _id: banner._id.toString()}));
}


export default async function Home() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  const allBanners = await getBanners();

  // Determine which banners to show and process them
  const relevantBanners = allBanners.filter(banner => {
    const hasMobileImage = banner.mobileImageUrl && banner.mobileImageUrl.trim() !== '';
    const hasDesktopImage = banner.imageUrl && banner.imageUrl.trim() !== '';
    return (isMobile && hasMobileImage) || (!isMobile && hasDesktopImage);
  });

  const bannersWithBlur = await Promise.all(
    relevantBanners.map(async (banner) => {
      const finalImageUrl = (isMobile && banner.mobileImageUrl) ? banner.mobileImageUrl : banner.imageUrl;
      try {
        const buffer = await fetch(finalImageUrl).then(async (res) =>
          Buffer.from(await res.arrayBuffer())
        );
        const { base64 } = await getPlaiceholder(buffer);
        return {
          ...banner,
          imageUrl: finalImageUrl,
          isMobile,
          blurDataURL: base64,
        };
      } catch (err) {
        console.error(`Failed to generate placeholder for ${finalImageUrl}`, err);
        return {
          ...banner,
          imageUrl: finalImageUrl,
          isMobile,
          blurDataURL: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        };
      }
    })
  );

  return <BannerClientComponent initialBanners={bannersWithBlur as Banner[]} />;
} 