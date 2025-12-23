import PostForm from "../../components/PostForm";

const Rentals = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Rentals
          </h1>
          <p className="text-sm text-gray-600">
            Design social media posts for rental properties in static, carousel, and reel formats.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <PostForm postType="Static" category="rentals" />
          <PostForm postType="Carousel" category="rentals" />
          <PostForm postType="Reel" category="rentals" />
        </section>
      </div>
    </div>
  );
};

export default Rentals;
