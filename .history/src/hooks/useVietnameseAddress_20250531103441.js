import { useState, useEffect } from "react";

export const useVietnameseAddress = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [selectedProvinceName, setSelectedProvinceName] = useState("");
  const [selectedDistrictName, setSelectedDistrictName] = useState("");
  const [selectedWardName, setSelectedWardName] = useState("");

  // Fetch provinces on component mount
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/', { signal });
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Provinces fetch aborted');
        } else {
          console.error('Error fetching provinces:', error);
        }
      }
    };
    fetchProvinces();

    return () => {
      controller.abort();
    };
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedProvince) {
        setDistricts([]);
        return;
      }
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`);
        const data = await response.json();
        setDistricts(data.districts);
        setSelectedProvinceName(data.name);
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };
    fetchDistricts();
  }, [selectedProvince]);

  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedDistrict) {
        setWards([]);
        setSelectedWardName("");
        return;
      }
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`);
        const data = await response.json();
        setWards(data.wards);
        setSelectedDistrictName(data.name);
        console.log('Selected District:', data.name);
      } catch (error) {
        console.error('Error fetching wards:', error);
      }
    };
    fetchWards();
  }, [selectedDistrict]);

  // Tự động cập nhật selectedWardName khi selectedWard hoặc wards thay đổi
  useEffect(() => {
    if (selectedWard && wards.length > 0) {
      const selectedWardData = wards.find(w => w.code === selectedWard);
      if (selectedWardData) {
        setSelectedWardName(selectedWardData.name);
      }
    }
  }, [selectedWard, wards]);

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    setSelectedProvince(provinceCode);
    setSelectedDistrict("");
    setSelectedWard("");
    setSelectedDistrictName("");
    setSelectedWardName("");
  };

  const handleDistrictChange = (e) => {
    const districtCode = e.target.value;
    setSelectedDistrict(districtCode);
    setSelectedWard("");
    setSelectedWardName("");
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    setSelectedWard(wardCode);
    // So sánh kiểu dữ liệu đồng nhất (chuyển cả hai về string)
    const selectedWardData = wards.find(w => String(w.code) === String(wardCode));
    if (selectedWardData) {
      setSelectedWardName(selectedWardData.name);
      console.log('Selected Ward:', selectedWardData.name);
    } else {
      console.log('Ward not found in list:', wardCode, wards);
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
    handleWardChange
  };
};
