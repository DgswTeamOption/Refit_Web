import { ApiError } from './apiClient.js';

// 개발 화면 확인용 임시 데이터. 실제 API 응답과 같은 필드 형식을 사용합니다.
const STORAGE_KEY = 'refit:teacher:mock:v1';
let memory;

function seedData() {
    const classes = ['영어1', '영어2', '수학1', '수학2'].map((name, index) => ({
        id: index + 4,
        name,
        classCode: 'TEST' + String(index + 4).padStart(4, '0'),
        teacherName: '선생님',
        bannerImageUrl: null,
        createdAt: '2026-08-01T09:00:00',
    }));
    const notices = {};
    classes.forEach((item) => {
        notices[item.id] = [
            { title: '(역량 수행평가안내) 자기성장보고서 & 북 프리젠테이션', content: '재학생을 대상으로 특강을 할 학생 전문가를 모집합니다.\n신청 링크에서 신청서를 작성해주세요.' },
            { title: '2학기 수업 일정 안내', content: '이번 달 수업 및 보강 일정을 안내합니다.' },
            { title: '교재 준비 안내', content: '다음 수업 전까지 교재를 준비해주세요.' },
        ].map((notice, index) => ({ ...notice, noticeId: item.id * 100 + index + 1, classId: item.id, writerId: 1, createdAt: '2026-08-20T09:00:00', updatedAt: '2026-08-20T09:00:00' }));
    });
    return { classes, notices, images: {}, nextClassId: 8, nextNoticeId: 1000, nextImageId: 1 };
}

function readData() {
    if (memory) return memory;
    try {
        const stored = JSON.parse(globalThis.sessionStorage?.getItem(STORAGE_KEY) || 'null');
        if (Array.isArray(stored?.classes) && stored.notices && stored.images) memory = stored;
    } catch {
        // 브라우저 저장소를 사용할 수 없으면 메모리에서만 테스트합니다.
    }
    memory ||= seedData();
    return memory;
}

function saveData() {
    try {
        globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(memory));
    } catch {
        // 이미지 용량 등으로 저장이 안 돼도 현재 화면의 데이터는 유지합니다.
    }
}

function schedulesFor(classroom, year, month) {
    const index = (classroom.id - 4) % 4;
    const days = [[11, 25, 27], [4, 6, 11, 13, 18, 20, 25, 27], [11, 13, 25, 27], [4, 6, 13, 18, 20]][index];
    const prefix = year + '-' + String(month).padStart(2, '0') + '-';
    return days.map((day) => ({
        scheduleId: classroom.id * 100 + day,
        classId: classroom.id,
        studentId: 1,
        startTime: prefix + String(day).padStart(2, '0') + 'T14:00:00',
        endTime: prefix + String(day).padStart(2, '0') + 'T15:00:00',
    }));
}

async function imageDataUrl(file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 32768) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
    }
    return 'data:' + file.type + ';base64,' + btoa(binary);
}

export async function mockTeacherRequest(path, { method = 'GET', body, signal } = {}) {
    if (signal?.aborted) throw new DOMException('요청이 취소되었습니다.', 'AbortError');
    const data = readData();
    const url = new URL(path, 'https://refit.team');
    const pathname = url.pathname;
    let result;

    if (pathname === '/api/files/images' && method === 'POST') {
        const file = body.get('file');
        if (!file?.type.startsWith('image/')) throw new ApiError('이미지 파일을 선택해주세요.', 400);
        result = { fileId: data.nextImageId++, imageUrl: await imageDataUrl(file) };
        data.images[result.fileId] = result.imageUrl;
    } else if (pathname === '/api/class') {
        if (method === 'GET') result = data.classes;
        else if (method === 'POST') {
            if (!body?.name?.trim()) throw new ApiError('수업 제목을 입력해주세요.', 400);
            const id = data.nextClassId++;
            result = { id, name: body.name, classCode: 'TEST' + String(id).padStart(4, '0'), teacherName: '선생님', bannerImageUrl: data.images[body.bannerImageId] || null, createdAt: new Date().toISOString() };
            data.classes.unshift(result);
            data.notices[id] = [];
        } else throw new ApiError('지원하지 않는 요청입니다.', 405);
    } else {
        const route = pathname.match(/^\/api\/class\/(?:(notice|calendar|attendance\/stats|attendance)\/)?(\d+)(?:\/(\d+))?$/);
        if (!route) throw new ApiError('테스트 데이터에 없는 요청입니다.', 404);
        const [, resource, classId, noticeId] = route;
        const classroom = data.classes.find((item) => item.id === Number(classId));
        if (!classroom) throw new ApiError('수업을 찾을 수 없습니다.', 404);
        const year = Number(url.searchParams.get('year') || new Date().getFullYear());
        const month = Number(url.searchParams.get('month') || new Date().getMonth() + 1);

        if (resource === 'notice') {
            const notices = data.notices[classId] || [];
            const notice = notices.find((item) => item.noticeId === Number(noticeId));
            if (noticeId && !notice) throw new ApiError('공지를 찾을 수 없습니다.', 404);
            if (method === 'GET') result = noticeId ? notice : notices;
            else if (method === 'POST') {
                if (!body?.title?.trim() || !body?.content?.trim()) throw new ApiError('제목과 내용을 입력해주세요.', 400);
                const createdAt = new Date().toISOString();
                const created = { noticeId: data.nextNoticeId++, classId: classroom.id, writerId: 1, title: body.title, content: body.content, createdAt, updatedAt: createdAt };
                data.notices[classId] = [created, ...notices];
                result = created.noticeId;
            } else if (method === 'PATCH' && notice) {
                Object.assign(notice, body, { updatedAt: new Date().toISOString() });
                result = null;
            } else if (method === 'DELETE' && notice) {
                data.notices[classId] = notices.filter((item) => item.noticeId !== notice.noticeId);
                result = null;
            } else throw new ApiError('지원하지 않는 요청입니다.', 405);
        } else if (resource === 'calendar') {
            result = schedulesFor(classroom, year, month);
        } else if (resource === 'attendance/stats') {
            result = [{ year, month, student_id: 1, student_name: '학생1', present_count: 10, late_count: 1, absent_count: 1 }];
        } else if (resource === 'attendance') {
            const date = url.searchParams.get('date');
            result = ['PRESENT', 'ABSENT', 'LATE'].map((status, index) => ({ schedule_id: classroom.id * 100 + index, student_id: index + 1, student_name: '학생' + (index + 1), status, method: 'MANUAL', start_time: date + 'T14:00:00', end_time: date + 'T15:00:00', checked_at: date + 'T14:00:00' }));
        } else if (method === 'GET') {
            result = { ...classroom, classroomId: classroom.id, memberCount: 12, calendar: schedulesFor(classroom, year, month) };
        } else if (method === 'DELETE') {
            data.classes = data.classes.filter((item) => item.id !== classroom.id);
            delete data.notices[classId];
            result = null;
        } else throw new ApiError('지원하지 않는 요청입니다.', 405);
    }

    if (signal?.aborted) throw new DOMException('요청이 취소되었습니다.', 'AbortError');
    if (method !== 'GET') saveData();
    return structuredClone(result);
}
