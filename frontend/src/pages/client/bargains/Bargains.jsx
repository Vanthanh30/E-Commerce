import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useBargains } from "../../../hooks/useBargains";
import BargainChat from "../../../components/client/BargainChat";
import BargainItem from "../../../components/client/BargainItem";
import { cartService } from "../../../services/client/cartService";
import { bargainService } from "../../../services/client/bargainService";
import "../../../assets/history-list.css";

const FINISHED_STATUSES = ["accepted", "rejected", "expired"];

const Bargains = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { bargains, loading, error, fetchBargains } = useBargains();

  const [activeBargain, setActiveBargain] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [creatingBargain, setCreatingBargain] = useState(false);
  const [notice, setNotice] = useState("");

  const isCreatingRef = useRef(false);

  const productIdFromUrl = searchParams.get("product");

  useEffect(() => {
    if (!sessionStorage.getItem("user")) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const ensureBargainSession = async () => {
      if (!productIdFromUrl) return;

      if (isCreatingRef.current) return;

      const userStr = sessionStorage.getItem("user");
      if (!userStr) return;

      try {
        isCreatingRef.current = true;
        setNotice("");
        setCreatingBargain(true);
        const user = JSON.parse(userStr);

        await bargainService.create({
          customerId: user.customerId,
          productId: productIdFromUrl,
          quantity: 1,
        });

        window.history.replaceState({}, document.title, "/bargains");

        await fetchBargains();
      } catch (err) {
        if (
          !err.message?.includes("Bargain session expired") &&
          !err.message?.includes("ended")
        ) {
          setNotice(err.message || "Lỗi khi tạo phiên thương lượng");
        }
        await fetchBargains();
      } finally {
        setCreatingBargain(false);
        isCreatingRef.current = false;
      }
    };

    ensureBargainSession();
  }, [fetchBargains, productIdFromUrl]);

  const groupedBargains = useMemo(
    () => ({
      negotiating: bargains.filter((item) => {
        const status = item.sessionStatus || item.status;
        return status === "negotiating" || status === "countered";
      }),
      completed: bargains.filter((item) =>
        FINISHED_STATUSES.includes(item.sessionStatus || item.status),
      ),
    }),
    [bargains],
  );

  const handleOpenChat = (item) => {
    setNotice("");
    setActiveBargain(item);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setActiveBargain(null);
    fetchBargains();
  };

  const handleCompleteChat = async ({ status, productId, quantity, price }) => {
    if (status !== "accepted" || !productId || !quantity || !price) return;

    try {
      const userStr = sessionStorage.getItem("user");
      const user = JSON.parse(userStr);

      await cartService.addToCart({
        customerId: user.customerId,
        productId,
        bargainId: activeBargain?.bargainId,
        quantity,
        price,
      });

      navigate("/cart");
    } catch (err) {
      setNotice(err.message || "Lỗi khi thêm vào giỏ hàng");
    }
  };

  const renderActionButton = (item) => {
    const sessionStatus = item.sessionStatus || item.status;

    if (FINISHED_STATUSES.includes(sessionStatus)) {
      return (
        <button
          className="btn btn-outline"
          onClick={() => handleOpenChat(item)}
        >
          Xem lịch sử
        </button>
      );
    }

    return (
      <button className="btn btn-primary" onClick={() => handleOpenChat(item)}>
        {Number(item.round || 0) === 0 ? "Bắt đầu" : "Tiếp tục"}
      </button>
    );
  };

  if (loading || creatingBargain) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        Đang tải phiên thương lượng...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "100px",
          color: "var(--danger)",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className="history-container page-container">
      <h1 className="page-title" style={{ marginBottom: "32px" }}>
        Thương lượng giá
      </h1>

      {notice && (
        <div
          role="alert"
          style={{
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            borderRadius: "6px",
            color: "#9a3412",
            marginBottom: "16px",
            padding: "12px 14px",
          }}
        >
          {notice}
        </div>
      )}

      {bargains.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "var(--text-muted)",
            padding: "40px",
          }}
        >
          <p>Bạn chưa có phiên thương lượng nào.</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/products")}
          >
            Quay lại mua sắm
          </button>
        </div>
      ) : (
        <>
          {groupedBargains.negotiating.length > 0 && (
            <section style={{ marginBottom: "40px" }}>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  color: "#ea580c",
                }}
              >
                Phiên đang diễn ra ({groupedBargains.negotiating.length})
              </h2>
              <div style={{ display: "grid", gap: "12px" }}>
                {groupedBargains.negotiating.map((item) => (
                  <BargainItem
                    key={item.bargainId}
                    item={item}
                    action={renderActionButton(item)}
                  />
                ))}
              </div>
            </section>
          )}

          {groupedBargains.completed.length > 0 && (
            <section>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  color: "#6b7280",
                }}
              >
                Lịch sử ({groupedBargains.completed.length})
              </h2>
              <div style={{ display: "grid", gap: "12px" }}>
                {groupedBargains.completed.map((item) => (
                  <BargainItem
                    key={item.bargainId}
                    item={item}
                    action={renderActionButton(item)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {showChat && activeBargain && (
        <BargainChat
          bargain={activeBargain}
          onComplete={handleCompleteChat}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
};

export default Bargains;
