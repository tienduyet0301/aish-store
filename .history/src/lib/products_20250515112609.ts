import clientPromise from "./mongodb";

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";

export async function getProduct(slug: string) {
  try {
    const client = await clientPromise;
    const db = client.db("aishh");

    const product = await db
      .collection("products")
      .findOne({ slug: slug });

    if (!product) {
      throw new Error("Product not found");
    }

    return {
      ...product,
      _id: product._id.toString(),
      images: product.images?.map((url: string) => 
        url.startsWith('http') ? url : `${DOMAIN}${url}`
      ) || []
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
} 