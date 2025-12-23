import PostForm from "../../components/PostForm";

const PropertySales = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Property Sales
          </h1>
          <p className="text-sm text-gray-600">
            Create high quality social media posts for property sales across different formats.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <PostForm postType="Static" category="property_sales" />
          <PostForm postType="Carousel" category="property_sales" />
          <PostForm postType="Reel" category="property_sales" />
        </section>
      </div>
    </div>
  );
};

export default PropertySales;
