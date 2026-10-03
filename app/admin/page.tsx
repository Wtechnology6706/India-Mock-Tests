import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserForToken, listUsersForAdmin } from "../../lib/auth-store";
import { getRecentAuditEvents } from "../../lib/audit";
import {
  listQuestions,
  listRuleProfiles,
  listTests,
  getTaxonomy,
  listMockTests,
  listSubjectRequests,
} from "../../lib/admin-content";
import { notifications, plans } from "../../lib/phase1";
import "./admin.css";
import AdminShellClient from "./AdminShellClient";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const user = await getUserForToken(cookieStore.get("northstar_session")?.value);
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const [
    questions,
    rules,
    tests,
    auditEvents,
    taxonomy,
    mockTests,
    subjectRequests,
    users,
  ] = await Promise.all([
    listQuestions(),
    listRuleProfiles(),
    listTests(),
    getRecentAuditEvents(),
    getTaxonomy(),
    listMockTests({ status: "All" }),
    listSubjectRequests(),
    listUsersForAdmin(),
  ]);

  return (
    <main className="admin-page-root">
      <AdminShellClient
        currentUser={user}
        initialQuestions={questions}
        initialRules={rules}
        initialTests={tests}
        initialAuditEvents={auditEvents}
        taxonomy={taxonomy}
        initialMockTests={mockTests}
        initialSubjectRequests={subjectRequests}
        initialUsers={users}
        plans={plans}
        notifications={notifications}
      />
    </main>
  );
}
