// import { motion } from "framer-motion";
import Button from "./Button";

function downloadDataUrl(dataUrl, filename = "image.jpg") {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function ImageCard({ dataUrl, index, onDelete }) {
  const onDownload = () => {
    // Try to infer extension from dataUrl mime
    const match = dataUrl.match(/^data:(image\/[^;]+);base64,/i);
    const ext =
      match?.[1]?.split("/")?.[1]?.replace("jpeg", "jpg") || "jpg";
    downloadDataUrl(dataUrl, `generated-${index + 1}.${ext}`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="group bg-white/15 border border-white/25 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={dataUrl}
          alt={`Generated ${index + 1}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          draggable={false}
          loading="lazy"
        />
      </div>

      <div className="p-3 flex gap-3">
        <Button secondary className="flex-1 justify-center" onClick={onDownload}>
          Download
        </Button>
        <Button danger className="flex-1 justify-center" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </motion.div>
  );
}
