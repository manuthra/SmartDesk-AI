const BACKEND = "https://smartdesk-f5d4.onrender.com";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");
  const res = await fetch(`${BACKEND}${endpoint}`);
  const data = await res.json();
  return Response.json(data);
}

export async function POST(request) {
  const body = await request.json();
  const { endpoint, ...rest } = body;
  const res = await fetch(`${BACKEND}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rest),
  });
  const data = await res.json();
  return Response.json(data);
}

export async function PUT(request) {
  const body = await request.json();
  const { endpoint, ...rest } = body;
  const res = await fetch(`${BACKEND}${endpoint}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rest),
  });
  const data = await res.json();
  return Response.json(data);
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");
  const res = await fetch(`${BACKEND}${endpoint}`, { method: "DELETE" });
  const data = await res.json();
  return Response.json(data);
}