import { headers } from 'next/headers';
import BannerClientComponent from "@/components/BannerClientComponent";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from 'mongodb';

// This interface is now simpler as the client will handle logic
interface BannerData {
  _id: string;
  imageUrl: string;
  title?: string;
}

interface MongoBanner {
  _id: ObjectId;
  imageUrl: string;
  title?: string;
  isActive?: boolean;
}

// The server now only fetches all active banners.
// The client will determine which ones to display.
async function getBanners(): Promise<BannerData[]> {
  try {
    const client = await clientPromise;
    const db = client.db("aishh");
    
    const banners = await db.collection<MongoBanner>("banners").find({
      isActive: true,
      imageUrl: { $exists: true, $ne: "" } 
    }).sort({ order: 1 }).toArray();

    // Just convert _id to string and return
    return banners.map(banner => ({
      _id: banner._id.toString(),
      imageUrl: banner.imageUrl,
      title: banner.title,
    }));

  } catch (error) {
    console.error('Error fetching banners on server:', error);
    return []; // Return empty array on error
  }
}

export default async function Home() {
  const banners = await getBanners();
  return <BannerClientComponent initialBanners={banners} />;
} 