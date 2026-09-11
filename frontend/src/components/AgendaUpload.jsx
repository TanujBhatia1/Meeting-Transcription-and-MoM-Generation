import { useRef, useState } from "react";
import { FileUp, FileText, CheckCircle2 } from "lucide-react";
import { uploadAgenda } from "../api";

const allowedExtensions = [".pdf", ".docx", ".txt", ".md"];

function AgendaUpload({ agenda, onUploaded, onError }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  async function processFile(file) {
    if (!file) return;

    const valid = allowedExtensions.some((extension) =>
      file.name.toLowerCase().endsWith(extension)
    );

    if (!valid) {
      onError("Please upload a PDF, DOCX, TXT, or Markdown agenda.");
      return;
    }

    setLoading(true);

    try {
      const parsedAgenda = await uploadAgenda(file);
      onUploaded(parsedAgenda, file);
    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    processFile(event.dataTransfer.files[0]);
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">STEP 1</p>
          <h3>Upload meeting agenda</h3>
          <p className="muted">
            Add the agenda so discussion points can be mapped to it.
          </p>
        </div>
        <FileText className="card-icon" size={23} />
      </div>

      <div
        className={`upload-zone ${dragging ? "upload-zone-active" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          hidden
          onChange={(event) => processFile(event.target.files[0])}
        />

        {loading ? (
          <>
            <div className="spinner" />
            <strong>Parsing agenda...</strong>
            <span>Extracting title and agenda items</span>
          </>
        ) : agenda ? (
          <>
            <CheckCircle2 className="success-icon" size={34} />
            <strong>{agenda.filename}</strong>
            <span>Agenda uploaded successfully. Click to replace it.</span>
          </>
        ) : (
          <>
            <FileUp size={34} />
            <strong>Drop your agenda here</strong>
            <span>or click to browse PDF, DOCX, TXT, or MD files</span>
          </>
        )}
      </div>

      {agenda && (
        <div className="agenda-summary">
          <div>
            <span className="summary-label">Meeting title</span>
            <strong>{agenda.title || "Untitled meeting"}</strong>
          </div>

          <div>
            <span className="summary-label">Agenda items</span>
            <strong>{agenda.agenda_items?.length || 0}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgendaUpload;