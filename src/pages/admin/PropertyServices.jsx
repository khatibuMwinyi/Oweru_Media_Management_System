import PostForm from "../../components/PostForm";

const PropertyServices = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Land & property administration services
          </h1>
          <p className="text-sm text-gray-600">
            Build content for property consultancy, maintenance, and related services.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <PostForm postType="Static" category="property_services" />
          <PostForm postType="Carousel" category="property_services" />
          <PostForm postType="Reel" category="property_services" />
        </section>
      </div>
    </div>
  );
};

export default PropertyServices;
