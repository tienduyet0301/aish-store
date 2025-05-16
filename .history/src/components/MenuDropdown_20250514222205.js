"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

export default function MenuDropdown({
  isOpen,
  setIsOpen,
  menuItems,
  activeSubMenu,
  setActiveSubMenu,
  handleNavigation,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileSubMenu, setActiveMobileSubMenu] = useState(null);
  const menuRef = useRef(null);
  const router = useRouter();

  const handleMenuClick = (itemTitle, subTitle) => {
    if (itemTitle === "ALL") {
      router.push('/products');
      setIsOpen(false);
      return;
    }
    if (itemTitle === "ABOUT US") {
      router.push('/about-us');
      setIsOpen(false);
      return;
    }
    if (itemTitle === "TSHIRT") {
      router.push('/tshirt');
      setIsOpen(false);
      return;
    }
    if (itemTitle === "SHIRT") {
      router.push('/shirt');
      setIsOpen(false);
      return;
    }
    if (itemTitle === "POLO") {
      router.push('/polo');
      setIsOpen(false);
      return;
    }
    if (itemTitle === "SWEATER") {
      router.push('/sweater');
      setIsOpen(false);
      return;
    }
    if (itemTitle === "HOODIE") {
      router.push('/hoodie');
      setIsOpen(false);
      return;
    }
    if (itemTitle === "ACCEPT THE PROBLEM") {
      router.push('/accept-the-problem');
      setIsOpen(false);
      return;
    }
    if (itemTitle === "BACK TO SUMMER") {
      router.push('/back-to-summer');
      setIsOpen(false);
      return;
    }
    if (itemTitle === "CHILL, CALM DOWN") {
      router.push('/chill-calm-down');
      setIsOpen(false);
      return;
    }
    if (itemTitle === "RETURN POLICY") {
      router.push('/return-policy');
      setIsOpen(false);
      return;
    }
    if (itemTitle === "WARRANTY POLICY") {
      router.push('/warranty-policy');
      setIsOpen(false);
      return;
    }
    if (itemTitle === "CARE INSTRUCTIONS") {
      router.push('/care-instructions');
      setIsOpen(false);
      return;
    }
    handleNavigation(itemTitle, subTitle);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !event.target.closest(".menu-item")
      ) {
        console.log("Clicked outside, closing menu", event.target);
        setIsOpen(false);
        setActiveSubMenu(null);
        setActiveMobileSubMenu(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen, setIsOpen]);

  // Desktop Menu
  const DesktopMenu = () => (
    <div
      ref={menuRef}
      className="absolute top-full left-0 w-1/2 h-screen bg-white shadow-lg p-4 overflow-y-auto flex"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-1/2 flex flex-col gap-2 text-xs font-semibold text-black">
        {menuItems.map((item, index) => (
          <div key={index} className="p-2">
            <span 
              className={`text-sm text-gray-800 relative inline-block group ${
                item.title === "ALL" || item.title === "ABOUT US" ? "cursor-pointer" : ""
              }`}
              onClick={() => {
                if (item.title === "ALL" || item.title === "ABOUT US") {
                  handleMenuClick(item.title);
                }
              }}
            >
              {item.title}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full"></span>
            </span>
            <div className="flex flex-col mt-2 text-xs font-normal">
              {item.subItems.map((sub, subIndex) => (
                <div
                  key={subIndex}
                  className="relative p-2 cursor-pointer group menu-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (sub.subItems.length > 0) {
                      setActiveSubMenu(activeSubMenu === sub.title ? null : sub.title);
                    }
                  }}
                >
                  <span className="relative inline-block">
                    {sub.title}
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gray-500 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                  {sub.subItems.length > 0 && (
                    <span className="text-[8px] absolute right-2">▶</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {activeSubMenu && (
        <div className="w-1/2 h-full bg-white p-4 flex flex-col justify-start">
          {menuItems.flatMap((item) => item.subItems).map((sub, subIndex) =>
            activeSubMenu === sub.title && sub.subItems.length > 0 ? (
              <div
                key={subIndex}
                className="h-full bg-white shadow-md p-4 text-xs text-gray-700 space-y-4"
              >
                {sub.subItems.map((nested, nestedIndex) => (
                  <div
                    key={nestedIndex}
                    className="p-3 cursor-pointer border-b border-gray-200 group menu-item"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <span className="relative inline-block">
                      {nested}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gray-500 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </div>
                ))}
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );

  // Mobile Menu
  const MobileMenu = () => (
    <div
      ref={menuRef}
      className="fixed top-[60px] left-0 w-[80%] max-w-[300px] max-h-[70vh] bg-white shadow-lg z-50 overflow-auto p-3 rounded-b-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-2 text-xs font-semibold text-black">
        {menuItems.map((item, index) => (
          <div key={index} className="mb-1">
            <span 
              className={`text-sm text-gray-800 block font-bold ${
                item.title === "ALL" || item.title === "ABOUT US" ? "cursor-pointer" : ""
              }`}
              onClick={() => {
                if (item.title === "ALL" || item.title === "ABOUT US") {
                  handleMenuClick(item.title);
                }
              }}
            >
              {item.title}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full"></span>
            </span>
            <div className="flex flex-col mt-1 space-y-1 text-[10px] font-normal">
              {item.subItems.map((sub, subIndex) => (
                <div
                  key={subIndex}
                  className="flex flex-col bg-gray-50 rounded-md p-1 cursor-pointer menu-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (sub.subItems.length > 0) {
                      setActiveMobileSubMenu(
                        activeMobileSubMenu === sub.title ? null : sub.title
                      );
                    }
                  }}
                >
                  <div className="flex items-center justify-between w-full relative group">
                    <span className="text-[11px] relative inline-block">
                      {sub.title}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gray-500 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                    {sub.subItems.length > 0 && (
                      <span className="text-[9px] text-gray-500">
                        {activeMobileSubMenu === sub.title ? "▼" : "▶"}
                      </span>
                    )}
                  </div>
                  {sub.subItems.length > 0 && activeMobileSubMenu === sub.title && (
                    <div className="mt-1 pl-2 space-y-1 text-[10px] text-gray-700">
                      {sub.subItems.map((nested, nestedIndex) => (
                        <div
                          key={nestedIndex}
                          className="p-1 bg-gray-100 rounded-md cursor-pointer menu-item"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <span>{nested}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const MemoizedDesktopMenu = useMemo(() => <DesktopMenu />, [menuItems, activeSubMenu]);
  const MemoizedMobileMenu = useMemo(() => <MobileMenu />, [menuItems, activeMobileSubMenu]);

  return (
    <>
      {isOpen && !isMobile && (
        <div
          className="fixed top-[60px] left-1/2 w-1/2 h-[calc(100%-60px)] backdrop-blur-md z-40 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        />
      )}
      {isOpen && (isMobile ? MemoizedMobileMenu : MemoizedDesktopMenu)}
    </>
  );
}