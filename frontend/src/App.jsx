import { useState } from "react";
import {
  LayoutDashboard,
  Mic,
  FileText,
  MessageSquare,
  Settings,
  Menu,
  X,
  CircleHelp,
} from "lucide-react";

import AgendaUpload from "./components/AgendaUpload";
import LiveMeeting from "./components/LiveMeeting";
import MomView from "./components/MomView";
import ChatPanel from "./components/ChatPanel";
import { createMeeting } from "./api";

const tabs = [
  {
    id: "meeting",
    label: "Live Meeting",
    icon: Mic,
  },
  {
    id: "mom",
    label: "Meeting Minutes",
    icon: FileText,
  },
  {
    id: "chat",
    label: "Ask Your Meetings",
    icon: MessageSquare,
  },
];

function App() {
  const [activeTab, setActiveTab] = useState("meeting");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [agenda, setAgenda] = useState(null);
  const [meeting, setMeeting] = useState(null);
  const [mom, setMom] = useState(null);
  const [notification, setNotification] = useState(null);

  function notify(message, type = "info") {
    setNotification({ message, type });

    window.setTimeout(() => {
      setNotification(null);
    }, 4000);
  }

  async function handleAgendaUploaded(parsedAgenda, file) {
    setAgenda({
      ...parsedAgenda,
      filename: file.name,
    });

    try {
      const createdMeeting = await createMeeting({
        title: parsedAgenda.title || file.name,
        agenda: parsedAgenda,
        meeting_date: new Date().toISOString(),
      });

      setMeeting(createdMeeting);
      notify("Agenda uploaded and meeting created", "success");
    } catch (error) {
      notify(
        `Agenda parsed, but meeting creation failed: ${error.message}`,
        "error"
      );

      // Temporary frontend fallback for UI development.
      setMeeting({
        id: crypto.randomUUID(),
        title: parsedAgenda.title || file.name,
        agenda: parsedAgenda,
      });
    }
  }

  function handleMomGenerated(data) {
    setMom(data);
    setActiveTab("mom");
    notify("Meeting minutes generated", "success");
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Mic size={20} />
          </div>
          <div>
            <h1>MeetNote AI</h1>
            <span>Meeting intelligence</span>
          </div>

          <button
            className="icon-button mobile-only"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="navigation">
          <div className="nav-label">Workspace</div>

          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                className={`nav-item ${
                  activeTab === tab.id ? "nav-item-active" : ""
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="nav-label nav-label-spaced">System</div>

          <button className="nav-item">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button className="nav-item">
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">TU</div>
          <div className="user-info">
            <strong>Workspace User</strong>
            <span>Local workspace</span>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <button
            className="icon-button mobile-only"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={21} />
          </button>

          <div>
            <p className="eyebrow">AI MEETING ASSISTANT</p>
            <h2>
              {activeTab === "meeting" && "Capture your meeting"}
              {activeTab === "mom" && "Review meeting minutes"}
              {activeTab === "chat" && "Ask questions about meetings"}
            </h2>
          </div>

          <div className="topbar-actions">
            <button className="icon-button" title="Help">
              <CircleHelp size={19} />
            </button>
          </div>
        </header>

        {notification && (
          <div className={`notification notification-${notification.type}`}>
            {notification.message}
          </div>
        )}

        <section className="page-content">
          {activeTab === "meeting" && (
            <LiveMeeting
              agenda={agenda}
              meeting={meeting}
              onAgendaUploaded={handleAgendaUploaded}
              onMomGenerated={handleMomGenerated}
              onError={(message) => notify(message, "error")}
            />
          )}

          {activeTab === "mom" && (
            <MomView
              meeting={meeting}
              mom={mom}
              onMomLoaded={setMom}
              onError={(message) => notify(message, "error")}
            />
          )}

          {activeTab === "chat" && (
            <ChatPanel
              meeting={meeting}
              onError={(message) => notify(message, "error")}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;