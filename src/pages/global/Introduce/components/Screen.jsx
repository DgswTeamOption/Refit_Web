// Only the product layers are images. Section copy, device shells and scroll states are HTML.
const dimensions = {
    ai: [505, 848], attendance: [1512, 982], classes: [1512, 982],
    calendar: [402, 874], email: [307, 140], join: [307, 140], nfc: [402, 874],
    role: [307, 140], schedule: [1512, 982], student: [402, 874], students: [1512, 982],
    mobileAttendance: [402, 874], mobileClasses: [402, 874], mobileSchedule: [402, 874],
    mobileSolution: [402, 874], mobileStudents: [402, 874],
};

function source(name) {
    return `/introduce/${name}.webp`;
}

export function Screen({ name, mobile, alt, className = '', eager = false }) {
    const [width, height] = dimensions[name];
    return (
        <picture className={'ri-screen ' + className}>
            {mobile && <source media="(max-width: 767px)" srcSet={source(mobile)} width={dimensions[mobile][0]} height={dimensions[mobile][1]} />}
            <img src={source(name)} alt={alt} width={width} height={height} decoding="async" loading={eager ? 'eager' : 'lazy'} />
        </picture>
    );
}
