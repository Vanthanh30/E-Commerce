import React, { useEffect, useRef, useState } from "react";
import { bargainService } from "../../services/client/bargainService";
import { currency, dateTime } from "../../utils/formatters";
import "./BargainChat.css";

const FINAL_STATUSES = ["accepted", "rejected", "expired"];

const BargainChat = ({ bargain, onComplete, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [finalStatus, setFinalStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [bargainDetails, setBargainDetails] = useState(bargain);
  const [awaitingQuantity, setAwaitingQuantity] = useState(false);
  const [confirmedQuantity, setConfirmedQuantity] = useState(null);
  const [agreedPrice, setAgreedPrice] = useState(null);
  const messagesEndRef = useRef(null);

  const buildMessages = (bargainData) => {
    const chatMessages = [{
      type: "bot",
      text: `Chào mừng bạn đến với phiên thương lượng sản phẩm "${bargainData.productName}". Giá niêm yết: ${currency(bargainData.listedPrice)}. Bạn hãy đề xuất mức giá muốn mua.`,
      time: new Date(),
    }];

    let acceptedPrice = null;

    if (Array.isArray(bargainData.details)) {
      bargainData.details.forEach((detail) => {
        chatMessages.push({
          type: "customer",
          text: `Tôi muốn mua với giá ${currency(detail.customerPrice)}`,
          subtext: detail.customerMessage || "",
          time: detail.time,
        });

        chatMessages.push({
          type: "bot",
          text: detail.botMessage,
          subtext: detail.botPrice ? `Shop đề xuất: ${currency(detail.botPrice)}` : "",
          time: detail.time,
        });

        if (detail.status === "accepted") {
          acceptedPrice = detail.botPrice || detail.customerPrice;
        }
      });
    }

    const sessionStatus = bargainData.sessionStatus;
    if (sessionStatus === "accepted" && acceptedPrice) {
      chatMessages.push({
        type: "bot",
        text: "Bạn muốn mua số lượng bao nhiêu?",
        time: new Date(),
      });
    }

    setMessages(chatMessages);
    setAgreedPrice(acceptedPrice);
    setAwaitingQuantity(sessionStatus === "accepted");
    setConfirmedQuantity(null);
    setFinalStatus(FINAL_STATUSES.includes(sessionStatus) ? sessionStatus : null);
  };

  useEffect(() => {
    const loadBargainDetails = async () => {
      try {
        setErrorMessage("");
        const details = await bargainService.getById(bargain.bargainId);
        let bargainData = bargain;

        if (Array.isArray(details) && details.length > 0) {
          const rows = details.sort((a, b) => Number(a.round || 0) - Number(b.round || 0));
          const detailRows = rows.filter((row) => Number(row.round || 0) > 0);
          const latestRow = rows[rows.length - 1];

          bargainData = {
            ...bargain,
            ...latestRow,
            sessionStatus: latestRow.sessionStatus || latestRow.status,
            details: detailRows.map((row) => ({
              round: row.round,
              customerPrice: row.offerPrice,
              botPrice: row.botPrice,
              botMessage: row.botMessage || row.note || "",
              customerMessage: row.customerMessage || "",
              status: row.status,
              time: row.time,
              quantity: row.quantity,
            })),
          };
        }

        setBargainDetails(bargainData);
        buildMessages(bargainData);
      } catch (err) {
        setErrorMessage(err.message || "Lỗi khi tải chi tiết phiên thương lượng");
        buildMessages(bargain);
      }
    };

    loadBargainDetails();
  }, [bargain]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleQuantitySubmit = () => {
    const quantity = Math.floor(Number(inputValue));
    if (!quantity || quantity < 1) {
      setErrorMessage("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    const now = new Date();
    setMessages((prev) => ([
      ...prev,
      {
        type: "customer",
        text: `Tôi muốn mua ${quantity} sản phẩm`,
        time: now,
      },
      {
        type: "bot",
        text: `Shop đồng ý bán ${quantity} sản phẩm với giá ${currency(agreedPrice)}`,
        time: now,
      },
    ]));
    setConfirmedQuantity(quantity);
    setAwaitingQuantity(false);
    setInputValue("");
    setErrorMessage("");
  };

  const handlePriceSubmit = async () => {
    if (!inputValue || isNaN(inputValue)) {
      setErrorMessage("Vui lòng nhập mức giá hợp lệ");
      return;
    }

    const price = Number(inputValue);
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await bargainService.chat({
        bargainId: bargainDetails.bargainId,
        customerId: bargainDetails.customerId,
        productId: bargainDetails.productId,
        offerPrice: price,
      });

      const now = new Date();
      const nextDetail = {
        round: response.round,
        customerPrice: price,
        botPrice: response.botPrice,
        botMessage: response.botMessage,
        status: response.status,
        time: now,
        quantity: bargainDetails.quantity || 1,
      };

      setMessages((prev) => ([
        ...prev,
        {
          type: "customer",
          text: `Tôi muốn mua với giá ${currency(price)}`,
          time: now,
        },
        {
          type: "bot",
          text: response.botMessage,
          subtext: response.botPrice ? `Shop đề xuất: ${currency(response.botPrice)}` : "",
          time: now,
        },
      ]));

      setBargainDetails((prev) => ({
        ...prev,
        sessionStatus: FINAL_STATUSES.includes(response.status) ? response.status : "negotiating",
        details: [...(prev.details || []), nextDetail],
      }));

      if (response.status === "accepted") {
        setAgreedPrice(response.botPrice || price);
        setAwaitingQuantity(true);
        setMessages((prev) => ([
          ...prev,
          {
            type: "bot",
            text: "Bạn muốn mua số lượng bao nhiêu?",
            time: new Date(),
          },
        ]));
      }

      if (FINAL_STATUSES.includes(response.status)) {
        setFinalStatus(response.status);
      }

      setInputValue("");
    } catch (err) {
      setErrorMessage(err.message || "Lỗi khi gửi đề xuất giá");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (awaitingQuantity) {
      handleQuantitySubmit();
      return;
    }

    handlePriceSubmit();
  };

  const handleAccept = async () => {
    await onComplete({
      status: "accepted",
      productId: bargainDetails.productId,
      quantity: confirmedQuantity || bargainDetails.quantity || 1,
      price: agreedPrice,
    });
    onClose();
  };

  const currentRound = bargainDetails.details?.length || 0;
  const isFinished = FINAL_STATUSES.includes(finalStatus);
  const canOrder = finalStatus === "accepted" && confirmedQuantity && agreedPrice && !awaitingQuantity;

  return (
    <div className="bargain-chat-modal">
      <div className="bargain-chat-container">
        <div className="bargain-chat-header">
          <div>
            <h3>{bargainDetails.productName}</h3>
            <span
              className="chat-status-badge"
              style={{
                background:
                  finalStatus === "accepted" ? "#16a34a" :
                  finalStatus === "rejected" || finalStatus === "expired" ? "#dc2626" :
                  "#eab308",
              }}
            >
              {finalStatus === "accepted" ? "Chấp nhận" :
               finalStatus === "rejected" ? "Từ chối" :
               finalStatus === "expired" ? "Hết hạn" :
               `Vòng ${Math.min(currentRound + 1, 3)}/3`}
            </span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Đóng phiên thương lượng">
            ←
          </button>
        </div>

        <div className="bargain-chat-messages">
          {messages.map((msg, idx) => (
            <div key={`${msg.type}-${idx}`} className={`chat-message ${msg.type}`}>
              <div className="message-bubble">
                <p>{msg.text}</p>
                {msg.subtext && <small className="message-subtext">{msg.subtext}</small>}
                <div className="message-meta">
                  {msg.time && <span className="message-time">{dateTime(msg.time)}</span>}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {errorMessage && (
          <div
            role="alert"
            style={{
              background: "#fef2f2",
              borderTop: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: "14px",
              padding: "10px 12px",
            }}
          >
            {errorMessage}
          </div>
        )}

        {(!isFinished || awaitingQuantity) && (
          <div className="bargain-chat-input">
            <input
              type="number"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder={awaitingQuantity ? "Nhập số lượng muốn mua" : "Nhập mức giá của bạn (VNĐ)"}
              disabled={loading}
              min={awaitingQuantity ? "1" : "1000"}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputValue}
              className="btn btn-primary"
            >
              {loading ? "Đang gửi..." : "Gửi"}
            </button>
          </div>
        )}

        {isFinished && !awaitingQuantity && (
          <div className="bargain-chat-actions">
            {finalStatus === "accepted" ? (
              <button onClick={handleAccept} className="btn btn-success" disabled={!canOrder}>
                Đặt hàng ngay
              </button>
            ) : (
              <button onClick={onClose} className="btn btn-outline">
                Quay lại
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BargainChat;
