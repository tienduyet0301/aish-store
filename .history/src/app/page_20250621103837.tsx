import { headers } from 'next/headers';
import BannerClientComponent from "@/components/BannerClientComponent";
import { getPlaiceholder } from "plaiceholder";
import { prisma } from '@/lib/prisma';

// Type definition for Banner to be used on the server
interface Banner {
  _id: string;
  imageUrl: string;
  title?: string;
  isMobile: boolean;
  blurDataURL?: string;
}

// This interface represents the raw banner object from Prisma
interface PrismaBanner {
  _id: { toString(): string };
  imageUrl: string;
  title: string | null;
  isMobile: boolean;
  isActive: boolean;
  order: number | null;
  link: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Fetch banners on the server
async function getBanners(isMobile: boolean): Promise<Banner[]> {
  try {
    const banners = await prisma.Banner.findMany({
      where: {
        isActive: true,
        isMobile: isMobile,
      },
      orderBy: {
        order: 'asc', 
      },
    });

    // Generate blurDataURL for each banner
    const bannersWithBlur = await Promise.all(
      banners.map(async (banner: PrismaBanner) => {
        try {
          const buffer = await fetch(banner.imageUrl).then(async (res) =>
            Buffer.from(await res.arrayBuffer())
          );
          const { base64 } = await getPlaiceholder(buffer);
          return {
            ...banner,
            _id: banner._id.toString(), // Ensure _id is a string
            blurDataURL: base64,
          };
        } catch (err) {
          console.error(`Failed to generate placeholder for ${banner.imageUrl}`, err);
          return {
            ...banner,
            _id: banner._id.toString(),
            blurDataURL: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", // Fallback
          };
        }
      })
    );

    return bannersWithBlur;
  } catch (error) {
    console.error('Error fetching banners:', error);
    return []; // Return empty array on error
  }
}

export default async function Home() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /Mobi|Android|iPhone/i.test(userAgent);
  
  const banners = await getBanners(isMobile);

  return <BannerClientComponent initialBanners={banners} />;
} 