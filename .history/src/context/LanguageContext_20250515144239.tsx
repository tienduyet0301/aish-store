"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Language = 'en' | 'vi';

type TranslationKey = 
  // Common
  | 'common.login'
  | 'common.register'
  | 'common.continue'
  | 'common.back'
  | 'common.email'
  | 'common.password'
  | 'common.firstName'
  | 'common.lastName'
  | 'common.dateOfBirth'
  | 'common.month'
  | 'common.day'
  | 'common.year'
  | 'common.forgotPassword'
  | 'common.sendNewPassword'
  | 'common.sending'
  | 'common.continueWithGoogle'
  | 'common.continueWithEmail'
  | 'common.signInWithEmail'
  | 'common.or'
  | 'common.joinMyAish'
  | 'common.myAishAccount'
  | 'common.forgotPasswordText'
  | 'common.backToLogin'
  | 'common.english'
  | 'common.vietnamese'
  | 'common.contact'
  | 'common.follow'
  | 'common.service'
  | 'common.about'
  | 'common.language'
  | 'common.returnPolicy'
  | 'common.warrantyPolicy'
  | 'common.careInstructions'
  // Search
  | 'search.placeholder'
  | 'search.cancel'
  | 'search.noResults'
  | 'search.error'
  // Navbar
  | 'navbar.search'
  | 'navbar.cart'
  | 'navbar.wishlist'
  | 'navbar.account'
  | 'navbar.menu'
  | 'navbar.all'
  | 'navbar.store'
  | 'navbar.tops'
  | 'navbar.tshirt'
  | 'navbar.shirt'
  | 'navbar.polo'
  | 'navbar.sweater'
  | 'navbar.hoodie'
  | 'navbar.bottoms'
  | 'navbar.pants'
  | 'navbar.short'
  | 'navbar.skirt'
  | 'navbar.accessories'
  | 'navbar.cap'
  | 'navbar.keychain'
  | 'navbar.towel'
  | 'navbar.collection'
  | 'navbar.acceptProblem'
  | 'navbar.backToSummer'
  | 'navbar.chillCalmDown'
  | 'navbar.aboutUs'
  | 'navbar.thankYou'
  | 'navbar.thankYouMobile'
  // Home
  | 'home.hero.title'
  | 'home.hero.subtitle'
  | 'home.hero.cta'
  | 'home.featured.title'
  | 'home.featured.viewAll'
  | 'home.categories.title'
  | 'home.categories.viewAll'
  // Product
  | 'product.addToCart'
  | 'product.addToWishlist'
  | 'product.removeFromWishlist'
  | 'product.size'
  | 'product.color'
  | 'product.quantity'
  | 'product.description'
  | 'product.details'
  | 'product.shipping'
  | 'product.returns'
  | 'product.noImage'
  | 'product.unnamed'
  | 'product.soldOut'
  | 'product.shopThis'
  // Cart
  | 'cart.title'
  | 'cart.empty'
  | 'cart.continueShopping'
  | 'cart.subtotal'
  | 'cart.shipping'
  | 'cart.total'
  | 'cart.checkout'
  | 'cart.remove'
  | 'cart.update'
  | 'cart.viewCart'
  // Checkout
  | 'checkout.title'
  | 'checkout.shipping'
  | 'checkout.payment'
  | 'checkout.review'
  | 'checkout.placeOrder'
  | 'checkout.address'
  | 'checkout.city'
  | 'checkout.country'
  | 'checkout.phone'
  | 'checkout.cardNumber'
  | 'checkout.expiry'
  | 'checkout.cvv'
  // Validation
  | 'validation.requiredEmail'
  | 'validation.requiredPassword'
  | 'validation.requiredFirstName'
  | 'validation.requiredLastName'
  | 'validation.requiredDate'
  | 'validation.requiredUpdates'
  | 'validation.invalidEmail'
  // Updates
  | 'updates.title'
  | 'updates.description'
  // Care Instructions
  | 'care.title'
  | 'care.description'
  | 'care.washing.title'
  | 'care.washing.tip1'
  | 'care.washing.tip2'
  | 'care.washing.tip3'
  | 'care.washing.tip4'
  | 'care.drying.title'
  | 'care.drying.tip1'
  | 'care.drying.tip2'
  | 'care.drying.tip3'
  | 'care.ironing.title'
  | 'care.ironing.tip1'
  | 'care.ironing.tip2'
  | 'care.ironing.tip3'
  | 'care.storage.title'
  | 'care.storage.tip1'
  | 'care.storage.tip2'
  | 'care.storage.tip3'
  | 'care.footer';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

