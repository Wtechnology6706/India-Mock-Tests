import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin-auth";
import {
  listUsersForAdmin,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  type AuthRole,
} from "../../../../lib/auth-store";
import { recordAuditEvent } from "../../../../lib/audit";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? undefined;
  const role = searchParams.get("role") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  const users = await listUsersForAdmin({ query, role, status });
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const email = String(body.email ?? "");
    const password = String(body.password ?? "");
    const displayName = String(body.displayName ?? "");
    const role = (body.role ?? "student") as AuthRole;

    const result = await createUserByAdmin(email, password, displayName, role);
    if ("error" in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await recordAuditEvent({
      actorId: auth.user.id || auth.user.email,
      action: "CREATE_USER",
      entityType: "user",
      entityId: result.user?.id ?? "unknown",
      details: { email, role, displayName },
    });

    return NextResponse.json({ user: result.user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    const result = await updateUserByAdmin(id, {
      displayName: body.displayName,
      role: body.role,
      status: body.status,
      password: body.password,
    });

    if ("error" in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await recordAuditEvent({
      actorId: auth.user.id || auth.user.email,
      action: "UPDATE_USER",
      entityType: "user",
      entityId: id,
      details: body,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("response" in auth) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    // Prevent deleting oneself
    if (auth.user.id === id) {
      return NextResponse.json({ error: "Cannot delete your own active administrator account." }, { status: 400 });
    }

    const result = await deleteUserByAdmin(id);
    if ("error" in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await recordAuditEvent({
      actorId: auth.user.id || auth.user.email,
      action: "DELETE_USER",
      entityType: "user",
      entityId: id,
      details: { deletedUserId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete user" },
      { status: 500 }
    );
  }
}
