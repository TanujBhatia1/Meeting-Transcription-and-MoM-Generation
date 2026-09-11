import { useState } from "react";
import { Download, FileText, CalendarDays, Users } from "lucide-react";
import { getMeetingMom } from "../api";

function MomView({ meeting, mom, onMomLoaded, onError }) {
  const [loading, setLoading] = useState(false);

  async function loadMom() {
    if (!meeting?.id) {
      onError("No meeting is selected.");
      return;
    }

    setLoading(true);

    try {
      const data = await getMeetingMom(meeting.id);
      onMomLoaded(data);
    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function downloadJson() {
    if (!mom) return;

    const blob = new Blob([JSON.stringify(mom, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${meeting?.title || "meeting-minutes"}.json`;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  if (!mom) {
    return (
      <div className="centered-empty">
        <FileText size={42} />
        <h3>No meeting minutes available</h3>
        <p>Generate minutes from the Live Meeting page first.</p>

        <button
          className="primary-button"
          onClick={loadMom}
          disabled={!meeting || loading}
        >
          {loading ? "Loading..." : "Load existing MoM"}
        </button>
      </div>
    );
  }

  const discussionPoints = mom.discussion_points || [];
  const actionItems = mom.action_items || [];

  return (
    <div className="mom-layout">
      <div className="mom-toolbar">
        <div>
          <p className="eyebrow">GENERATED DOCUMENT</p>
          <h2>{mom.title || meeting?.title || "Meeting Minutes"}</h2>
        </div>

        <button className="secondary-button" onClick={downloadJson}>
          <Download size={17} />
          Export JSON
        </button>
      </div>

      <article className="mom-document">
        <header className="mom-header">
          <p className="document-label">MEETING MINUTES</p>
          <h1>{mom.title || meeting?.title || "Untitled meeting"}</h1>

          <div className="mom-meta-grid">
            <div>
              <CalendarDays size={18} />
              <span>
                <small>Date</small>
                <strong>{mom.date || "Not specified"}</strong>
              </span>
            </div>

            <div>
              <Users size={18} />
              <span>
                <small>Members present</small>
                <strong>
                  {mom.attendees?.join(", ") || "Not identified"}
                </strong>
              </span>
            </div>
          </div>
        </header>

        <MomSection title="Introduction">
          <p>{mom.introduction || "No introduction was generated."}</p>
        </MomSection>

        <MomSection title="Discussion points">
          {discussionPoints.length === 0 ? (
            <p>No discussion points were generated.</p>
          ) : (
            <div className="discussion-list">
              {discussionPoints.map((item, index) => (
                <div className="discussion-item" key={index}>
                  <div className="section-number">{index + 1}</div>
                  <div>
                    <h4>{item.agenda_item || `Topic ${index + 1}`}</h4>
                    <p>{item.summary}</p>

                    {item.key_quotes?.length > 0 && (
                      <blockquote>
                        “{item.key_quotes.join("”\n“")}”
                      </blockquote>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </MomSection>

        <MomSection title="Action points">
          {actionItems.length === 0 ? (
            <p>No action items were generated.</p>
          ) : (
            <div className="action-table-wrapper">
              <table className="action-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Owner</th>
                    <th>Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {actionItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.task || "Not specified"}</td>
                      <td>{item.owner || "Unassigned"}</td>
                      <td>{item.deadline || "Not specified"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </MomSection>

        <MomSection title="Conclusion">
          <p>{mom.conclusion || "No conclusion was generated."}</p>
        </MomSection>
      </article>
    </div>
  );
}

function MomSection({ title, children }) {
  return (
    <section className="mom-section">
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  );
}

export default MomView;