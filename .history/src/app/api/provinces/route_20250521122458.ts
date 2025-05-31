import { NextResponse } from 'next/server';

// Dữ liệu mẫu - trong thực tế bạn sẽ lấy từ database
const provinces = [
  { code: '01', name: 'Hà Nội' },
  { code: '02', name: 'Hồ Chí Minh' },
  { code: '03', name: 'Đà Nẵng' },
  { code: '04', name: 'Cần Thơ' },
  { code: '05', name: 'Hải Phòng' },
  // Thêm các tỉnh/thành phố khác
];

export async function GET() {
  try {
    return NextResponse.json(provinces);
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provinces' },
      { status: 500 }
    );
  }
} 