const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("revalai_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      localStorage.removeItem("revalai_role");
      localStorage.removeItem("revalai_name");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch (_) {}
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password }, auth: false }),
  register: (payload) => request("/auth/register", { method: "POST", body: payload, auth: false }),
  me: () => request("/auth/me"),

  // student
  myResults: () => request("/student/results"),
  myApplications: () => request("/student/applications"),
  apply: (result_id) => request("/student/apply", { method: "POST", body: { result_id, documents_uploaded: true } }),
  pay: (application_id) => request(`/student/applications/${application_id}/pay`, { method: "POST" }),
  myNotifications: () => request("/student/notifications"),

  // evaluator
  myAssignments: () => request("/evaluator/assignments"),
  runAI: (application_id) => request(`/evaluator/applications/${application_id}/run-ai`, { method: "POST" }),
  submitEvaluation: (application_id, final_marks, comments) =>
    request(`/evaluator/applications/${application_id}/submit`, { method: "POST", body: { application_id, final_marks, comments } }),

  // officer
  allApplications: () => request("/officer/applications"),
  listEvaluators: () => request("/officer/evaluators"),
  verify: (application_id, note) => request(`/officer/applications/${application_id}/verify`, { method: "POST", body: { application_id, note } }),
  reject: (application_id, note) => request(`/officer/applications/${application_id}/reject`, { method: "POST", body: { application_id, note } }),
  assignEvaluator: (application_id, evaluator_id) => request("/officer/applications/assign", { method: "POST", body: { application_id, evaluator_id } }),
  publish: (application_id) => request(`/officer/applications/${application_id}/publish`, { method: "POST" }),

  // admin
  listUsers: () => request("/admin/users"),
  createUser: (payload) => request("/admin/users", { method: "POST", body: payload }),
  auditLogs: () => request("/admin/audit-logs"),
  analytics: () => request("/admin/analytics"),
};

export function setToken(token) {
  localStorage.setItem("revalai_token", token);
}
export function clearToken() {
  localStorage.removeItem("revalai_token");
}
export function isLoggedIn() {
  return !!getToken();
}