type Translations = {
  [key in Language]: {
    [key in TranslationKey]: string;
  };
};

const translations: Translations = {
  en: {
    // Common
    'common.login': 'LOGIN',
    'common.register': 'REGISTER',
    'common.continue': 'CONTINUE',
    'common.back': 'Back',
    'common.email': 'EMAIL*',
    'common.password': 'PASSWORD*',
    'common.firstName': 'FIRST NAME*',
    'common.lastName': 'LAST NAME*',
    'common.dateOfBirth': 'DATE OF BIRTH',
    'common.month': 'MONTH*',
    'common.day': 'DAY*',
    'common.year': 'YEAR*',
    'common.forgotPassword': 'FORGOT PASSWORD',
    'common.sendNewPassword': 'Send new password',
    'common.sending': 'Sending...',
    'common.continueWithGoogle': 'CONTINUE WITH GOOGLE',
    'common.continueWithEmail': 'CONTINUE WITH YOUR EMAIL ADDRESS',
    'common.signInWithEmail': 'Sign in with your email and password or create a profile if you are new',
    'common.or': 'OR',
    'common.joinMyAish': 'JOIN MY AISH',
    'common.myAishAccount': 'MY AISH ACCOUNT',
    'common.forgotPasswordText': "Don't worry! It happens. Please enter your email address and we'll send you a new password.",
    'common.backToLogin': 'Back to login',
    'common.english': 'ENGLISH',
    'common.vietnamese': 'VIETNAMESE',
    'common.contact': 'CONTACT US',
    'common.follow': 'FOLLOW US',
    'common.service': 'SERVICE',
    'common.about': 'ABOUT AISH',
    'common.language': 'LANGUAGE',
    'common.returnPolicy': 'RETURN POLICY',
    'common.warrantyPolicy': 'WARRANTY POLICY',
    'common.careInstructions': 'CARE INSTRUCTIONS',
    // Search
    'search.placeholder': 'What are you looking for?',
    'search.cancel': 'Cancel',
    'search.noResults': 'No products found',
    'search.error': 'Unable to search products',
    // Navbar
    'navbar.search': 'SEARCH',
    'navbar.cart': 'CART',
    'navbar.wishlist': 'WISHLIST',
    'navbar.account': 'ACCOUNT',
    'navbar.menu': 'MENU',
    'navbar.all': 'ALL',
    'navbar.store': 'STORE',
    'navbar.tops': 'TOPS',
    'navbar.tshirt': 'TSHIRT',
    'navbar.shirt': 'SHIRT',
    'navbar.polo': 'POLO',
    'navbar.sweater': 'SWEATER',
    'navbar.hoodie': 'HOODIE',
    'navbar.bottoms': 'BOTTOMS',
    'navbar.pants': 'PANTS',
    'navbar.short': 'SHORT',
    'navbar.skirt': 'SKIRT',
    'navbar.accessories': 'ACCESSORIES',
    'navbar.cap': 'CAP',
    'navbar.keychain': 'KEYCHAIN',
    'navbar.towel': 'TOWEL',
    'navbar.collection': 'COLLECTION',
    'navbar.acceptProblem': 'ACCEPT THE PROBLEM',
    'navbar.backToSummer': 'BACK TO SUMMER',
    'navbar.chillCalmDown': 'CHILL, CALM DOWN',
    'navbar.aboutUs': 'ABOUT US',
    'navbar.thankYou': 'Thank you for choosing AISH. We truly appreciate it.',
    'navbar.thankYouMobile': 'We truly appreciate it.',
    // Home
    'home.hero.title': 'DISCOVER YOUR STYLE',
    'home.hero.subtitle': 'Explore our latest collection',
    'home.hero.cta': 'SHOP NOW',
    'home.featured.title': 'FEATURED PRODUCTS',
    'home.featured.viewAll': 'VIEW ALL',
    'home.categories.title': 'SHOP BY CATEGORY',
    'home.categories.viewAll': 'VIEW ALL',
    // Product
    'product.addToCart': 'ADD TO CART',
    'product.addToWishlist': 'ADD TO WISHLIST',
    'product.removeFromWishlist': 'REMOVE FROM WISHLIST',
    'product.size': 'SIZE',
    'product.color': 'COLOR',
    'product.quantity': 'QUANTITY',
    'product.description': 'DESCRIPTION',
    'product.details': 'DETAILS',
    'product.shipping': 'SHIPPING',
    'product.returns': 'RETURNS',
    'product.noImage': 'No image',
    'product.unnamed': 'Unnamed product',
    'product.soldOut': 'SOLD OUT',
    'product.shopThis': 'SHOP THIS',
    // Cart
    'cart.title': 'YOUR CART',
    'cart.empty': 'Your cart is empty!',
    'cart.continueShopping': 'CONTINUE SHOPPING',
    'cart.subtotal': 'SUBTOTAL',
    'cart.shipping': 'SHIPPING',
    'cart.total': 'TOTAL',
    'cart.checkout': 'CHECKOUT',
    'cart.remove': 'REMOVE',
    'cart.update': 'UPDATE',
    'cart.viewCart': 'VIEW CART',
    // Checkout
    'checkout.title': 'CHECKOUT',
    'checkout.shipping': 'SHIPPING INFORMATION',
    'checkout.payment': 'PAYMENT METHOD',
    'checkout.review': 'REVIEW ORDER',
    'checkout.placeOrder': 'PLACE ORDER',
    'checkout.address': 'ADDRESS',
    'checkout.city': 'CITY',
    'checkout.country': 'COUNTRY',
    'checkout.phone': 'PHONE',
    'checkout.cardNumber': 'CARD NUMBER',
    'checkout.expiry': 'EXPIRY DATE',
    'checkout.cvv': 'CVV',
    // Validation
    'validation.requiredEmail': 'Please enter a valid email address',
    'validation.requiredPassword': 'Please enter a valid password',
    'validation.requiredFirstName': 'Please enter your first name',
    'validation.requiredLastName': 'Please enter your last name',
    'validation.requiredDate': 'Please enter your full date of birth',
    'validation.requiredUpdates': 'You must agree to receive updates',
    'validation.invalidEmail': 'Invalid email format',
    // Updates
    'updates.title': 'I would like to receive updates',
    'updates.description': 'I would like to receive updates (including by email, SMS, MMS, social media, phone...) about AISH new activities, exclusive products, tailored services and to have a personalised client experience based on my interests.',
    // Care Instructions
    'care.title': 'CARE INSTRUCTIONS',
    'care.description': 'Follow these guidelines to maintain the quality and longevity of your AISH products.',
    'care.washing.title': 'WASHING',
    'care.washing.tip1': 'Machine wash cold (30°C) with similar colors',
    'care.washing.tip2': 'Use mild detergent and avoid bleach',
    'care.washing.tip3': 'Turn garments inside out before washing',
    'care.washing.tip4': 'Do not soak for extended periods',
    'care.drying.title': 'DRYING',
    'care.drying.tip1': 'Tumble dry on low heat',
    'care.drying.tip2': 'Remove promptly when dry',
    'care.drying.tip3': 'Avoid direct sunlight',
    'care.ironing.title': 'IRONING',
    'care.ironing.tip1': 'Iron on reverse side',
    'care.ironing.tip2': 'Use low to medium heat',
    'care.ironing.tip3': 'Do not iron over prints or embellishments',
    'care.storage.title': 'STORAGE',
    'care.storage.tip1': 'Store in a cool, dry place',
    'care.storage.tip2': 'Keep away from direct sunlight',
    'care.storage.tip3': 'Fold neatly to prevent wrinkles',
    'care.footer': 'For specific care instructions, please refer to the care label on your garment.'
  },
  vi: {
    // Common
    'common.login': 'ĐĂNG NHẬP',
    'common.register': 'ĐĂNG KÝ',
    'common.continue': 'TIẾP TỤC',
    'common.back': 'Quay lại',
    'common.email': 'EMAIL*',
    'common.password': 'MẬT KHẨU*',
    'common.firstName': 'TÊN*',
    'common.lastName': 'HỌ*',
    'common.dateOfBirth': 'NGÀY SINH',
    'common.month': 'THÁNG*',
    'common.day': 'NGÀY*',
    'common.year': 'NĂM*',
    'common.forgotPassword': 'QUÊN MẬT KHẨU',
    'common.sendNewPassword': 'Gửi mật khẩu mới',
    'common.sending': 'Đang gửi...',
    'common.continueWithGoogle': 'TIẾP TỤC VỚI GOOGLE',
    'common.continueWithEmail': 'TIẾP TỤC VỚI EMAIL CỦA BẠN',
    'common.signInWithEmail': 'Đăng nhập bằng email và mật khẩu hoặc tạo hồ sơ mới nếu bạn chưa có',
    'common.or': 'HOẶC',
    'common.joinMyAish': 'THAM GIA MY AISH',
    'common.myAishAccount': 'TÀI KHOẢN MY AISH',
    'common.forgotPasswordText': 'Đừng lo! Chuyện này thường xảy ra. Vui lòng nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn mật khẩu mới.',
    'common.backToLogin': 'Quay lại đăng nhập',
    'common.english': 'ENGLISH',
    'common.vietnamese': 'TIẾNG VIỆT',
    'common.contact': 'LIÊN HỆ',
    'common.follow': 'THEO DÕI',
    'common.service': 'DỊCH VỤ',
    'common.about': 'VỀ AISH',
    'common.language': 'NGÔN NGỮ',
    'common.returnPolicy': 'CHÍNH SÁCH ĐỔI TRẢ',
    'common.warrantyPolicy': 'CHÍNH SÁCH BẢO HÀNH',
    'common.careInstructions': 'HƯỚNG DẪN BẢO QUẢN',
    // Search
    'search.placeholder': 'Bạn đang tìm gì?',
    'search.cancel': 'Hủy',
    'search.noResults': 'Không tìm thấy sản phẩm',
    'search.error': 'Không thể tìm kiếm sản phẩm',
    // Navbar
    'navbar.search': 'TÌM KIẾM',
    'navbar.cart': 'GIỎ HÀNG',
    'navbar.wishlist': 'YÊU THÍCH',
    'navbar.account': 'TÀI KHOẢN',
    'navbar.menu': 'MENU',
    'navbar.all': 'TẤT CẢ',
    'navbar.store': 'CỬA HÀNG',
    'navbar.tops': 'ÁO',
    'navbar.tshirt': 'ÁO THUN',
    'navbar.shirt': 'ÁO SƠ MI',
    'navbar.polo': 'ÁO POLO',
    'navbar.sweater': 'ÁO LEN',
    'navbar.hoodie': 'ÁO NỈ',
    'navbar.bottoms': 'QUẦN',
    'navbar.pants': 'QUẦN DÀI',
    'navbar.short': 'QUẦN SHORT',
    'navbar.skirt': 'VÁY',
    'navbar.accessories': 'PHỤ KIỆN',
    'navbar.cap': 'MŨ',
    'navbar.keychain': 'MÓC KHÓA',
    'navbar.towel': 'KHĂN',
    'navbar.collection': 'BỘ SƯU TẬP',
    'navbar.acceptProblem': 'CHẤP NHẬN VẤN ĐỀ',
    'navbar.backToSummer': 'TRỞ LẠI MÙA HÈ',
    'navbar.chillCalmDown': 'THƯ GIÃN, BÌNH TĨNH',
    'navbar.aboutUs': 'VỀ CHÚNG TÔI',
    'navbar.thankYou': 'Cảm ơn bạn đã chọn AISH. Chúng tôi thực sự trân trọng điều đó.',
    'navbar.thankYouMobile': 'Chúng tôi thực sự trân trọng điều đó.',
    // Home
    'home.hero.title': 'KHÁM PHÁ PHONG CÁCH CỦA BẠN',
    'home.hero.subtitle': 'Khám phá bộ sưu tập mới nhất của chúng tôi',
    'home.hero.cta': 'MUA NGAY',
    'home.featured.title': 'SẢN PHẨM NỔI BẬT',
    'home.featured.viewAll': 'XEM TẤT CẢ',
    'home.categories.title': 'MUA THEO DANH MỤC',
    'home.categories.viewAll': 'XEM TẤT CẢ',
    // Product
    'product.addToCart': 'THÊM VÀO GIỎ',
    'product.addToWishlist': 'THÊM VÀO YÊU THÍCH',
    'product.removeFromWishlist': 'XÓA KHỎI YÊU THÍCH',
    'product.size': 'KÍCH THƯỚC',
    'product.color': 'MÀU SẮC',
    'product.quantity': 'SỐ LƯỢNG',
    'product.description': 'MÔ TẢ',
    'product.details': 'CHI TIẾT',
    'product.shipping': 'VẬN CHUYỂN',
    'product.returns': 'ĐỔI TRẢ',
    'product.noImage': 'Không có hình ảnh',
    'product.unnamed': 'Sản phẩm chưa đặt tên',
    'product.soldOut': 'HẾT HÀNG',
    'product.shopThis': 'MUA NGAY',
    // Cart
    'cart.title': 'GIỎ HÀNG CỦA BẠN',
    'cart.empty': 'Giỏ hàng của bạn đang trống!',
    'cart.continueShopping': 'TIẾP TỤC MUA SẮM',
    'cart.subtotal': 'TẠM TÍNH',
    'cart.shipping': 'PHÍ VẬN CHUYỂN',
    'cart.total': 'TỔNG CỘNG',
    'cart.checkout': 'THANH TOÁN',
    'cart.remove': 'XÓA',
    'cart.update': 'CẬP NHẬT',
    'cart.viewCart': 'XEM GIỎ HÀNG',
    // Checkout
    'checkout.title': 'THANH TOÁN',
    'checkout.shipping': 'THÔNG TIN GIAO HÀNG',
    'checkout.payment': 'PHƯƠNG THỨC THANH TOÁN',
    'checkout.review': 'KIỂM TRA ĐƠN HÀNG',
    'checkout.placeOrder': 'ĐẶT HÀNG',
    'checkout.address': 'ĐỊA CHỈ',
    'checkout.city': 'THÀNH PHỐ',
    'checkout.country': 'QUỐC GIA',
    'checkout.phone': 'ĐIỆN THOẠI',
    'checkout.cardNumber': 'SỐ THẺ',
    'checkout.expiry': 'NGÀY HẾT HẠN',
    'checkout.cvv': 'CVV',
    // Validation
    'validation.requiredEmail': 'Vui lòng nhập địa chỉ email hợp lệ',
    'validation.requiredPassword': 'Vui lòng nhập mật khẩu hợp lệ',
    'validation.requiredFirstName': 'Vui lòng nhập tên của bạn',
    'validation.requiredLastName': 'Vui lòng nhập họ của bạn',
    'validation.requiredDate': 'Vui lòng nhập đầy đủ ngày sinh',
    'validation.requiredUpdates': 'Bạn phải đồng ý nhận cập nhật',
    'validation.invalidEmail': 'Định dạng email không hợp lệ',
    // Updates
    'updates.title': 'Tôi muốn nhận cập nhật',
    'updates.description': 'Tôi muốn nhận cập nhật (bao gồm qua email, SMS, MMS, mạng xã hội, điện thoại...) về các hoạt động mới của AISH, sản phẩm độc quyền, dịch vụ được tùy chỉnh và có trải nghiệm khách hàng cá nhân hóa dựa trên sở thích của tôi.',
    // Care Instructions
    'care.title': 'HƯỚNG DẪN BẢO QUẢN',
    'care.description': 'Làm theo các hướng dẫn sau để duy trì chất lượng và tuổi thọ của sản phẩm AISH.',
    'care.washing.title': 'GIẶT',
    'care.washing.tip1': 'Giặt máy nước lạnh (30°C) với màu tương tự',
    'care.washing.tip2': 'Sử dụng bột giặt nhẹ và tránh chất tẩy trắng',
    'care.washing.tip3': 'Lộn trái quần áo trước khi giặt',
    'care.washing.tip4': 'Không ngâm trong thời gian dài',
    'care.drying.title': 'PHƠI KHÔ',
    'care.drying.tip1': 'Sấy khô ở nhiệt độ thấp',
    'care.drying.tip2': 'Lấy ra ngay khi khô',
    'care.drying.tip3': 'Tránh ánh nắng trực tiếp',
    'care.ironing.title': 'ỦI',
    'care.ironing.tip1': 'Ủi ở mặt trái',
    'care.ironing.tip2': 'Sử dụng nhiệt độ thấp đến trung bình',
    'care.ironing.tip3': 'Không ủi lên họa tiết hoặc trang trí',
    'care.storage.title': 'BẢO QUẢN',
    'care.storage.tip1': 'Cất ở nơi mát mẻ, khô ráo',
    'care.storage.tip2': 'Tránh ánh nắng trực tiếp',
    'care.storage.tip3': 'Gấp gọn gàng để tránh nhăn',
    'care.footer': 'Để biết hướng dẫn bảo quản cụ thể, vui lòng tham khảo nhãn trên sản phẩm.'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const router = useRouter();

  // Load language preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem("language") as Language;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'vi')) {
        setLanguage(savedLanguage);
      }
    }
  }, []);

  // Save language preference to localStorage when it changes
  const handleLanguageChange = (newLanguage: string) => {
    const lang = newLanguage.toLowerCase() as Language;
    if (lang === 'en' || lang === 'vi') {
      setLanguage(lang);
      if (typeof window !== 'undefined') {
        localStorage.setItem("language", lang);
      }
      router.refresh();
    }
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleLanguageChange, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
} 