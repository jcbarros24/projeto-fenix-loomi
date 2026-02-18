import { NextResponse } from 'next/server'
interface DeleteUserResponse {
  error: string
  success: false
}

export async function POST(): Promise<NextResponse<DeleteUserResponse>> {
  return NextResponse.json(
    {
      error: 'Endpoint desativado temporariamente.',
      success: false,
    },
    { status: 501 },
  )
}
