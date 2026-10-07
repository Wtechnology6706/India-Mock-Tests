import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/admin-auth";
import { recordAuditEvent } from "../../../../../lib/audit";
import { createQuestionsBulk, type QuestionInput } from "../../../../../lib/admin-content";

export async function POST(request: NextRequest) {
  const access = await requireAdmin(request);
  if ("response" in access) return access.response;

  try {
    const body = await request.json();
    const rawQuestions: QuestionInput[] = Array.isArray(body)
      ? body
      : Array.isArray(body.questions)
      ? body.questions
      : [];

    if (rawQuestions.length === 0) {
      return NextResponse.json(
        { error: "No question rows provided for bulk import. Please supply a valid question list." },
        { status: 400 }
      );
    }

    if (rawQuestions.length > 25000) {
      return NextResponse.json(
        { error: "Maximum bulk import size is 25,000 questions per batch. Please split your file into smaller batches if larger." },
        { status: 400 }
      );
    }

    const result = await createQuestionsBulk(rawQuestions);

    await recordAuditEvent({
      actorId: access.user.id,
      action: "question.bulk_import",
      entityType: "question",
      entityId: `bulk-${Date.now()}`,
      details: {
        total: result.total,
        importedCount: result.importedCount,
        rejectedCount: result.rejectedCount,
      },
    });

    return NextResponse.json({ data: result }, { status: result.importedCount > 0 ? 201 : 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bulk import failed unexpectedly." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const access = await requireAdmin(request);
  if ("response" in access) return access.response;

  try {
    const body = await request.json();
    const ids: string[] = Array.isArray(body.ids) ? body.ids.map(String) : [];
    const status = body.status;

    if (ids.length === 0) {
      return NextResponse.json({ error: "No question IDs provided." }, { status: 400 });
    }

    const allowed = ["Draft", "In review", "Approved", "Published", "Archived"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid question workflow status." }, { status: 400 });
    }

    const { bulkTransitionQuestions } = await import("../../../../../lib/admin-content");
    const result = await bulkTransitionQuestions(ids, status);

    await recordAuditEvent({
      actorId: access.user.id,
      action: "question.bulk_status_change",
      entityType: "question",
      entityId: `bulk-status-${Date.now()}`,
      details: { count: ids.length, updatedCount: result.updatedCount, newStatus: status },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.updatedCount} question(s) to "${status}".`,
      updatedCount: result.updatedCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update questions in bulk." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const access = await requireAdmin(request);
  if ("response" in access) return access.response;

  try {
    const body = await request.json();
    const ids: string[] = Array.isArray(body.ids) ? body.ids.map(String) : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: "No question IDs provided for deletion." }, { status: 400 });
    }

    const { bulkDeleteQuestions } = await import("../../../../../lib/admin-content");
    const result = await bulkDeleteQuestions(ids);

    await recordAuditEvent({
      actorId: access.user.id,
      action: "question.bulk_delete",
      entityType: "question",
      entityId: `bulk-delete-${Date.now()}`,
      details: { count: ids.length, deletedCount: result.deletedCount },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} question(s).`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete questions in bulk." },
      { status: 500 }
    );
  }
}
