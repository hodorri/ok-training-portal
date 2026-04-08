import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { getSheets, updateCell } from '@/lib/google-sheets';

export async function GET() {
  try {
    const session = await getSession();
    if (!session.name || !session.rowIndex) {
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // N열: 참석여부, P열: 불참사유
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      ranges: [
        `대상자!N${session.rowIndex}`,
        `대상자!P${session.rowIndex}`,
      ],
    });
    const status = res.data.valueRanges?.[0]?.values?.[0]?.[0] || '';
    const reason = res.data.valueRanges?.[1]?.values?.[0]?.[0] || '';

    return Response.json({ status, reason });
  } catch (error) {
    console.error('Attendance GET error:', error);
    return Response.json({ error: '조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.name || !session.rowIndex) {
      return Response.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { status, reason } = await request.json();

    if (!status || !['참석', '불참'].includes(status)) {
      return Response.json(
        { error: '참석 또는 불참을 선택해 주세요.' },
        { status: 400 }
      );
    }

    // N열: 참석여부, P열: 불참사유
    await updateCell(`대상자!N${session.rowIndex}`, status);

    if (status === '불참' && reason) {
      await updateCell(`대상자!P${session.rowIndex}`, reason);
    }

    // Update session
    session.attendanceStatus = status;
    await session.save();

    return Response.json({ ok: true });
  } catch (error) {
    console.error('Attendance error:', error);
    return Response.json(
      { error: '저장 중 오류가 발생했습니다.' },
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
