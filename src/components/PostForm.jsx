import { useState } from "react";
import PostPreview from "./PostPreview";
import { postService, aiService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const PostForm = ({ postType, category }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleImageChange = (e) => setImages([...e.target.files]);
  const handleVideoChange = (e) => setVideo(e.target.files[0]);

  const handleAIGenerate = async () => {
    if (!user) {
      setError("Please login to use AI generation");
      return;
    }

    setAiLoading(true);
    setError(null);
    try {
      const response = await aiService.generate({
        category: category,
        post_type: postType,
        property_data: {},
      });
      
      if (response.data.title) {
        setTitle(response.data.title);
      }
      if (response.data.description) {
        setDescription(response.data.description);
      }
    } catch (err) {
      setError(err.response?.data?.message || "AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError("Please login to create posts");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const postData = {
        category: category,
        post_type: postType,
        title: title,
        description: description,
        images: images.length > 0 ? images : null,
        video: video || null,
      };

      await postService.create(postData);
      setSuccess(true);
      
      // Reset form
      setTitle("");
      setDescription("");
      setImages([]);
      setVideo(null);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
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
            <label className="block mb-1 font-light text-base">Video</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              required
            />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 text-green-700 rounded">
            Post created successfully!
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={aiLoading}
            className="px-4 py-2 cursor-pointer bg-slate-800 text-white rounded hover:bg-slate-700 disabled:opacity-50"
          >
            {aiLoading ? "Generating..." : "🤖 Generate with AI"}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Post"}
          </button>
        </div>
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
