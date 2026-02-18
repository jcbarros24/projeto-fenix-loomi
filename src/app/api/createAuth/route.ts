import { NextResponse } from 'next/server'
interface CreateUserResponse {
  uid: string | null
  error: string
  success: false
}

export async function POST(): Promise<NextResponse<CreateUserResponse>> {
  return NextResponse.json(
    {
      uid: null,
      error: 'Endpoint desativado temporariamente.',
      success: false,
    },
    { status: 501 },
  )
}
