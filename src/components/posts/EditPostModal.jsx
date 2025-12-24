import { useState, useEffect } from "react";
import { postService, mediaService } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const EditPostModal = ({ post, onClose }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(post.title || "");
  const [description, setDescription] = useState(post.description || "");
  const [existingMedia, setExistingMedia] = useState(post.media || []);
  const [newImages, setNewImages] = useState([]);
  const [newVideo, setNewVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setTitle(post.title || "");
    setDescription(post.description || "");
    setExistingMedia(post.media || []);
    setNewImages([]);
    setNewVideo(null);
  }, [post]);

  const handleRemoveMedia = async (mediaId) => {
    if (!window.confirm("Remove this media from the post?")) return;

    try {
      await mediaService.delete(mediaId);
      setExistingMedia((prev) => prev.filter((m) => m.id !== mediaId));
      window.dispatchEvent(new CustomEvent("postUpdated"));
    } catch (err) {
      console.error("Failed to delete media:", err);
      alert("Failed to delete media. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError("Please login to edit posts");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1) Update basic fields
      await postService.update(post.id, {
        title,
        description,
      });

      // 2) Upload new images (if any)
      for (const file of newImages) {
        await mediaService.upload(file, post.id);
      }

      // 3) Upload new video (if any)
      if (newVideo) {
        await mediaService.upload(newVideo, post.id);
      }

      setSuccess(true);
      window.dispatchEvent(new CustomEvent("postUpdated"));
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Edit Post</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={post.category}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Post Type
              </label>
              <input
                type="text"
                value={post.post_type}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            </div>

            {/* Existing media overview */}
            {existingMedia.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Existing Media
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {existingMedia.map((media) => (
                    <div
                      key={media.id}
                      className="border border-gray-200 rounded-md p-2 flex flex-col gap-2"
                    >
                      <span className="text-xs font-semibold text-gray-600 uppercase">
                        {media.file_type}
                      </span>
                      {media.file_type === "image" ? (
                        <img
                          src={media.url}
                          alt="Post media"
                          className="w-full h-24 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-24 flex items-center justify-center bg-gray-900 text-white text-xs rounded">
                          Video
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(media.id)}
                        className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-gray-500">
                  Removing media will delete it from this post. You can upload new images or a new video below.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C89128]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C89128]"
              />
            </div>

            {/* New media uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add / Replace Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setNewImages(Array.from(e.target.files || []))}
                  className="w-full text-sm text-gray-700"
                />
                <p className="mt-1 text-[11px] text-gray-500">
                  You can upload one or more new images. They will be added to this post.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add / Replace Video
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setNewVideo(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-700"
                />
                <p className="mt-1 text-[11px] text-gray-500">
                  Upload a new video if you want to update the reel for this post.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                Post updated successfully!
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#C89128] text-white rounded hover:bg-[#b37820] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;

