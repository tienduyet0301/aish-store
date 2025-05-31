import { useState, useEffect } from 'react';

interface Province {
  code: string;
  name: string;
}

interface District {
  code: string;
  name: string;
  province_code: string;
}

interface Ward {
  code: string;
  name: string;
  district_code: string;
}

export const useVietnameseAddress = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>('');
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('');
  const [selectedWardName, setSelectedWardName] = useState<string>('');

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('/api/provinces');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };

    fetchProvinces();
  }, []);

  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceCode = e.target.value;
    setSelectedProvince(provinceCode);
    setSelectedDistrict('');
    setSelectedWard('');
    setSelectedDistrictName('');
    setSelectedWardName('');

    if (provinceCode) {
      const province = provinces.find(p => p.code === provinceCode);
      setSelectedProvinceName(province?.name || '');

      try {
        const response = await fetch(`/api/districts?provinceCode=${provinceCode}`);
        const data = await response.json();
        setDistricts(data);
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    } else {
      setDistricts([]);
      setWards([]);
    }
  };

  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = e.target.value;
    setSelectedDistrict(districtCode);
    setSelectedWard('');
    setSelectedWardName('');

    if (districtCode) {
      const district = districts.find(d => d.code === districtCode);
      setSelectedDistrictName(district?.name || '');

      try {
        const response = await fetch(`/api/wards?districtCode=${districtCode}`);
        const data = await response.json();
        setWards(data);
      } catch (error) {
        console.error('Error fetching wards:', error);
      }
    } else {
      setWards([]);
    }
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardCode = e.target.value;
    setSelectedWard(wardCode);

    if (wardCode) {
      const ward = wards.find(w => w.code === wardCode);
      setSelectedWardName(ward?.name || '');
    } else {
      setSelectedWardName('');
    }
  };

  return {
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    selectedProvinceName,
    selectedDistrictName,
    selectedWardName,
    handleProvinceChange,
    handleDistrictChange,
 