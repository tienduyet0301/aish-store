"use client";
import { useState, useEffect } from "react";
import { FiShoppingCart, FiSearch, FiUser } from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Menu, X, Search } from "lucide-react";
import SearchBar from "./SearchBar";
import CartDropdown from "./CartDropdown";
import MenuDropdown from "./MenuDropdown";
import UserDropdown from "./UserDropdown";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [hoveredSubItem, setHoveredSubItem] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [targetPath, setTargetPath] = useState(null);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { isCartOpen, setIsCartOpen, cartItems, toggleCart } = useCart();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (targetPath && targetPath !== pathname) {
      const timeoutId = setTimeout(() => {
        setIsLoading(true);
      }, 300);
      return () => {
        clearTimeout(timeoutId);
        setIsLoading(false);
        setTargetPath(null);
      };
    }
  }, [pathname, targetPath]);

  const menuItems = [
    { title: "ALL", subItems: [] },
    {
      title: "STORE",
      subItems: [
        { title: "TOPS", subItems: ["TSHIRT", "SHIRT", "POLO", "SWEATER", "HOODIE"] },
        { title: "BOTTOMS", subItems: ["PANTS", "SHORT", "SKIRT"] },
        { title: "ACCESSORIES", subItems: ["CAP", "KEYCHAIN", "TOWEL"] },
      ],
    },
    {
      title: "COLLECTION",
      subItems: [
        { title: "ACCEPT THE PROBLEM", subItems: [] },
        { title: "BACK TO SUMMER", subItems: [] },
        { title: "CHILL, CALM DOWN", subItems: [] },
      ],
    },
    {
      title: "SERVICE",
      subItems: [
        { title: "RETURN POLICY", subItems: [] },
        { title: "WARRANTY POLICY", subItems: [] },
        { title: "CARE INSTRUCTIONS", subItems: [] },
      ],
    },
    { title: "ABOUT US", subItems: [] },
  ];

  const navigateWithLoader = (path) => {
    if (path !== pathname) {
      setTargetPath(path);
      router.push(path);
      if (path === "/login") {
        setIsLoggedIn(true);
      } else if (path === "/logout") {
        setIsLoggedIn(false);
      }
    }
  };

  const handleNavigation = (parentTitle, subItem) => {
    const lowerSubItem = subItem.toLowerCase();
    let path = "";
    if (parentTitle === "ALL") {
      path = "/products";
    } else if (parentTitle === "ABOUT US") {
      path = "/about-us";
    } else if (parentTitle === "TOPS") {
      path = `/tops/${lowerSubItem}`;
    } else if (parentTitle === "BOTTOMS") {
      path = `/bottoms/${lowerSubItem}`;
    } else if (parentTitle === "ACCESSORIES") {
      path = `/accessories/${lowerSubItem}`;
    } else if (parentTitle === "COLLECTION") {
      path = `/collection/${lowerSubItem.replace(/\s+/g, "-")}`;
    } else {
      path = `/${lowerSubItem.replace(/\s+/g, "-")}`;
    }
    if (path) {
      navigateWithLoader(path);
      setIsOpen(false);
      setActiveSubMenu(null);
    }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}
      <nav className={`fixed top-0 left-0 w-full z-50 uppercase transition-colors duration-500 ${pathname === "/" && !isScrolled ? "bg-transparent shadow-none" : "bg-white shadow-md border-b border-gray-200"}`}>
        <div className="relative flex justify-between items-center px-6 py-4 h-[60px]">
          <button
            className="text-lg font-bold text-black flex items-center gap-2 pl-10"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
              setActiveSubMenu(null);
            }}
          >
            {isOpen ? "✖" : "☰"} <span className="text-sm text-gray-700">Menu</span>
          </button>

          {/* Logo */}
          <motion.div
            className="font-bold left-1/2 transform -translate-x-1/2 cursor-pointer"
            animate={{
              scale: pathname === "/" && !isScrolled ? (isMobile ? 5 : 12) : 1,
              top: pathname === "/" && !isScrolled ? "50%" : "15px",
              y: pathname === "/" && !isScrolled ? "-50%" : "0%",
              color: pathname === "/" && !isScrolled ? "#f5f5f5" : "#000000",
              fontSize: isMobile ? "16px" : "24px",
            }}
            transition={{
              scale: { duration: 0.6, ease: "easeInOut" },
              top: { duration: 0.6, ease: "easeInOut" },
              y: { duration: 0.6, ease: "easeInOut" },
              color: { duration: 0.8, ease: "easeInOut" },
              fontSize: { duration: 0.3, ease: "easeInOut" },
            }}
            style={{
              position: "fixed",
              left: "50%",
              transform: "translate(-50%, -50%)",
              whiteSpace: "nowrap",
            }}
            onClick={() => navigateWithLoader("/")}
          >
            <Link href="/" className="flex items-center justify-center">
              <span style={{ 
                fontSize: "1.2em", 
                fontWeight: "600",
                letterSpacing: "0.05em",
                position: "relative",
                display: "inline-block",
                transform: "translateY(-4px)"
              }}>
                AISH<sup style={{ 
                  fontSize: "0.35em", 
                  position: "absolute",
                  top: "7px",
                  right: "-8px",
                  lineHeight: "1"
                }}>®</sup>
              </span>
            </Link>
          </motion.div>

          <div className="flex gap-5 text-base text-black pr-10">
            <FiSearch className="cursor-pointer hover:opacity-70" onClick={() => setIsSearchOpen(!isSearchOpen)} />
            <div className="relative">
              <FiShoppingCart
                data-testid="cart-icon"
                className="cursor-pointer hover:opacity-70"
                onClick={() => setIsCartOpen(prev => !prev)}
              />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </div>
            <FiUser
              className="cursor-pointer hover:opacity-70"
              onClick={() => setIsUserOpen(!isUserOpen)}
            />
          </div>
        </div>

        {pathname === "/" && !isOpen && !isScrolled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-700 font-semibold ${isMobile ? 'text-[10px]' : 'text-[12px]'}`}
          >
            {isMobile ? (
              "We truly appreciate it."
            ) : (
              "Thank you for choosing AISH. We truly appreciate it."
            )}
          </motion.div>
        )}

        {isSearchOpen && <SearchBar isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />}

        {isCartOpen && (
          <CartDropdown
            navigateWithLoader={navigateWithLoader}
          />
        )}

        {isUserOpen && (
          <UserDropdown
            isUserOpen={isUserOpen}
            setIsUserOpen={setIsUserOpen}
            isLoggedIn={isLoggedIn}
            navigateWithLoader={navigateWithLoader}
          />
        )}

        <MenuDropdown
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          menuItems={menuItems}
          activeSubMenu={activeSubMenu}
          setActiveSubMenu={setActiveSubMenu}
          handleNavigation={handleNavigation}
        >
        </MenuDropdown>
      </nav>
    </>
  );
}

const userDropdownStyles = {
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'white',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    borderRadius: '4px',
    minWidth: '200px',
    zIndex: 1000,
  },
  dropdownContent: {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 0',
  },
  dropdownItem: {
    padding: '8px 16px',
    color: '#333',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#f5f5f5',
    },
  },
};