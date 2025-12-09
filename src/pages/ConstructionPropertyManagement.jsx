import PostForm from "../components/PostForm";

const ConstructionPropertyManagement = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-10">
      <h1 className="max-w-2xl mx-auto text-left text-2xl font-bold mb-6">
        Construction & Property Management - Create Social Media Posts
      </h1>

      <PostForm postType="Static" category="construction_property_management" />
      <PostForm postType="Carousel" category="construction_property_management" />
      <PostForm postType="Reel" category="construction_property_management" />
    </div>
  );
};

export default ConstructionPropertyManagement;
