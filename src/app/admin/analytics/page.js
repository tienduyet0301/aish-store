"use client";
import { motion } from "framer-motion";

export default function Analytics() {
  // Mock data - replace with actual data from your backend
  const stats = [
    { name: "Doanh thu tháng", value: "25,000,000đ", change: "+15%", trend: "up" },
    { name: "Đơn hàng mới", value: "120", change: "+8%", trend: "up" },
    { name: "Khách hàng mới", value: "45", change: "+5%", trend: "up" },
    { name: "Tỷ lệ hoàn trả", value: "2.5%", change: "-1%", trend: "down" },
  ];

  const topProducts = [
    { name: "Áo thun trắng", sales: 150, revenue: "3,750,000đ" },
    { name: "Quần jeans đen", sales: 120, revenue: "5,400,000đ" },
    { name: "Áo khoác denim", sales: 80, revenue: "5,200,000đ" },
    { name: "Váy liền thân", sales: 60, revenue: "3,000,000đ" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p
                className={`ml-2 text-sm font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-lg shadow"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Sản phẩm bán chạy</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số lượng bán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doanh thu
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((product) => (
                <tr key={product.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Sales Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h2 className="text-lg font-medium text-gray-900 mb-4">Biểu đồ doanh thu</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          {/* Placeholder for chart - replace with actual chart component */}
          Biểu đồ sẽ được hiển thị ở đây
        </div>
      </motion.div>
    </div>
  );
} 