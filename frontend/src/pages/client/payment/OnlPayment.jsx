import { useLocation, useNavigate } from "react-router-dom";

// Props hoặc lấy từ location.state khi navigate sang trang này
// navigate("/thanh-toan-online", { state: { soTien, noiDung, idDH } })

export function OnlPayment() {
    const navigate = useNavigate();
    const location = useLocation();

    const soTien = location.state?.soTien ?? 920000;
    const noiDung = location.state?.noiDung ?? "0839976113DH001";
    const sdtLienHe = "0123456789";

    // Ảnh QR — thay bằng URL thật hoặc generate động từ VietQR API
    const qrSrc = location.state?.qrUrl ?? "/Image/MyQR.png";

    const handleDaThanhToan = () => {
        // TODO: gọi API xác nhận thanh toán, sau đó redirect
        navigate("/orders");
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#FFF4D0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Arial, sans-serif",
                padding: 16,
            }}
        >
            <div
                style={{
                    maxWidth: 500,
                    width: "100%",
                    background: "#FFE09F",
                    borderRadius: 10,
                    padding: 28,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    textAlign: "center",
                }}
            >
                <h2 style={{ color: "#333", marginBottom: 20, fontSize: "1.2rem" }}>
                    Quét mã QR để thanh toán cho đơn hàng của bạn
                </h2>

                {/* Thông tin thanh toán */}
                <div style={{ textAlign: "left", marginBottom: 20 }}>
                    {[
                        { label: "Số tiền", value: soTien.toLocaleString("vi-VN") + " VNĐ" },
                        { label: "Nội dung chuyển khoản", value: noiDung },
                        { label: "SĐT liên hệ", value: sdtLienHe },
                    ].map(({ label, value }) => (
                        <p key={label} style={{ margin: "10px 0", fontSize: 16, color: "#555" }}>
                            <strong>{label}:</strong> {value}
                        </p>
                    ))}
                </div>

                {/* QR Code */}
                <div style={{ margin: "20px 0" }}>
                    <img
                        src={qrSrc}
                        alt="QR Code thanh toán"
                        onError={(e) => {
                            // Fallback: dùng VietQR API generate tự động
                            e.target.src = `https://img.vietqr.io/image/vietcombank-${noiDung}-compact.png?amount=${soTien}&addInfo=${encodeURIComponent(noiDung)}`;
                        }}
                        style={{ maxWidth: "100%", borderRadius: 8 }}
                    />
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            flex: 1, minWidth: 160,
                            padding: "12px 16px",
                            borderRadius: 5, border: "none",
                            background: "#f5a623", color: "#fff",
                            fontSize: 15, fontWeight: 500, cursor: "pointer",
                        }}
                    >
                        Quay lại trang đặt hàng
                    </button>
                    <button
                        onClick={handleDaThanhToan}
                        style={{
                            flex: 1, minWidth: 160,
                            padding: "12px 16px",
                            borderRadius: 5, border: "none",
                            background: "#34c759", color: "#fff",
                            fontSize: 15, fontWeight: 500, cursor: "pointer",
                        }}
                    >
                        Đã thanh toán xong ✓
                    </button>
                </div>
            </div>
        </div>
    );
}