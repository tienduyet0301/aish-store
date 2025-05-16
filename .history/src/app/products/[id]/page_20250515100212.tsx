export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  return {
    title: `${product.name} | AISH`,
    description: product.description,
  };
} 