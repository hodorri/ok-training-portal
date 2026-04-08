import { NextRequest } from 'next/server';
import { put } from '@vercel/blob';
import { getSession } from '@/lib/session';
import { getSheets, updateCell } from '@/lib/google-sheets';

export async function GET() {
  try {
    const session = await getSession();
    if (!session.name) {
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }
    return Response.json({ status: session.passportStatus || '미제출' });
  } catch {
    return Response.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.name || !session.rowIndex || !session.employeeId) {
      return Response.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json(
        { error: '파일을 선택해 주세요.' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { error: 'JPG, PNG, PDF 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return Response.json(
        { error: '파일 크기는 10MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    // Generate filename: {사번}_{이름}.{ext}
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `passport/${session.employeeId}_${session.name}.${ext}`;

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
    });

    // Update Sheets: 여권제출여부 column
    const sheets = getSheets();
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: '대상자!1:1',
    });
    const headers = headerRes.data.values?.[0] || [];
    const passportColIndex = headers.findIndex(
      (h: string) => h.trim().replace(/\s+/g, ' ').includes('여권제출여부')
    );

    if (passportColIndex >= 0) {
      const colLetter = getColumnLetter(passportColIndex);
      if (colLetter) {
        await updateCell(`대상자!${colLetter}${session.rowIndex}`, '제출');
      }
    }

    // Update session
    session.passportStatus = '제출';
    await session.save();

    return Response.json({ ok: true, url: blob.url });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Passport upload error:', errMsg);
    return Response.json(
      { error: '업로드 중 오류가 발생했습니다: ' + errMsg },
      { status: 500 }
    );
  }
}

function getColumnLetter(index: number): string | null {
  if (index < 0) return null;
  let letter = '';
  let i = index;
  while (i >= 0) {
    letter = String.fromCharCode((i % 26) + 65) + letter;
    i = Math.floor(i / 26) - 1;
  }
  return letter;
}
