import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
} from "chart.js";

import { currency } from "../../../utils/formatters";
import { statsService } from "../../../services/admin/statsService";
import "./Dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const currentYear = new Date().getFullYear();
const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("doanhthu"); // "doanhthu" | "soluongdon"
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    // Doanh thu stats
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [monthsWithRevenue, setMonthsWithRevenue] = useState(0);
    const [maxRevenue, setMaxRevenue] = useState(0);

    // Số lượng đơn stats
    const [totalOrders, setTotalOrders] = useState(0);
    const [monthsWithOrders, setMonthsWithOrders] = useState(0);
    const [maxOrders, setMaxOrders] = useState(0);

    useEffect(() => {
        if (activeTab === "doanhthu") {
            fetchRevenue();
        } else {
            fetchOrders();
        }
    }, [activeTab, selectedYear]);

    const fetchRevenue = async () => {
        try {
            const data = await statsService.getRevenueByMonth(selectedYear);
            
            // Map the data to all 12 months
            const fullYearData = Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                revenue: data.find(d => d.month === i + 1)?.revenue || 0
            }));

            const labels = fullYearData.map((item) => `Tháng ${item.month}`);
            const values = fullYearData.map((item) => item.revenue);

            setTotalRevenue(values.reduce((a, b) => a + b, 0));
            setMonthsWithRevenue(values.filter((v) => v > 0).length);
            setMaxRevenue(Math.max(...values));

            setChartData({
                labels,
                datasets: [{
                    label: "Doanh thu",
                    data: values,
                    backgroundColor: "rgba(31, 108, 85, 0.72)",
                    borderColor: "rgba(31, 108, 85, 1)",
                    borderWidth: 1,
                    borderRadius: 6,
                    maxBarThickness: 56,
                }],
            });
        } catch (error) {
            console.error("Lỗi tải doanh thu:", error);
        }
    };

    const fetchOrders = async () => {
        try {
            const data = await statsService.getOrdersByMonth(selectedYear);
            
            // Map the data to all 12 months
            const fullYearData = Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                count: data.find(d => d.month === i + 1)?.orderCount || 0
            }));

            const labels = fullYearData.map((item) => `Tháng ${item.month}`);
            const values = fullYearData.map((item) => item.count);

            setTotalOrders(values.reduce((a, b) => a + b, 0));
            setMonthsWithOrders(values.filter((v) => v > 0).length);
            setMaxOrders(Math.max(...values));

            setChartData({
                labels,
                datasets: [{
                    label: "Số lượng đơn",
                    data: values,
                    backgroundColor: "rgba(31, 108, 85, 0.72)",
                    borderColor: "rgba(31, 108, 85, 1)",
                    borderWidth: 1,
                    borderRadius: 6,
                    maxBarThickness: 56,
                }],
            });
        } catch (error) {
            console.error("Lỗi tải số lượng đơn:", error);
        }
    };

    const revenueChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => ctx.parsed.y.toLocaleString("vi-VN") + " VNĐ",
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: "#6F6A63" },
            },
            y: {
                beginAtZero: true,
                grid: { color: "rgba(25, 25, 25, 0.08)" },
                ticks: {
                    color: "#6F6A63",
                    callback: (value) => value.toLocaleString("vi-VN") + " đ",
                },
            },
        },
    };

    const orderChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => ctx.parsed.y.toLocaleString("vi-VN") + " đơn",
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: "#6F6A63" },
            },
            y: {
                beginAtZero: true,
                grid: { color: "rgba(25, 25, 25, 0.08)" },
                ticks: {
                    color: "#6F6A63",
                    precision: 0,
                    callback: (value) => value.toLocaleString("vi-VN") + " đơn",
                },
            },
        },
    };

    const isRevenue = activeTab === "doanhthu";

    return (
        <div className="adminContent">
            {/* Page header */}
            <div className="dashPageHeader">
                <h1 className="pageTitle">
                    {isRevenue ? "Thống kê doanh thu" : "Thống kê số lượng đơn"}
                </h1>
                <p className="pageSubtitle">
                    {isRevenue
                        ? `Theo dõi doanh thu đơn hàng theo tháng trong năm ${selectedYear}.`
                        : `Theo dõi số lượng đơn hàng theo tháng trong năm ${selectedYear}.`}
                </p>
            </div>

            {/* Toolbar */}
            <div className="statsToolbar">
                <div className="filterTabs">
                    <button
                        className={`filterTab ${!isRevenue ? "filterTabActive" : ""}`}
                        onClick={() => setActiveTab("soluongdon")}
                    >
                        Số lượng đơn hàng
                    </button>
                    <button
                        className={`filterTab ${isRevenue ? "filterTabActive" : ""}`}
                        onClick={() => setActiveTab("doanhthu")}
                    >
                        Doanh thu
                    </button>
                </div>

                <select
                    className="yearSelect"
                    aria-label="Chọn năm thống kê"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                >
                    {availableYears.map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            {/* Stat cards */}
            <div className="adminStats">
                {isRevenue ? (
                    <>
                        <div className="statCardFeatured">
                            <label>Tổng doanh thu</label>
                            <strong>{currency(totalRevenue)}</strong>
                        </div>
                        <div className="statCard">
                            <label>Tháng có doanh thu</label>
                            <strong>{monthsWithRevenue}</strong>
                        </div>
                        <div className="statCard">
                            <label>Doanh thu cao nhất</label>
                            <strong>{currency(maxRevenue)}</strong>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="statCardFeatured">
                            <label>Tổng đơn hàng</label>
                            <strong>{totalOrders}</strong>
                        </div>
                        <div className="statCard">
                            <label>Tháng có đơn</label>
                            <strong>{monthsWithOrders}</strong>
                        </div>
                        <div className="statCard">
                            <label>Đơn cao nhất/tháng</label>
                            <strong>{maxOrders}</strong>
                        </div>
                    </>
                )}
            </div>

            {/* Chart */}
            <div className="chartPanel">
                <div className="chartPanelHeader">
                    <h2 className="chartPanelTitle">
                        {isRevenue ? "Doanh thu theo tháng" : "Số lượng đơn theo tháng"}
                    </h2>
                    <p className="chartPanelSubtitle">
                        {isRevenue
                            ? "Giá trị được tính từ các đơn hàng trong năm đã chọn."
                            : "Thống kê tổng số đơn được tạo trong năm đã chọn."}
                    </p>
                </div>
                <div className="chartFrame">
                    <Bar
                        data={chartData}
                        options={isRevenue ? revenueChartOptions : orderChartOptions}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;