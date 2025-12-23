import PostForm from "../../components/PostForm";

const LandsAndPlots = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Lands &amp; Plots
          </h1>
          <p className="text-sm text-gray-600">
            Create engaging posts to promote land and plot opportunities.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <PostForm postType="Static" category="lands_and_plots" />
          <PostForm postType="Carousel" category="lands_and_plots" />
          <PostForm postType="Reel" category="lands_and_plots" />
        </section>
      </div>
    </div>
  );
};

export default LandsAndPlots;
