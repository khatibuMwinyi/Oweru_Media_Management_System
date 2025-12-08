import { useState } from "react";
import PostPreview from "./PostPreview";

const PostForm = ({ postType }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);

  const handleImageChange = (e) => setImages([...e.target.files]);
  const handleVideoChange = (e) => setVideo(e.target.files[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Post created! Preview is shown below.");
  };

  return (
    <div className="max-w-md sm:max-w-lg md:max-w-2xl mx-auto mt-4 sm:mt-6 space-y-4 p-4 sm:p-6 bg-white shadow rounded">
      <h2 className="font-medium text-sm sm:text-base">{postType} Post</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block mb-1 font-light text-sm sm:text-base">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-b outline-none px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-light text-base">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border-b outline-none px-3 py-2 rounded"
            required
          />
        </div>

        {postType === "Static" && (
          <div>
            <label className="block mb-1 font-light text-base">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
          </div>
        )}

        {postType === "Carousel" && (
          <div>
            <label className="block mb-1 font-light text-base">
              Images (Multiple)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              required
            />
          </div>
        )}

        {postType === "Reel" && (
          <div>
            <label className="block mb-1 ffont-light text-base">Video</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Post
        </button>
      </form>

      {/* Live Preview */}
      <PostPreview
        postType={postType}
        title={title}
        description={description}
        images={images}
        video={video}
      />
    </div>
  );
};

export default PostForm;
