const API_URL = import.meta.env.VITE_API_URL || "";

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string" ? data : data.detail || "Request failed";
    throw new Error(message);
  }

  return data;
}

export async function uploadAgenda(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/agenda/upload`, {
    method: "POST",
    body: formData,
  });

  return parseResponse(response);
}

export async function createMeeting(payload) {
  const response = await fetch(`${API_URL}/api/meetings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function generateMom(meetingId) {
  const response = await fetch(
    `${API_URL}/api/meetings/${meetingId}/generate-mom`,
    {
      method: "POST",
    }
  );

  return parseResponse(response);
}

export async function getMeetingMom(meetingId) {
  const response = await fetch(`${API_URL}/api/meetings/${meetingId}/mom`);
  return parseResponse(response);
}

export async function askChat(question, meetingId = null) {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      meeting_id: meetingId,
    }),
  });

  return parseResponse(response);
}

export function createAudioWebSocket(meetingId, token = "") {
  const baseUrl = API_URL || window.location.origin;
  const url = new URL(baseUrl);

  const protocol = url.protocol === "https:" ? "wss:" : "ws:";
  const host = url.host;

  const query = new URLSearchParams({
    meeting_id: meetingId,
  });

  if (token) {
    query.set("token", token);
  }

  return new WebSocket(
    `${protocol}//${host}/api/ws/asr?${query.toString()}`
  );
}