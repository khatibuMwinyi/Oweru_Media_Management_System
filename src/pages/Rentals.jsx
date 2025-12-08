import PostForm from "../components/PostForm";

const Rentals = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-10">
      <h1 className="max-w-2xl mx-auto text-left text-2xl font-bold mb-6">
        Rentals - Create Social Media Posts
      </h1>

      {/* Static Post Section */}
      <section>
        <PostForm postType="Static" />
      </section>

      {/* Carousel Post Section */}
      <section>
        <PostForm postType="Carousel" />
      </section>

      {/* Reel Post Section */}
      <section>
        <PostForm postType="Reel" />
      </section>
    </div>
  );
};

export default Rentals;
