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

  const handleMenuClick = (itemKey, subItemKey) => {
    if (itemKey === "all") {
      router.push('/products');
      setIsOpen(false);
      return;
    }
    if (itemKey === "about-us") {
      router.push('/about-us');
      setIsOpen(false);
      return;
    }
    handleNavigation(itemKey, subItemKey);
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
                item.key === "store" || item.key === "collection" || item.key === "service" ? "" : "cursor-pointer"
              }`}
              onClick={() => {
                if (item.key === "store" || item.key === "collection" || item.key === "service") {
                  // Không làm gì cả
                } else {
                  handleMenuClick(item.key);
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
                      setActiveSubMenu(activeSubMenu === sub.key ? null : sub.key);
                    } else {
                      handleMenuClick(item.key, sub.key);
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
            activeSubMenu === sub.key && sub.subItems.length > 0 ? (
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
                      handleMenuClick(sub.key, nested.key);
                    }}
                  >
                    <span className="relative inline-block">
                      {nested.title}
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
      className="fixed top-[60px] left-0 w-full h-[calc(100vh-10px)] bg-white shadow-lg z-50 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex h-full">
        {/* Left side - Main menu */}
        <div className="w-1/2 h-full overflow-y-auto p-3 border-r border-gray-100">
          <div className="flex flex-col gap-2 text-xs font-semibold text-black">
            {menuItems.map((item, index) => (
              <div key={index} className="p-2">
                <span 
                  className={`text-sm text-gray-800 relative inline-block group ${
                    item.key === "store" || item.key === "collection" || item.key === "service" ? "" : "cursor-pointer"
                  }`}
                  onClick={() => {
                    if (item.key === "store" || item.key === "collection" || item.key === "service") {
                      // Không làm gì cả
                    } else {
                      handleMenuClick(item.key);
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
                          setActiveMobileSubMenu(activeMobileSubMenu === sub.key ? null : sub.key);
                        } else {
                          handleMenuClick(item.key, sub.key);
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
        </div>

        {/* Right side - Submenu */}
        {activeMobileSubMenu && (
          <div className="w-1/2 h-full overflow-y-auto bg-white p-3">
            {menuItems.flatMap((item) => item.subItems).map((sub, subIndex) =>
              activeMobileSubMenu === sub.key && sub.subItems.length > 0 ? (
                <div
                  key={subIndex}
                  className="h-full bg-white text-xs text-gray-700 space-y-2"
                >
                  {sub.subItems.map((nested, nestedIndex) => (
                    <div
                      key={nestedIndex}
                      className="p-2 cursor-pointer border-b border-gray-100 group menu-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuClick(sub.key, nested.key);
                      }}
                    >
                      <span className="relative inline-block">
                        {nested.title}
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