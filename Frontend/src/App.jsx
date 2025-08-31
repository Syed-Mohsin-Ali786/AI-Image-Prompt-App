import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./components/Button";
import ImageCard from "./components/ImageCard";
import "./App.css";

function App() {
  const [promptValue, setPromptValue] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ---- Load persisted state ----
  useEffect(() => {
    try {
      const storedImages = localStorage.getItem("Images");
      if (storedImages) {
        const parsed = JSON.parse(storedImages);
        if (Array.isArray(parsed)) setImages(parsed);
      }
    } catch {
      setImages([]);
    }

    const getContent = localStorage.getItem("contents");
    setPromptValue(getContent || "");
  }, []);

  // ---- Persist prompt & images ----
  useEffect(() => {
    localStorage.setItem("contents", promptValue || "");
  }, [promptValue]);

  useEffect(() => {
    localStorage.setItem("Images", JSON.stringify(images));
  }, [images]);

  // ---- Helpers ----
  const canGenerate = useMemo(
    () => !!promptValue.trim() && !loading,
    [promptValue, loading]
  );

  const normalizeResponseToArray = (data) => {
    const base64List =
      (Array.isArray(data?.images) && data.images) ||
      (data?.images ? [data.images] : []) ||
      (data?.image ? [data.image] : []);

    return base64List
      .filter(Boolean)
      .map((b64) =>
        b64.startsWith("data:")
          ? b64
          : `data:image/jpeg;base64,${b64.replace(/^data:image\/\w+;base64,/, "")}`
      );
  };

  // ---- Actions ----
  const generateImg = async () => {
    if (!promptValue.trim()) {
      setErr("Please enter a prompt first.");
      return;
    }

    try {
      setLoading(true);
      setErr("");

      const res = await axios.post("http://localhost:3001/generate-image", {
        prompt: promptValue.trim(),
      });

      const newDataUrls = normalizeResponseToArray(res?.data);
      if (!newDataUrls.length) {
        setErr("No image returned from server.");
        return;
      }

      const stamped = newDataUrls.map((dataUrl) => ({
        dataUrl,
        createdAt: Date.now(),
      }));

      setImages((prev) => [...stamped, ...prev]); // newest first
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong while generating.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && canGenerate) generateImg();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-300 text-white">
      {/* Top bar / Title */}
      <header className="mx-auto max-w-6xl px-4 pt-10 pb-4">
        <motion.h1
          className="text-3xl md:text-5xl font-extrabold drop-shadow tracking-tight"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          AI Image Prompt App
        </motion.h1>

        <motion.p
          className="mt-2 opacity-90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          Type your prompt, hit Generate, download or delete results. Your data is saved locally.
        </motion.p>
      </header>

      {/* Prompt bar */}
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          className="bg-white/20 backdrop-blur rounded-2xl p-4 md:p-5 shadow-xl border border-white/30 flex flex-col md:flex-row gap-3"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <input
            type="text"
            required
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/60 bg-white"
            placeholder="Describe an image to generate…"
          />

          <Button
            primary
            disabled={!canGenerate}
            onClick={generateImg}
            className="h-[52px] text-base font-semibold"
          >
            {loading ? "Generating…" : "Generate"}
          </Button>
        </motion.div>

        {/* Error bubble */}
        <AnimatePresence>
          {err && (
            <motion.div
              className="mt-3 text-red-900 bg-white/80 border border-red-300 px-4 py-3 rounded-xl"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              {err}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Image Grid */}
      <main className="mx-auto max-w-6xl px-4 mt-8 pb-16">
        {!images.length && !loading && (
          <motion.div
            className="text-center text-white/95 bg-white/10 border border-white/25 rounded-2xl p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No images yet. Try a prompt like:{" "}
            <span className="font-semibold">
              “a neon cyberpunk city at night, rain, reflections”
            </span>
          </motion.div>
        )}

        {/* Loading skeletons */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-2xl bg-white/20 animate-pulse"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Render images */}
        <AnimatePresence>
          {!loading && images.length > 0 && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {images.map((img, idx) => (
                <ImageCard
                  key={img.createdAt + "_" + idx}
                  index={idx}
                  dataUrl={img.dataUrl}
                  onDelete={() => handleDelete(idx)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
