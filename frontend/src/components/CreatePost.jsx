import React, { useRef, useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileAsDataURL } from "@/lib/utils";
import { Loader2, Image as ImageIcon, XCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [imagePreview, setImagePreview] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!open) {
      setCaption("");
      setImagePreview("");
    }
  }, [open]);

  const fileChangeHandler = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  }, []);

  const createPostHandler = useCallback(async () => {
    if (!caption.trim() && !imagePreview) {
      return toast.error("Post cannot be empty");
    }

    const formData = new FormData();
    formData.append("caption", caption);
    if (imageRef.current?.files?.[0]) {
      formData.append("image", imageRef.current.files[0]);
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/v1/post/addpost", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      dispatch(setPosts([res.data.post, ...posts]));
      toast.success(res.data.message || "Post created successfully!");
      setOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [caption, imagePreview, posts, dispatch, setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="text-center font-semibold text-lg">Create New Post</DialogHeader>
        
        {/* User Info */}
        <div className="flex gap-3 items-center mb-3">
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="Profile" />
            <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-sm">{user?.username || "Unknown User"}</h1>
            <span className="text-gray-500 text-xs">Your Bio here...</span>
          </div>
        </div>

        {/* Caption Input */}
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="focus:ring-transparent border rounded-md p-2 text-sm"
          placeholder="Write a caption..."
          maxLength={200}
        />

        {/* Image Preview */}
        {imagePreview ? (
          <div className="relative w-full h-64 flex items-center justify-center mt-3">
            <img src={imagePreview} alt="Preview" className="object-cover h-full w-full rounded-md" />
            <button
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black"
              onClick={() => setImagePreview("")}
            >
              <XCircle size={20} />
            </button>
          </div>
        ) : (
          <div
            className="w-full h-32 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-md mt-3 cursor-pointer"
            onClick={() => imageRef.current.click()}
          >
            <ImageIcon size={32} className="text-gray-500" />
          </div>
        )}

        {/* File Input */}
        <input ref={imageRef} type="file" className="hidden" onChange={fileChangeHandler} />

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          <Button className="w-full bg-[#0095F6] hover:bg-[#258bcf]" onClick={() => imageRef.current.click()}>
            Select Image
          </Button>
          <Button
            onClick={createPostHandler}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={loading || (!caption.trim() && !imagePreview)}
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
