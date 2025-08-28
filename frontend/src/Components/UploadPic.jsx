import { useState } from "react";

function UploadPic() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("picture", file);

    try {
      const res = await fetch("http://localhost:3000/api/users/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setUrl(data.url);
      } else {
        console.error("Upload failed:", data.error);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>

      {url && (
        <div>
          <p>Uploaded image:</p>
          <img src={url} alt="uploaded" width={200} />
        </div>
      )}
    </div>
  );
}

export default UploadPic;
