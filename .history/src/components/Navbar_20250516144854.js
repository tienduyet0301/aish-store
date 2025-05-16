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
import { useSession } from "next-auth/react";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [hoveredSubItem, setHoveredSubItem] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [targetPath, setTargetPath] = useState(null);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { isCartOpen, setIsCartOpen, cartItems, toggleCart } = useCart();
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;
  const { t } = useLanguage();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    { title: t('navbar.all'), key: 'all', subItems: [] },
    {
      title: t('navbar.store'),
      key: 'store',
      subItems: [
        { 
          title: t('navbar.tops'), 
          key: 'tops',
          subItems: [
            { title: t('navbar.tshirt'), key: 'tshirt' },
            { title: t('navbar.shirt'), key: 'shirt' },
            { title: t('navbar.polo'), key: 'polo' },
            { title: t('navbar.sweater'), key: 'sweater' },
            { title: t('navbar.hoodie'), key: 'hoodie' }
          ] 
        },
        { 
          title: t('navbar.bottoms'), 
          key: 'bottoms',
          subItems: [
            { title: t('navbar.pants'), key: 'pants' },
            { title: t('navbar.short'), key: 'short' },
            { title: t('navbar.skirt'), key: 'skirt' }
          ] 
        },
        { 
          title: t('navbar.accessories'), 
          key: 'accessories',
          subItems: [
            { title: t('navbar.cap'), key: 'cap' },
            { title: t('navbar.keychain'), key: 'keychain' },
            { title: t('navbar.towel'), key: 'towel' }
          ] 
        },
      ],
    },
    {
      title: t('navbar.collection'),
      key: 'collection',
      subItems: [
        { title: t('navbar.acceptProblem'), key: 'accept-problem', subItems: [] },
        { title: t('navbar.backToSummer'), key: 'back-to-summer', subItems: [] },
        { title: t('navbar.chillCalmDown'), key: 'chill-calm-down', subItems: [] },
      ],
    },
    {
      title: t('common.service'),
      key: 'service',
      subItems: [
        { title: t('common.returnPolicy'), key: 'return-policy', subItems: [] },
        { title: t('common.warrantyPolicy'), key: 'warranty-policy', subItems: [] },
        { title: t('common.careInstructions'), key: 'care-instructions', subItems: [] },
      ],
    },
    { title: t('navbar.aboutUs'), key: 'about-us', subItems: [] },
  ];

  const navigateWithLoader = (path) => {
    if (path !== pathname) {
      setTargetPath(path);
      router.push(path);
    }
  };

  const handleNavigation = (parentKey, subItemKey) => {
    // Map of menu items to their fixed paths
    const pathMap = {
      'all': '/products',
      'about-us': '/about-us',
      'return-policy': '/return-policy',
      'warranty-policy': '/warranty-policy',
      'care-instructions': '/care-instructions',
      'accept-problem': '/collection/accept-problem',
      'back-to-summer': '/collection/back-to-summer',
      'chill-calm-down': '/collection/chill-calm-down',
      'tshirt': '/tops/tshirt',
      'shirt': '/tops/shirt',
      'polo': '/tops/polo',
      'sweater': '/tops/sweater',
      'hoodie': '/tops/hoodie',
      'pants': '/bottoms/pants',
      'short': '/bottoms/short',
      'skirt': '/bottoms/skirt',
      'cap': '/accessories/cap',
      'keychain': '/accessories/keychain',
      'towel': '/accessories/towel'
    };

    // Get the path from the map using the subItemKey
    const path = pathMap[subItemKey];
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
        <div className="relative flex justify-between items-center px-4 md:px-6 py-3 md:py-4 h-[50px] md:h-[60px]">
          <button
            className="text-base md:text-lg font-bold text-black flex items-center gap-1 md:gap-2 pl-2 md:pl-10"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
              setActiveSubMenu(null);
            }}
          >
            {isOpen ? "✖" : "☰"} <span className="text-xs md:text-sm text-gray-700">{t('navbar.menu')}</span>
          </button>

          {/* Logo */}
          <motion.div
            className="font-bold left-1/2 transform -translate-x-1/2 cursor-pointer"
            animate={{
              scale: pathname === "/" && !isScrolled ? (isMobile ? 6 : 12) : 1,
              top: pathname === "/" && !isScrolled ? "50%" : "15px",
              y: pathname === "/" && !isScrolled ? "-50%" : "0%",
              color: pathname === "/" && !isScrolled ? "#f5f5f5" : "#000000",
              fontSize: isMobile ? "20px" : "24px",
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
                fontSize: isMobile ? "1.1em" : "1.2em", 
                fontWeight: "700",
                letterSpacing: "0.05em",
                position: "relative",
                display: "inline-block",
                transform: isMobile ? "translateY(-2px)" : "translateY(-4px)",
                fontFamily: "'Roboto', Arial, Helvetica, sans-serif"
              }}>
                AISH<sup style={{ 
                  fontSize: isMobile ? "0.32em" : "0.35em", 
                  position: "absolute",
                  top: isMobile ? "6px" : "7px",
                  right: isMobile ? "-7px" : "-8px",
                  lineHeight: "1"
                }}>®</sup>
              </span>
            </Link>
          </motion.div>

          <div className="flex gap-3 md:gap-5 text-sm md:text-base text-black pr-2 md:pr-10">
            <FiSearch className="cursor-pointer hover:opacity-70" onClick={() => setIsSearchOpen(!isSearchOpen)} />
            <div className="flex items-center gap-1">
              <FiShoppingCart
                data-testid="cart-icon"
                className="cursor-pointer hover:opacity-70"
                onClick={() => setIsCartOpen(prev => !prev)}
              />
              {isMounted && cartItems.length > 0 && (
                <span className="text-[10px] md:text-xs text-black">
                  ({cartItems.length})
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
              t('navbar.thankYouMobile')
            ) : (
              t('navbar.thankYou')
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
          hoveredSubItem={hoveredSubItem}
          setHoveredSubItem={setHoveredSubItem}
          handleNavigation={handleNavigation}
        />
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