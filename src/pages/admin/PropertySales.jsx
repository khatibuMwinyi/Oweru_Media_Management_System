import PostForm from "../../components/PostForm";

const PropertySales = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-10">
      <h1 className="max-w-2xl mx-auto text-left text-2xl font-bold mb-6">
        Property Sales - Create Social Media Posts
      </h1>

      <PostForm postType="Static" category="property_sales" />
      <PostForm postType="Carousel" category="property_sales" />
      <PostForm postType="Reel" category="property_sales" />
    </div>
  );
};

export default PropertySales;
