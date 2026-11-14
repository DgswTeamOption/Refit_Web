export const INITIAL_TEACHER_CLASSES = [
    { id: 'english1', title: '영어1', color: 'peach' },
    { id: 'english2', title: '영어2', color: 'lavender' },
    { id: 'math1', title: '수학1', color: 'yellow' },
    { id: 'math2', title: '수학2', color: 'mint' },
];

const TEACHER_CLASS_STORAGE_KEY = 'refit:teacher:classes';

export function readTeacherClasses() {
    try {
        const storedClasses = JSON.parse(sessionStorage.getItem(TEACHER_CLASS_STORAGE_KEY));
        if (Array.isArray(storedClasses)) return storedClasses;
    } catch {
        // Use the example classes if browser storage is unavailable.
    }

    return INITIAL_TEACHER_CLASSES;
}

export function saveTeacherClasses(classes) {
    try {
        sessionStorage.setItem(TEACHER_CLASS_STORAGE_KEY, JSON.stringify(classes));
    } catch {
        // Keep the current in-memory classes if browser storage is unavailable.
    }
}

export function getTeacherClassTitle(classId, fallbackTitle) {
    if (fallbackTitle) return fallbackTitle;

    const classItem = readTeacherClasses().find((item) => item.id === classId);
    return classItem?.title || classId || '수업';
}
