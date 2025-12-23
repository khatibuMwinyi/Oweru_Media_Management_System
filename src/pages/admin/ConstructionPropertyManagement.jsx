import PostForm from "../../components/PostForm";

const ConstructionPropertyManagement = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Construction &amp; Property Management
          </h1>
          <p className="text-sm text-gray-600">
            Create professional posts for construction projects and property management services.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <PostForm postType="Static" category="construction_property_management" />
          <PostForm postType="Carousel" category="construction_property_management" />
          <PostForm postType="Reel" category="construction_property_management" />
        </section>
      </div>
    </div>
  );
};

export default ConstructionPropertyManagement;
