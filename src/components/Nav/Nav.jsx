import { Link } from "react-router-dom";
import "./Nav.css";

export default function Nav({ items = [], label = "현재 위치", className = "" }) {
  return (
    <nav className={`breadcrumb-nav ${className}`.trim()} aria-label={label}>
      {items.map((item, index) => (
        <span className="breadcrumb-nav-item" key={`${item.text}-${index}`}>
          {index > 0 && <span className="breadcrumb-nav-separator" aria-hidden="true">›</span>}
          {item.link ? (
            <Link to={item.link}>{item.text}</Link>
          ) : item.onClick ? (
            <button type="button" onClick={item.onClick}>{item.text}</button>
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
