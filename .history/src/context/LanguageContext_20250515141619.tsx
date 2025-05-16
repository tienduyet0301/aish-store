"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
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
    'validation.requiredEmail': 'Please enter a valid email address',
    'validation.requiredPassword': 'Please enter a valid password',
    'validation.requiredFirstName': 'Please enter your first name',
    'validation.requiredLastName': 'Please enter your last name',
    'validation.requiredDate': 'Please enter your full date of birth',
    'validation.requiredUpdates': 'You must agree to receive updates',
    'validation.invalidEmail': 'Invalid email format',
    'updates.title': 'I would like to receive updates',
    'updates.description': 'I would like to receive updates (including by email, SMS, MMS, social media, phone...) about AISH new activities, exclusive products, tailored services and to have a personalised client experience based on my interests.'
  },
  vi: {
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
    'validation.requiredEmail': 'Vui lòng nhập địa chỉ email hợp lệ',
    'validation.requiredPassword': 'Vui lòng nhập mật khẩu hợp lệ',
    'validation.requiredFirstName': 'Vui lòng nhập tên của bạn',
    'validation.requiredLastName': 'Vui lòng nhập họ của bạn',
    'validation.requiredDate': 'Vui lòng nhập đầy đủ ngày sinh',
    'validation.requiredUpdates': 'Bạn phải đồng ý nhận cập nhật',
    'validation.invalidEmail': 'Định dạng email không hợp lệ',
    'updates.title': 'Tôi muốn nhận cập nhật',
    'updates.description': 'Tôi muốn nhận cập nhật (bao gồm qua email, SMS, MMS, mạng xã hội, điện thoại...) về các hoạt động mới của AISH, sản phẩm độc quyền, dịch vụ được tùy chỉnh và có trải nghiệm khách hàng cá nhân hóa dựa trên sở thích của tôi.'
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

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
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