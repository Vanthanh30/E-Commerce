import { useLocation, useNavigate } from "react-router-dom";
import styles from "./OnlPayment.module.css";

export function OnlPayment() {
    const navigate = useNavigate();
    const location = useLocation();

    const soTien = location.state?.soTien ?? 920000;
    const noiDung = location.state?.noiDung ?? "0839976113DH001";
    const sdtLienHe = "0123456789";
    const qrSrc = location.state?.qrUrl ?? "/Image/MyQR.png";

    const handleDaThanhToan = () => {
        // TODO: gọi API xác nhận thanh toán, sau đó redirect
        navigate("/orders");
    };

    const infoRows = [
        { label: "Số tiền", value: soTien.toLocaleString("vi-VN") + " VNĐ" },
        { label: "Nội dung chuyển khoản", value: noiDung },
        { label: "SĐT liên hệ", value: sdtLienHe },
    ];

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.card}>
                <h2 className={styles.title}>
                    Quét mã QR để thanh toán cho đơn hàng của bạn
                </h2>

                {/* Thông tin thanh toán */}
                <div className={styles.infoList}>
                    {infoRows.map(({ label, value }) => (
                        <p key={label} className={styles.infoRow}>
                            <strong>{label}:</strong> {value}
                        </p>
                    ))}
                </div>

                {/* QR Code */}
                <div className={styles.qrWrapper}>
                    <img
                        src={qrSrc}
                        alt="QR Code thanh toán"
                        className={styles.qrImg}
                        onError={(e) => {
                            e.target.src = `https://img.vietqr.io/image/vietcombank-${noiDung}-compact.png?amount=${soTien}&addInfo=${encodeURIComponent(noiDung)}`;
                        }}
                    />
                </div>

                {/* Buttons */}
                <div className={styles.btnGroup}>
                    <button onClick={() => navigate(-1)} className={styles.btnBack}>
                        Quay lại trang đặt hàng
                    </button>
                    <button onClick={handleDaThanhToan} className={styles.btnConfirm}>
                        Đã thanh toán xong ✓
                    </button>
                </div>
            </div>
        </div>
    );
}