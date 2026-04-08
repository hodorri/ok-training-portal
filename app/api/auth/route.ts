import { NextRequest } from 'next/server';
import { fetchSheetData } from '@/lib/google-sheets';
import { getSession } from '@/lib/session';

// 이름에서 뒤의 알파벳(A~Z, a~z) 제거: "홍길동A" → "홍길동"
function stripTrailingAlpha(name: string): string {
  return name.replace(/[A-Za-z]+$/, '');
}

export async function POST(request: NextRequest) {
  try {
    const { name, employeeId } = await request.json();

    if (!name || !employeeId) {
      return Response.json(
        { error: '사번과 이름을 입력해 주세요.' },
        { status: 400 }
      );
    }

    const rows = await fetchSheetData();
    const inputName = stripTrailingAlpha(name.trim());

    const user = rows.find((row) => {
      const sheetName = stripTrailingAlpha((row['이름'] || '').trim());
      const sheetId = (row['고유사번'] || '').trim();
      return sheetName === inputName && sheetId === employeeId.trim();
    });

    if (!user) {
      return Response.json(
        { error: '대상자를 찾을 수 없습니다. 사번과 이름을 다시 확인해 주세요.' },
        { status: 401 }
      );
    }

    const session = await getSession();
    session.name = user['이름'] || name;
    session.employeeId = employeeId;
    session.rowIndex = parseInt(user._rowIndex, 10);
    session.department = user['소속 부서'] || '';
    session.team = user['소속 팀'] || '';
    session.title = user['호칭'] || '';
    session.attendanceStatus = user['참석여부'] || '';
    session.passportStatus = user['여권제출여부'] || '';
    await session.save();

    return Response.json({ ok: true });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Auth error:', errMsg);
    return Response.json(
      { error: '서버 오류: ' + errMsg },
      { status: 500 }
    );
  }
}
