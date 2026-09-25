import React, { useMemo, useState } from "react";
import { navbarStylesDr } from "../assets/dummyStyles";
import logo from "../assets/logo.png";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { Home, Calendar, Edit, LogOut, X, Menu } from "lucide-react";

const DoctorNavbar = () => {
  const [open, setOpen] = useState(false);

  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get doctorId from params or pathname
  const doctorId = useMemo(() => {
    if (params?.id) return params.id;

    const match = location.pathname.match(/\/doctor-admin\/([^/]+)/);
    return match ? match[1] : null;
  }, [params?.id, location.pathname]);

  const basePath = doctorId
    ? `/doctor-admin/${doctorId}`
    : "/doctor-admin/login";

  const navItems = [
    {
      name: "Dashboard",
      to: basePath,
      Icon: Home,
    },
    {
      name: "Appointments",
      to: `${basePath}/appointments`,
      Icon: Calendar,
    },
    {
      name: "Edit Profile",
      to: `${basePath}/profile/edit`,
      Icon: Edit,
    },
  ];

  return (
    <>
      <nav className={navbarStylesDr.navContainer}>
        {/* Left Logo */}
        <div className={navbarStylesDr.leftBrand}>
          <div className={navbarStylesDr.logoContainer}>
            <img
              src={logo}
              alt="MedTek Logo"
              className={navbarStylesDr.logoImage}
            />
          </div>

          <div className={navbarStylesDr.brandTextContainer}>
            <div className={navbarStylesDr.brandTitle}>MedTek</div>
            <div className={navbarStylesDr.brandSubtitle}>
              Healthcare Solutions
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className={navbarStylesDr.desktopMenu}>
          <div className={navbarStylesDr.desktopMenuItems}>
            {navItems.map(({ name, to, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === basePath}
                className={({ isActive }) =>
                  `${navbarStylesDr.baseLink} ${
                    isActive
                      ? navbarStylesDr.activeLink
                      : navbarStylesDr.inactiveLink
                  }`
                }
              >
                <span className={navbarStylesDr.linkContent}>
                  <Icon size={16} className={navbarStylesDr.linkIcon} />
                  <span className={navbarStylesDr.linkText}>{name}</span>
                </span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className={navbarStylesDr.rightActions}>
          <button
            onClick={() => navigate("/doctor-admin/login")}
            className={navbarStylesDr.logoutButtonDesktop}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>

          {/* Mobile Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className={navbarStylesDr.hamburgerButtonMd}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>

          <button
            onClick={() => setOpen(!open)}
            className={navbarStylesDr.hamburgerButtonLg}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={navbarStylesDr.mobileMenuContainer(open)}>
        <div className={navbarStylesDr.mobileMenuContent}>
          {navItems.map(({ name, to, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === basePath}
              className={({ isActive }) =>
                `${navbarStylesDr.mobileBaseLink} ${
                  isActive
                    ? navbarStylesDr.mobileActiveLink
                    : navbarStylesDr.mobileInactiveLink
                }`
              }
              onClick={() => setOpen(false)}
            >
              <Icon size={18} className="text-emerald-400" />
              <span>{name}</span>
            </NavLink>
          ))}

          <button
            onClick={() => {
              setOpen(false);
              window.location.href = "/doctor-admin/login";
            }}
            className={navbarStylesDr.mobileLogoutButton}
          >
            <div className={navbarStylesDr.mobileLogoutContent}>
              <LogOut size={16} />
              Logout
            </div>
          </button>
        </div>
      </div>

      <div className={navbarStylesDr.spacer}></div>
    </>
  );
};

export default DoctorNavbar;
