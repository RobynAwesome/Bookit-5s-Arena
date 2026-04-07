import { useEffect, useRef } from "react";

export default function PDFViewer({ url, style, className }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current && url) {
      iframeRef.current.src = url;
    }
  }, [url]);

  return (
    <iframe
      ref={iframeRef}
      src={url}
      title="PDF Preview"
      className={className || "w-full h-96 border rounded-xl bg-white"}
      style={style}
      frameBorder="0"
    />
  );
}
