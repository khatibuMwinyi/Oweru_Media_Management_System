import PostForm from "../../components/PostForm";

const Investment = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Investment
          </h1>
          <p className="text-sm text-gray-600">
            Create content for investment opportunities and financial products.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <PostForm postType="Static" category="investment" />
          <PostForm postType="Carousel" category="investment" />
          <PostForm postType="Reel" category="investment" />
        </section>
      </div>
    </div>
  );
};

export default Investment;
