import { useState } from "react";
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
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 sm:p-5 space-y-4">
      <h2 className="font-semibold text-base sm:text-lg text-gray-900">
        {postType} Post
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-2 rounded-md text-sm"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-2 rounded-md text-sm min-h-[100px]"
            required
          />
        </div>

        {postType === "Static" && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              className="text-sm"
            />
          </div>
        )}

        {postType === "Carousel" && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Images (Multiple)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              required
              className="text-sm"
            />
          </div>
        )}

        {postType === "Reel" && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Video
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              required
              className="text-sm"
            />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md">
            Post created successfully!
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={aiLoading}
            className="px-4 py-2 cursor-pointer bg-slate-800 text-white text-sm rounded-md hover:bg-slate-700 disabled:opacity-50"
          >
            {aiLoading ? "Generating..." : "🤖 Generate with AI"}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 cursor-pointer bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
