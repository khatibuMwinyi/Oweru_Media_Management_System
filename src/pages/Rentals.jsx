import PostForm from "../components/PostForm";

const Rentals = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-10">
      <h1 className="max-w-2xl mx-auto text-left text-2xl font-bold mb-6">
        Rentals - Create Social Media Posts
      </h1>

      {/* Static Post Section */}
      <section>
        <PostForm postType="Static" category="rentals" />
      </section>

      {/* Carousel Post Section */}
      <section>
        <PostForm postType="Carousel" category="rentals" />
      </section>

      {/* Reel Post Section */}
      <section>
        <PostForm postType="Reel" category="rentals" />
      </section>
    </div>
  );
};

export default Rentals;
