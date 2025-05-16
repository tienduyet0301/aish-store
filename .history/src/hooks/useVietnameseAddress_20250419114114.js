import { useState, useEffect } from "react";

export const useVietnameseAddress = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };
    fetchProvinces();
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
        return;
      }
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`);
        const data = await response.json();
        setWards(data.wards);
      } catch (error) {
        console.error('Error fetching wards:', error);
      }
    };
    fetchWards();
  }, [selectedDistrict]);

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    setSelectedProvince(provinceCode);
    setSelectedDistrict("");
    setSelectedWard("");
  };

  const handleDistrictChange = (e) => {
    const districtCode = e.target.value;
    setSelectedDistrict(districtCode);
    setSelectedWard("");
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    setSelectedWard(wardCode);
  };

  return {
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange
  };
};
