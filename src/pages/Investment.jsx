import PostForm from "../components/PostForm";

const Investment = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-10">
      <h1 className="max-w-2xl mx-auto text-left text-2xl font-bold mb-6">
        Investment - Create Social Media Posts
      </h1>

      <PostForm postType="Static" category="investment" />
      <PostForm postType="Carousel" category="investment" />
      <PostForm postType="Reel" category="investment" />
    </div>
  );
};

export default Investment;
