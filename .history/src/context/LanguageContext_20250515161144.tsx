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
  | 'common.mayWeHelpYou'
  // Products
  | 'products.allProducts'
  | 'products.filters'
  | 'products.sort.title'
  | 'products.sort.newest'
  | 'products.sort.priceHighToLow'
  | 'products.sort.priceLowToHigh'
  | 'products.filter.title'
  | 'products.filter.color'
  | 'products.filter.size'
  | 'products.filter.apply'
  | 'products.filter.reset'
  | 'products.filter.noProducts'
  | 'products.filter.tryAgain'
  | 'products.filter.allColors'
  | 'products.filter.allSizes'
  | 'products.filter.resetFilters'
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
  | 'care.intro'
  | 'care.washing.title'
  | 'care.washing.tip1'
  | 'care.washing.tip2'
  | 'care.washing.tip3'
  | 'care.washing.tip4'
  | 'care.washing.tip5'
  | 'care.drying.title'
  | 'care.drying.tip1'
  | 'care.drying.tip2'
  | 'care.drying.tip3'
  | 'care.drying.tip4'
  | 'care.ironing.title'
  | 'care.ironing.tip1'
  | 'care.ironing.tip2'
  | 'care.ironing.tip3'
  | 'care.notToDo.title'
  | 'care.notToDo.tip1'
  | 'care.notToDo.tip2'
  | 'care.notToDo.tip3'
  | 'care.notToDo.tip4'
  | 'care.notToDo.tip5'
  | 'care.help.title'
  | 'care.footer'
  // Return Policy
  | 'return.title'
  | 'return.description'
  | 'return.conditions.title'
  | 'return.conditions.tip1'
  | 'return.conditions.tip2'
  | 'return.conditions.tip3'
  | 'return.conditions.tip4'
  | 'return.conditions.tip5'
  | 'return.process.title'
  | 'return.process.tip1'
  | 'return.process.tip2'
  | 'return.process.tip3'
  | 'return.timeFrame.title'
  | 'return.timeFrame.description'
  | 'return.shipping.title'
  | 'return.shipping.fullSupport.title'
  | 'return.shipping.fullSupport.tip1'
  | 'return.shipping.fullSupport.tip2'
  | 'return.shipping.halfSupport.title'
  | 'return.shipping.halfSupport.tip1'
  | 'return.shipping.note'
  | 'return.help.title'
  // About Us
  | 'about.title'
  | 'about.imageAlt'
  | 'about.paragraph1'
  | 'about.paragraph2'
  | 'about.paragraph3'
  // Warranty Policy
  | 'warranty.title'
  | 'warranty.description'
  | 'warranty.conditions.title'
  | 'warranty.conditions.tip1'
  | 'warranty.conditions.tip2'
  | 'warranty.conditions.tip3'
  | 'warranty.conditions.tip4'
  | 'warranty.conditions.tip5'
  | 'warranty.conditions.tip6'
  | 'warranty.conditions.tip7'
  | 'warranty.conditions.note'
  | 'warranty.timeFrame.title'
  | 'warranty.timeFrame.tip1'
  | 'warranty.timeFrame.tip2'
  | 'warranty.notCovered.title'
  | 'warranty.notCovered.description'
  | 'warranty.note.title'
  | 'warranty.note.description'
  | 'warranty.shipping.title'
  | 'warranty.shipping.description';

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
    'common.mayWeHelpYou': 'MAY WE HELP YOU?',
    // Products
    'products.allProducts': 'ALL PRODUCTS',
    'products.filters': 'FILTERS',
    'products.sort.title': 'SORT',
    'products.sort.newest': 'NEWEST',
    'products.sort.priceHighToLow': 'PRICE HIGH-LOW',
    'products.sort.priceLowToHigh': 'PRICE LOW-HIGH',
    'products.filter.title': 'FILTERS',
    'products.filter.color': 'COLOR',
    'products.filter.size': 'SIZE',
    'products.filter.apply': 'APPLY',
    'products.filter.reset': 'RESET',
    'products.filter.noProducts': 'No products found',
    'products.filter.tryAgain': 'Try adjusting your filters',
    'products.filter.allColors': 'ALL COLORS',
    'products.filter.allSizes': 'ALL SIZES',
    'products.filter.resetFilters': 'Reset filters',
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
    'navbar.tshirt': 'Tops / T-shirt',
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
    'care.description': 'All materials used in our products are carefully selected by AISH for color fastness and shape retention. However, any material will wear out over time and with use.',
    'care.intro': 'You can refer to the following care instructions to maintain your garments in the best condition.',
    'care.washing.title': 'WASHING',
    'care.washing.tip1': 'Always turn the product inside out when machine washing',
    'care.washing.tip2': 'Sort products when washing (colored items should not be washed with white items)',
    'care.washing.tip3': 'Wash on medium setting',
    'care.washing.tip4': 'Do not wash with water above 30°C',
    'care.washing.tip5': 'Do not wash with bleach, metal, or items that may damage the product',
    'care.drying.title': 'DRYING',
    'care.drying.tip1': 'Always hang clothes from the bottom of the garment',
    'care.drying.tip2': 'Always dry with the product inside out',
    'care.drying.tip3': 'Do not dry in direct sunlight',
    'care.drying.tip4': 'Do not dry in the rain',
    'care.ironing.title': 'IRONING',
    'care.ironing.tip1': 'Do not iron directly on prints or embroidery',
    'care.ironing.tip2': 'Do not leave the iron on the product surface for too long',
    'care.ironing.tip3': 'Do not use high heat on cotton, silk, or wool materials',
    'care.notToDo.title': 'WHAT NOT TO DO WITH THE PRODUCT',
    'care.notToDo.tip1': 'Do not use bleach',
    'care.notToDo.tip2': 'Do not hang in damp places',
    'care.notToDo.tip3': 'Do not use a brush on wool products, prints, or embroidery',
    'care.notToDo.tip4': 'Do not wash dark-colored products with light-colored ones',
    'care.notToDo.tip5': 'Do not hot dry the product',
    'care.help.title': 'MAY WE HELP YOU?',
    'care.footer': 'For specific care instructions, please refer to the care label on your garment.',
    // Return Policy
    'return.title': 'RETURN POLICY',
    'return.description': 'AISH applies the "HOME CARE" method to provide you with the best shopping and care experience.',
    'return.conditions.title': 'RETURN CONDITIONS',
    'return.conditions.tip1': 'One exchange per order',
    'return.conditions.tip2': 'Exchange applies to all products with complete tags',
    'return.conditions.tip3': 'Product must be unused and free from stains, dirt, or unusual odors',
    'return.conditions.tip4': 'Exchange for products of equal or higher value (You pay the price difference if any)',
    'return.conditions.tip5': 'Consider exchanging for lower value products, as AISH will not refund the difference',
    'return.process.title': 'RETURN PROCESS',
    'return.process.tip1': 'Shipper will pick up at your location',
    'return.process.tip2': 'No need to go to post office',
    'return.process.tip3': 'No need to create shipping order',
    'return.timeFrame.title': 'APPLICATION TIME',
    'return.timeFrame.description': '7 days from receiving the product, applies to all domestic and international orders',
    'return.shipping.title': 'SHIPPING FEE POLICY',
    'return.shipping.fullSupport.title': 'AISH supports 100% shipping fee in cases:',
    'return.shipping.fullSupport.tip1': 'Product has manufacturing defects',
    'return.shipping.fullSupport.tip2': 'Wrong size or wrong product category delivered',
    'return.shipping.halfSupport.title': 'AISH supports 50% shipping fee in case:',
    'return.shipping.halfSupport.tip1': 'You want to exchange for a different product',
    'return.shipping.note': 'There is no case where AISH makes you pay the full shipping fee. So feel free to enjoy your shopping experience.',
    'return.help.title': 'MAY WE HELP YOU?',
    // About Us
    'about.title': 'ABOUT AISH',
    'about.imageAlt': 'AISH Brand',
    'about.paragraph1': 'AISH is a fashion brand founded in early 2025, born from the passion of individuals who love minimalist design, elegantly combined with sharp and luxurious details.',
    'about.paragraph2': 'AISH was created to represent the young generation who confidently express their personal style, possess strong self-belief, and continuously seek new and exciting experiences. With a positive spirit, AISH aspires to inspire and convey meaningful messages to everyone.',
    'about.paragraph3': 'Each collection in 2025 marks the beginning of AISH\'s journey.',
    // Warranty Policy
    'warranty.title': 'WARRANTY POLICY',
    'warranty.description': 'AISH applies the principle "EXPERIENCE FIRST - FEEL LATER"',
    'warranty.conditions.title': 'WARRANTY CONDITIONS',
    'warranty.conditions.tip1': 'One warranty per order',
    'warranty.conditions.tip2': 'Applies to all products with tags and purchase receipt (online or offline)',
    'warranty.conditions.tip3': 'Applies to products with manufacturing defects including:',
    'warranty.conditions.tip4': 'Color bleeding',
    'warranty.conditions.tip5': 'Fabric shrinkage',
    'warranty.conditions.tip6': 'Fabric pilling',
    'warranty.conditions.tip7': 'Technical issues like loose threads or buttons',
    'warranty.conditions.note': 'Within AISH\'s warranty capabilities',
    'warranty.timeFrame.title': 'APPLICATION TIME',
    'warranty.timeFrame.tip1': '30 days from receiving the product, you can freely experience the product',
    'warranty.timeFrame.tip2': 'Warranty processing time at AISH: Maximum 30 days from receiving the product',
    'warranty.notCovered.title': 'NOT COVERED',
    'warranty.notCovered.description': 'AISH cannot warranty products that are washed and dried incorrectly, exposed to bleach, hot water, heavily damaged due to long-term use, cuts...',
    'warranty.note.title': 'NOTE',
    'warranty.note.description': 'Warranty means AISH repairs the product you have paid for, NOT exchanging for a different product.',
    'warranty.shipping.title': 'SHIPPING FEE',
    'warranty.shipping.description': 'AISH supports 100% shipping fee',
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
    'common.mayWeHelpYou': 'CHÚNG TÔI CÓ THỂ GIÚP GÌ CHO BẠN?',
    // Products
    'products.allProducts': 'TẤT CẢ SẢN PHẨM',
    'products.filters': 'BỘ LỌC',
    'products.sort.title': 'SẮP XẾP',
    'products.sort.newest': 'MỚI NHẤT',
    'products.sort.priceHighToLow': 'GIÁ CAO-THẤP',
    'products.sort.priceLowToHigh': 'GIÁ THẤP-CAO',
    'products.filter.title': 'BỘ LỌC',
    'products.filter.color': 'MÀU SẮC',
    'products.filter.size': 'KÍCH THƯỚC',
    'products.filter.apply': 'ÁP DỤNG',
    'products.filter.reset': 'ĐẶT LẠI',
    'products.filter.noProducts': 'Không tìm thấy sản phẩm',
    'products.filter.tryAgain': 'Hãy thử điều chỉnh bộ lọc của bạn',
    'products.filter.allColors': 'TẤT CẢ MÀU SẮC',
    'products.filter.allSizes': 'TẤT CẢ KÍCH THƯỚC',
    'products.filter.resetFilters': 'Xóa tất cả bộ lọc',
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
    'navbar.tshirt': 'Áo / Áo thun',
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
    'care.description': 'Tất cả chất liệu của sản phẩm luôn được AISH lựa chọn với yêu cầu bền màu, giữ form dáng tốt nhất. Tuy nhiên chất liệu nào cũng sẽ bị bào mòn theo thời gian và số lần sử dụng.',
    'care.intro': 'Bạn có thể tham khảo những cách bảo quản sản phẩm sau đây để luôn giữ được tình trạng quần áo tốt nhất.',
    'care.washing.title': 'CÁCH THỨC GIẶT',
    'care.washing.tip1': 'Luôn lộn mặt trái sản phẩm để giặt khi giặt tại máy',
    'care.washing.tip2': 'Phân loại sản phẩm khi giặt (Đồ màu không để cùng đồ trắng)',
    'care.washing.tip3': 'Giặt ở chế độ vừa',
    'care.washing.tip4': 'Không giặt với nước trên 30 độ',
    'care.washing.tip5': 'Không giặt với chất tẩy, kim loại, những vật làm hư tổn đến sản phẩm',
    'care.drying.title': 'CÁCH THỨC PHƠI',
    'care.drying.tip1': 'Luôn móc áo từ dưới thân áo lên',
    'care.drying.tip2': 'Luôn phơi với mặt trái của sản phẩm',
    'care.drying.tip3': 'Không phơi dưới trời nắng gắt',
    'care.drying.tip4': 'Không phơi dưới trời mưa',
    'care.ironing.title': 'CÁCH THỨC ỦI',
    'care.ironing.tip1': 'Không ủi trực tiếp lên hình in, hình thêu',
    'care.ironing.tip2': 'Không để bàn ủi quá lâu trên bề mặt sản phẩm',
    'care.ironing.tip3': 'Không sử dụng nhiệt độ quá cao với các chất liệu cotton, lụa, len',
    'care.notToDo.title': 'NHỮNG ĐIỀU KHÔNG NÊN LÀM VỚI SẢN PHẨM',
    'care.notToDo.tip1': 'Không sử dụng chất tẩy',
    'care.notToDo.tip2': 'Không treo ở nơi ẩm móc',
    'care.notToDo.tip3': 'Không dùng bàn chải trên sản phẩm len, hình in, thêu',
    'care.notToDo.tip4': 'Không giặt sản phẩm tối màu cùng với sản phẩm sáng màu',
    'care.notToDo.tip5': 'Không được sấy nóng sản phẩm',
    'care.help.title': 'MAY WE HELP YOU?',
    'care.footer': 'Để biết hướng dẫn bảo quản cụ thể, vui lòng tham khảo nhãn trên sản phẩm.',
    // Return Policy
    'return.title': 'CHÍNH SÁCH ĐỔI TRẢ',
    'return.description': 'AISH áp dụng cách thức "CHĂM SÓC TẠI NHÀ" để các bạn có trải nghiệm mua hàng và chăm sóc tốt nhất.',
    'return.conditions.title': 'ĐIỀU KIỆN ĐỔI TRẢ',
    'return.conditions.tip1': 'Áp dụng 01 lần đổi / 01 đơn hàng',
    'return.conditions.tip2': 'Áp dụng đổi hàng với tất cả sản phẩm còn đầy đủ tem, tag',
    'return.conditions.tip3': 'Sản phẩm chưa qua sử dụng và không có vết bẩn, rác, mùi hương lạ',
    'return.conditions.tip4': 'Đổi sản phẩm khác với giá trị tương đồng hoặc giá trị cao hơn (Bạn thanh toán giá trị chênh lệch nếu có)',
    'return.conditions.tip5': 'Cân nhắc đổi sang sản phẩm giá trị thấp hơn, vì AISH sẽ không hoàn lại tiền thừa',
    'return.process.title': 'QUY TRÌNH ĐỔI TRẢ',
    'return.process.tip1': 'Shipper sẽ đến lấy hàng tận nơi',
    'return.process.tip2': 'Bạn không cần phải ra bưu cục gửi hàng',
    'return.process.tip3': 'Không cần tự tạo đơn hàng',
    'return.timeFrame.title': 'THỜI GIAN ÁP DỤNG',
    'return.timeFrame.description': '7 ngày kể từ ngày nhận được sản phẩm, áp dụng với tất cả đơn hàng nội thành và ngoại thành',
    'return.shipping.title': 'CHÍNH SÁCH PHÍ SHIP',
    'return.shipping.fullSupport.title': 'AISH hỗ trợ 100% phí ship trong các trường hợp:',
    'return.shipping.fullSupport.tip1': 'Sản phẩm bị lỗi từ phía sản xuất',
    'return.shipping.fullSupport.tip2': 'Sản phẩm giao nhầm size, giao nhầm phân loại sản phẩm',
    'return.shipping.halfSupport.title': 'AISH hỗ trợ 50% phí ship trong trường hợp:',
    'return.shipping.halfSupport.tip1': 'Bạn mong muốn đổi sang sản phẩm khác',
    'return.shipping.note': 'Không có trường hợp nào AISH để bạn chịu hoàn toàn phí ship cả. Vì thế bạn hãy cứ yên tâm thoải mái trải nghiệm mua sắm nhé.',
    'return.help.title': 'MAY WE HELP YOU?',
    // About Us
    'about.title': 'VỀ AISH',
    'about.imageAlt': 'Thương hiệu AISH',
    'about.paragraph1': 'AISH là một thương hiệu thời trang được thành lập vào đầu năm 2025, ra đời từ niềm đam mê của những cá nhân yêu thích thiết kế tối giản, kết hợp một cách tinh tế với những chi tiết sắc sảo và sang trọng.',
    'about.paragraph2': 'AISH được tạo ra để đại diện cho thế hệ trẻ tự tin thể hiện phong cách cá nhân, sở hữu niềm tin vững chắc vào bản thân và không ngừng tìm kiếm những trải nghiệm mới mẻ, thú vị. Với tinh thần tích cực, AISH khao khát truyền cảm hứng và truyền tải những thông điệp ý nghĩa đến tất cả mọi người.',
    'about.paragraph3': 'Mỗi bộ sưu tập trong năm 2025 đánh dấu bước khởi đầu trong hành trình của AISH.',
    // Warranty Policy
    'warranty.title': 'CHÍNH SÁCH BẢO HÀNH',
    'warranty.description': 'AISH áp dụng nguyên tắc "TRẢI NGHIỆM TRƯỚC - CẢM NHẬN SAU"',
    'warranty.conditions.title': 'ĐIỀU KIỆN BẢO HÀNH',
    'warranty.conditions.tip1': 'Áp dụng 01 lần bảo hành / 01 đơn hàng',
    'warranty.conditions.tip2': 'Áp dụng với tất cả sản phẩm còn giữ tem, tag và hoá đơn đơn mua hàng online hoặc offline',
    'warranty.conditions.tip3': 'Áp dụng với những sản phẩm có lỗi từ phía sản xuất bao gồm:',
    'warranty.conditions.tip4': 'Sản phẩm ra màu',
    'warranty.conditions.tip5': 'Vải bị co giãn',
    'warranty.conditions.tip6': 'Vải bị xù',
    'warranty.conditions.tip7': 'Kĩ thuật may bung chỉ bung nút',
    'warranty.conditions.note': 'Trong khả năng AISH có thể bảo hành',
    'warranty.timeFrame.title': 'THỜI GIAN ÁP DỤNG',
    'warranty.timeFrame.tip1': '30 ngày kể từ ngày bạn nhận được sản phẩm, bạn có thể trải nghiệm sản phẩm thoải mái',
    'warranty.timeFrame.tip2': 'Thời gian gửi bảo hành tại AISH: Tối đa 30 ngày từ ngày AISH nhận được sản phẩm bảo hành',
    'warranty.notCovered.title': 'KHÔNG BẢO HÀNH',
    'warranty.notCovered.description': 'AISH không bảo hành được với những sản phẩm bạn giặt và phơi không đúng cách, có chất tẩy, nước nóng, hư hỏng nặng do vấn đề sử dụng lâu, vết cắt….',
    'warranty.note.title': 'LƯU Ý',
    'warranty.note.description': 'Bảo hành là việc AISH sửa chữa trên sản phẩm bạn đã thanh toán, KHÔNG phải đổi sang một sản phẩm khác.',
    'warranty.shipping.title': 'PHÍ SHIP',
    'warranty.shipping.description': 'AISH hỗ trợ 100% phí ship'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem("language") as Language;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'vi')) {
        setLanguage(savedLanguage);
      }
    }
  }, []);

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