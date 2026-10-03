import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/admin-auth";
import { updateMockTestStatus, updateMockTest, deleteMockTest } from "../../../../../lib/admin-content";
import { recordAuditEvent } from "../../../../../lib/audit";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireAdmin(request);
  if ("response" in access) return access.response;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const updatedTest = await updateMockTest(id, body);

    await recordAuditEvent({
      actorId: access.user.id,
      action: "mock_test.update",
      entityType: "test",
      entityId: id,
      details: body,
    });

    return NextResponse.json({ success: true, test: updatedTest });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update mock test" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireAdmin(request);
  if ("response" in access) return access.response;

  const { id } = await context.params;

  try {
    const body = await request.json();

    // If only status is passed, use fast status toggle
    if (Object.keys(body).length === 1 && body.status) {
      const { status } = body;
      if (!["Draft", "Published", "Archived"].includes(status)) {
        return NextResponse.json(
          { error: "Valid status (Draft, Published, Archived) is required." },
          { status: 400 }
        );
      }
      await updateMockTestStatus(id, status);

      await recordAuditEvent({
        actorId: access.user.id,
        action: "mock_test.update_status",
        entityType: "test",
        entityId: id,
        details: { status },
      });

      return NextResponse.json({ success: true, status });
    }

    // Otherwise perform full or partial update
    const updatedTest = await updateMockTest(id, body);

    await recordAuditEvent({
      actorId: access.user.id,
      action: "mock_test.update",
      entityType: "test",
      entityId: id,
      details: body,
    });

    return NextResponse.json({ success: true, test: updatedTest });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update test" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireAdmin(request);
  if ("response" in access) return access.response;

  const { id } = await context.params;

  try {
    const success = await deleteMockTest(id);

    await recordAuditEvent({
      actorId: access.user.id,
      action: "mock_test.delete",
      entityType: "test",
      entityId: id,
      details: {},
    });

    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete test" },
      { status: 500 }
    );
  }
}
