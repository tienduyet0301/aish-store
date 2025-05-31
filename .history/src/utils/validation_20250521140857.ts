export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string) {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  if (!minLength) errors.push("Mật khẩu phải có ít nhất 8 ký tự");
  if (!hasUpperCase) errors.push("Mật khẩu phải có ít nhất một chữ hoa");
  if (!hasLowerCase) errors.push("Mật khẩu phải có ít nhất một chữ thường");
  if (!hasNumbers) errors.push("Mật khẩu phải có ít nhất một số");
  if (!hasSpecialChar) errors.push("Mật khẩu phải có ít nhất một ký tự đặc biệt");

  return {
    isValid: errors.length === 0,
    errors,
    details: {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    }
  };
}

export function validateDateOfBirth(day: string, month: string, year: string) {
  const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  
  const errors = [];
  
  if (isNaN(birthDate.getTime())) {
    errors.push("Ngày sinh không hợp lệ");
  }
  
  if (age < 13) {
    errors.push("Bạn phải đủ 13 tuổi để đăng ký");
  }
  
  if (age > 100) {
    errors.push("Ngày sinh không hợp lệ");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 