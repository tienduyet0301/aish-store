import { NextResponse } from 'next/server';

// Dữ liệu mẫu - trong thực tế bạn sẽ lấy từ database
const districts = {
  '01': [ // Hà Nội
    { code: '001', name: 'Ba Đình', province_code: '01' },
    { code: '002', name: 'Hoàn Kiếm', province_code: '01' },
    { code: '003', name: 'Tây Hồ', province_code: '01' },
    { code: '004', name: 'Long Biên', province_code: '01' },
    { code: '005', name: 'Cầu Giấy', province_code: '01' },
  ],
  '02': [ // Hồ Chí Minh
    { code: '001', name: 'Quận 1', province_code: '02' },
    { code: '002', name: 'Quận 2', province_code: '02' },
    { code: '003', name: 'Quận 3', province_code: '02' },
    { code: '004', name: 'Quận 4', province_code: '02' },
    { code: '005', name: 'Quận 5', province_code: '02' },
  ],
  // Thêm các quận/huyện khác
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceCode = searchParams.get('province_code');

    if (!provinceCode) {
      return NextResponse.json(
        { error: 'Province code is required' },
        { status: 400 }
      );
    }

    const provinceDistricts = districts[provinceCode as keyof typeof districts] || [];
    return NextResponse.json(provinceDistricts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch districts' },
      { status: 500 }
    );
  }
} 