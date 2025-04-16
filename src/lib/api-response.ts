import { NextResponse } from 'next/server';

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export function successResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
  });
}

export function errorResponse(error: string, status = 400): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
} 