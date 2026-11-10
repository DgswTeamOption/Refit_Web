import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import GlobalNavigation from "../GlobalNavigation/GlobalNavigation";
import "../../pages/global/GlobalPages.css";

export default function GlobalPageLayout({ children, onNavigate }) {
  return (
    <div className="global-site">
      <Header />
      {children}
      <GlobalNavigation variant="footer" onNavigate={onNavigate}>
        <Footer />
      </GlobalNavigation>
    </div>
  );
}
