// src/pages/admin/RevenueStats.jsx
import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { statsService } from "../../../services/admin/stats.service";
import { currency } from "../../../utils/formatters";
import styles from "./RevenueStats.module.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export const RevenueStats = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const year = new Date().getFullYear();
        const data = await statsService.getRevenueByMonth(year);

        const labels = data.map((item) => `Tháng ${item.month}`);
        const values = data.map((item) => item.revenue);

        setTotalRevenue(values.reduce((a, b) => a + b, 0));

        setChartData({
          labels,
          datasets: [
            {
              label: "Doanh thu",
              data: values,
              backgroundColor: "rgba(31, 108, 85, 0.72)",
              borderRadius: 6,
            },
          ],
        });
      } catch (error) {
        console.error("Lỗi:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className={styles.adminContent}>
      <h1 className={styles.pageTitle}>Thống kê doanh thu</h1>

      <div className={styles.adminStats}>
        <div className={styles.statCardFeatured}>
          <label>Tổng doanh thu</label>
          <strong>{currency(totalRevenue)}</strong>
        </div>
      </div>

      <div className={styles.chartPanel}>
        <h2 className={styles.chartPanelTitle}>Doanh thu theo tháng</h2>
        <div className={styles.chartFrame}>
          <Bar data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
};