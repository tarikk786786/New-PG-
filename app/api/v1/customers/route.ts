import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiKeyService } from "@/lib/services/api-keys";
import { generateId } from "@/lib/utils";
import { Customer } from "@/lib/types";

export async function GET(req: NextRequest) {
  const requestId = `req_${Date.now()}`;
  const auth = await ApiKeyService.authenticate(req, "customers:read");
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "UNAUTHORIZED", message: auth.error }, request_id: requestId },
      { status: 401 }
    );
  }

  const list = await db.customers.list();
  return NextResponse.json({
    success: true,
    data: list,
    error: null,
    request_id: requestId,
  });
}

export async function POST(req: NextRequest) {
  const requestId = `req_${Date.now()}`;
  const auth = await ApiKeyService.authenticate(req, "customers:write");
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "UNAUTHORIZED", message: auth.error }, request_id: requestId },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const customer: Customer = {
      id: generateId("cust"),
      name: body.name,
      email: body.email,
      phone: body.phone,
      metadata: body.metadata,
      createdAt: new Date().toISOString(),
    };

    await db.customers.create(customer);
    return NextResponse.json({
      success: true,
      data: customer,
      error: null,
      request_id: requestId,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "INTERNAL_ERROR", message: err.message }, request_id: requestId },
      { status: 500 }
    );
  }
}
