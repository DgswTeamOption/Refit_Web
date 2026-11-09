import "./Nav.css";

export default function Nav({ items = [], label = "현재 위치" }) {
  return (
    <nav className="breadcrumb-nav" aria-label={label}>
      {items.map((item, index) => (
        <span className="breadcrumb-nav-item" key={`${item.text}-${index}`}>
          {index > 0 && <span className="breadcrumb-nav-separator" aria-hidden="true">›</span>}
          {item.link ? (
            <a href={item.link}>{item.text}</a>
          ) : (
            <span aria-current={index === items.length - 1 ? "page" : undefined}>
              {item.text}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
