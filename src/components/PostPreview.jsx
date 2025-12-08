const PostPreview = ({ postType, title, description, images, video }) => {
  return (
    <div className="border rounded shadow p-4 bg-white max-w-sm mx-auto">
      <h3 className="text-lg font-bold mb-2">{postType} Post Preview</h3>

      <div className="border rounded p-3 bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">{title || "Title here"}</h2>
        <p className="mb-2">{description || "Description here..."}</p>

        {postType === "Static" && images.length > 0 && (
          <img
            src={URL.createObjectURL(images[0])}
            alt="Preview"
            className="w-full h-48 object-cover rounded"
          />
        )}

        {postType === "Carousel" && images.length > 0 && (
          <div className="flex space-x-2 overflow-x-auto">
            {images.map((img, index) => (
              <img
                key={index}
                src={URL.createObjectURL(img)}
                alt={`Carousel ${index}`}
                className="w-32 h-32 object-cover rounded shrink-0"
              />
            ))}
          </div>
        )}

        {postType === "Reel" && video && (
          <video
            controls
            className="w-full h-48 object-cover rounded"
            src={URL.createObjectURL(video)}
          />
        )}
      </div>
    </div>
  );
};

export default PostPreview;
