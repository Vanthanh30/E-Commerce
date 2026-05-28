import React, { useEffect, useRef, useState } from "react";
import { bargainService } from "../../services/client/bargainService";
import { currency, dateTime } from "../../utils/formatters";
import "./BargainChat.css";

const FINAL_STATUSES = ["accepted", "rejected", "expired"];
const POLL_INTERVAL_MS = 10000;

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
    const chatMessages = [
      {
        type: "bot",
        text: `Chao mung ban den voi phien thuong luong san pham "${bargainData.productName}". Gia niem yet: ${currency(bargainData.listedPrice)}. Ban hay de xuat muc gia muon mua.`,
        time: new Date(),
      },
    ];

    let acceptedPrice = null;

    if (Array.isArray(bargainData.details)) {
      bargainData.details.forEach((detail) => {
        chatMessages.push({
          type: "customer",
          text: `Toi muon mua voi gia ${currency(detail.customerPrice)}`,
          subtext: detail.customerMessage || "",
          time: detail.time,
        });

        if (detail.status === "pending") {
          chatMessages.push({
            type: "bot",
            text: "Shop da nhan de xuat cua ban va se phan hoi trong 10 phut.",
            subtext: detail.autoReplyAt
              ? `Tu dong phan hoi luc ${dateTime(detail.autoReplyAt)} neu admin chua tra loi`
              : "",
            time: detail.time,
          });
        } else {
          const botText = detail.botMessage?.trim() ||
            (detail.status === "accepted"
              ? `Shop chap nhan muc gia ${currency(detail.customerPrice)} cua ban.`
              : detail.status === "rejected"
                ? "Shop da tu choi de xuat cua ban."
                : detail.status === "countered"
                  ? "Shop chua the ban voi muc gia nay."
                  : "");

          if (botText) {
            chatMessages.push({
              type: "bot",
              text: botText,
              time: detail.time,
            });
          }
        }

        if (detail.status === "accepted") {
          acceptedPrice = detail.botPrice || detail.customerPrice;
        }
      });
    }

    const sessionStatus = bargainData.sessionStatus;
    if (sessionStatus === "accepted" && acceptedPrice) {
      chatMessages.push({
        type: "bot",
        text: "Ban muon mua so luong bao nhieu?",
        time: new Date(),
      });
    }

    setMessages(chatMessages);
    setAgreedPrice(acceptedPrice);
    setAwaitingQuantity(sessionStatus === "accepted");
    setConfirmedQuantity(null);
    setFinalStatus(FINAL_STATUSES.includes(sessionStatus) ? sessionStatus : null);
  };

  const loadBargainDetails = async (fallbackBargain = bargain) => {
    try {
      setErrorMessage("");
      const details = await bargainService.getById(bargain.bargainId);
      let bargainData = fallbackBargain;

      if (Array.isArray(details) && details.length > 0) {
        const rows = [...details].sort((a, b) => Number(a.round || 0) - Number(b.round || 0));
        const detailRows = rows.filter((row) => Number(row.round || 0) > 0);
        const latestRow = rows[rows.length - 1];

        bargainData = {
          ...fallbackBargain,
          ...latestRow,
          sessionStatus: latestRow.sessionStatus || latestRow.status,
          details: detailRows.map((row) => ({
            round: row.round,
            customerPrice: row.offerPrice,
            botPrice: row.botPrice,
            botMessage: row.botMessage || row.note || "",
            customerMessage: row.customerMessage || "",
            status: row.status,
            autoReplyAt: row.autoReplyAt,
            responder: row.responder,
            time: row.time,
            quantity: row.quantity,
          })),
        };
      }

      setBargainDetails(bargainData);
      buildMessages(bargainData);
    } catch (err) {
      setErrorMessage(err.message || "Loi khi tai chi tiet phien thuong luong");
      buildMessages(fallbackBargain);
    }
  };

  useEffect(() => {
    loadBargainDetails();
  }, [bargain]);

  useEffect(() => {
    const latest = bargainDetails.details?.[bargainDetails.details.length - 1];
    if (latest?.status !== "pending") return undefined;

    const timer = setInterval(() => {
      loadBargainDetails(bargainDetails);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [bargainDetails]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleQuantitySubmit = () => {
    const quantity = Math.floor(Number(inputValue));
    if (!quantity || quantity < 1) {
      setErrorMessage("Vui long nhap so luong hop le");
      return;
    }

    const now = new Date();
    setMessages((prev) => [
      ...prev,
      {
        type: "customer",
        text: `Toi muon mua ${quantity} san pham`,
        time: now,
      },
      {
        type: "bot",
        text: `Shop dong y ban ${quantity} san pham voi gia ${currency(agreedPrice)}`,
        time: now,
      },
    ]);
    setConfirmedQuantity(quantity);
    setAwaitingQuantity(false);
    setInputValue("");
    setErrorMessage("");
  };

  const handlePriceSubmit = async () => {
    if (!inputValue || isNaN(inputValue)) {
      setErrorMessage("Vui long nhap muc gia hop le");
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
        autoReplyAt: response.autoReplyAt,
        time: now,
        quantity: bargainDetails.quantity || 1,
      };

      setBargainDetails((prev) => ({
        ...prev,
        sessionStatus: FINAL_STATUSES.includes(response.status) ? response.status : "negotiating",
        details: [...(prev.details || []), nextDetail],
      }));

      setMessages((prev) => [
        ...prev,
        {
          type: "customer",
          text: `Toi muon mua voi gia ${currency(price)}`,
          time: now,
        },
        response.status === "pending"
          ? {
              type: "bot",
              text: "Shop da nhan de xuat cua ban va se phan hoi trong 10 phut.",
              subtext: response.autoReplyAt
                ? `Tu dong phan hoi luc ${dateTime(response.autoReplyAt)} neu admin chua tra loi`
                : "",
              time: now,
            }
          : {
              type: "bot",
              text: response.botMessage,
              time: now,
            },
      ]);

      if (response.status === "accepted") {
        setAgreedPrice(response.botPrice || price);
        setAwaitingQuantity(true);
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "Ban muon mua so luong bao nhieu?",
            time: new Date(),
          },
        ]);
      }

      if (FINAL_STATUSES.includes(response.status)) {
        setFinalStatus(response.status);
      }

      setInputValue("");
    } catch (err) {
      setErrorMessage(err.message || "Loi khi gui de xuat gia");
      await loadBargainDetails(bargainDetails);
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
  const latestDetail = bargainDetails.details?.[bargainDetails.details.length - 1];
  const isWaitingForShop = latestDetail?.status === "pending";
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
                  finalStatus === "accepted"
                    ? "#16a34a"
                    : finalStatus === "rejected" || finalStatus === "expired"
                      ? "#dc2626"
                      : isWaitingForShop
                        ? "#2563eb"
                        : "#eab308",
              }}
            >
              {finalStatus === "accepted"
                ? "Chap nhan"
                : finalStatus === "rejected"
                  ? "Tu choi"
                  : finalStatus === "expired"
                    ? "Het han"
                    : isWaitingForShop
                      ? "Cho shop phan hoi"
                      : `Vong ${Math.min(currentRound + 1, 3)}/3`}
            </span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Dong phien thuong luong">
            &larr;
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
          <div role="alert" className="bargain-chat-error">
            {errorMessage}
          </div>
        )}

        {isWaitingForShop && !awaitingQuantity && (
          <div className="bargain-chat-waiting">
            Dang cho shop phan hoi. Ban se tiep tuc gui gia sau khi shop tra loi.
          </div>
        )}

        {(!isFinished || awaitingQuantity) && !isWaitingForShop && (
          <div className="bargain-chat-input">
            <input
              type="number"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder={awaitingQuantity ? "Nhap so luong muon mua" : "Nhap muc gia cua ban (VND)"}
              disabled={loading}
              min={awaitingQuantity ? "1" : "1000"}
            />
            <button onClick={handleSendMessage} disabled={loading || !inputValue} className="btn btn-primary">
              {loading ? "Dang gui..." : "Gui"}
            </button>
          </div>
        )}

        {isFinished && !awaitingQuantity && (
          <div className="bargain-chat-actions">
            {finalStatus === "accepted" ? (
              <button onClick={handleAccept} className="btn btn-success" disabled={!canOrder}>
                Dat hang ngay
              </button>
            ) : (
              <button onClick={onClose} className="btn btn-outline">
                Quay lai
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BargainChat;
