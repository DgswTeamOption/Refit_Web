import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import GlobalNavigation from "../GlobalNavigation/GlobalNavigation";
import { isAuthenticatedSession } from "../../utils/auth";
import "../../pages/global/GlobalPages.css";

export default function GlobalPageLayout({ children, onNavigate }) {
  const isLoggedIn = isAuthenticatedSession();

  return (
    <div className="global-site">
      <Header isLoggedIn={isLoggedIn} />
      {children}
      {!isLoggedIn && (
        <GlobalNavigation variant="footer" onNavigate={onNavigate}>
          <Footer />
        </GlobalNavigation>
      )}
    </div>
  );
}
