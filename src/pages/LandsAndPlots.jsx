import PostForm from "../components/PostForm";

const LandsAndPlots = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-10">
      <h1 className="max-w-2xl mx-auto text-left text-2xl font-bold mb-6">
        Lands and Plots - Create Social Media Posts
      </h1>

      <PostForm postType="Static" category="lands_and_plots" />
      <PostForm postType="Carousel" category="lands_and_plots" />
      <PostForm postType="Reel" category="lands_and_plots" />
    </div>
  );
};

export default LandsAndPlots;
