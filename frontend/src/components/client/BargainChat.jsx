import React, { useEffect, useRef, useState } from "react";
import { bargainService } from "../../services/client/bargainService";
import { cartService } from "../../services/client/cartService";
import { currency, dateTime } from "../../utils/formatters";
import "./BargainChat.css";

const FINAL_STATUSES = ["accepted", "rejected", "expired"];
const POLL_INTERVAL_MS = 10000;
const SHOP_RESPONSE_MINUTES = 1;

function normalizeBotMessage(message) {
  const text = message?.trim();
  if (!text) return "";

  if (text === "Shop dong y muc gia") {
    return "Shop đồng ý mức giá";
  }

  const acceptedMatch = text.match(/^Shop dong y muc gia\s+(.+)\s+VND$/i);
  if (acceptedMatch) {
    return `Shop đồng ý mức giá ${currency(acceptedMatch[1])}.`;
  }

  const rejectedMatch = text.match(/^Shop tu choi muc gia\s+(.+)\s+VND/i);
  if (rejectedMatch) {
    return `Shop từ chối mức giá ${currency(rejectedMatch[1])}. Cảm ơn bạn đã tham gia mặc cả.`;
  }

  const legacyMessages = {
    "Shop chua the ban voi muc gia nay.": "Shop chưa thể bán với mức giá này.",
    "Shop da tu choi de xuat cua ban.": "Shop đã từ chối đề xuất của bạn.",
  };

  return legacyMessages[text] || text;
}

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
  const [addedToCart, setAddedToCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const messagesEndRef = useRef(null);

  const buildMessages = (bargainData) => {
    const chatMessages = [
      {
        type: "bot",
        text: `Chào mừng bạn đến với phiên thương lượng sản phẩm "${bargainData.productName}". Giá niêm yết: ${currency(bargainData.listedPrice)}. Bạn hãy đề xuất mức giá muốn mua.`,
        time: new Date(),
      },
    ];

    let acceptedPrice = null;

    if (Array.isArray(bargainData.details)) {
      bargainData.details.forEach((detail) => {
        chatMessages.push({
          type: "customer",
          text: `Tôi muốn mua với giá ${currency(detail.customerPrice)}`,
          subtext: detail.customerMessage || "",
          time: detail.time,
        });

        if (detail.status === "pending") {
          chatMessages.push({
            type: "bot",
            text: `Shop đã nhận đề xuất của bạn và sẽ phản hồi trong ${SHOP_RESPONSE_MINUTES} phút.`,
            subtext: detail.autoReplyAt
              ? `Tự động phản hồi lúc ${dateTime(detail.autoReplyAt)} nếu admin chưa trả lời`
              : "",
            time: detail.time,
          });
        } else {
          const note = normalizeBotMessage(detail.botMessage);
          const botText =
            detail.status === "accepted"
              ? note || `Shop chấp nhận mức giá ${currency(detail.botPrice || detail.customerPrice)} của bạn.`
              : detail.status === "rejected"
                ? note || "Shop đã từ chối đề xuất của bạn."
                : detail.status === "countered"
                  ? note || "Shop chưa thể bán với mức giá này."
                  : note || "";

          if (botText) {
            chatMessages.push({
              type: "bot",
              text: botText,
              subtext: detail.status === "countered" ? currency(detail.botPrice) : "",
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
    const productStock = bargainData.stock ?? 0;
    const orderExpired =
      bargainData.orderSessionExpiresAt &&
      new Date() > new Date(bargainData.orderSessionExpiresAt);
    const lastDetailTime =
      new Date(bargainData.details?.[bargainData.details.length - 1]?.time || Date.now());
    const quantityConversationTime = new Date(lastDetailTime.getTime() + 1000);

    if (sessionStatus === "accepted" && acceptedPrice) {
      // Luôn hiển thị câu hỏi về số lượng
      chatMessages.push({
        type: "bot",
        text: "Bạn muốn mua số lượng bao nhiêu?",
        subtext:
          productStock > 0
            ? `Còn hàng: ${productStock}`
            : "Hiện tại sản phẩm đã hết hàng",
        time: quantityConversationTime,
      });

      if (bargainData.confirmedQuantity) {
        chatMessages.push({
          type: "customer",
          text: `Tôi muốn mua ${bargainData.confirmedQuantity} sản phẩm`,
          time: quantityConversationTime,
        });
        chatMessages.push({
          type: "bot",
          text: `Shop đồng ý bán ${bargainData.confirmedQuantity} sản phẩm với giá ${currency(acceptedPrice * bargainData.confirmedQuantity)}`,
          time: quantityConversationTime,
        });
      }
    }

    if (sessionStatus === "accepted" && orderExpired) {
      chatMessages.push({
        type: "bot",
        text: "Phiên đặt hàng đã hết hạn. Cảm ơn bạn đã tham gia.",
        time: new Date(),
      });
    }

    if (sessionStatus === "expired") {
      chatMessages.push({
        type: "bot",
        text: "Phiên thương lượng đã hết hạn. Không thể tiếp tục thỏa thuận.",
        time: new Date(),
      });
    }

    setMessages(chatMessages);
    setAgreedPrice(acceptedPrice);
    setAwaitingQuantity(
      sessionStatus === "accepted" &&
      !bargainData.confirmedQuantity &&
      !orderExpired,
    );
    setConfirmedQuantity(bargainData.confirmedQuantity || null);
    setFinalStatus(FINAL_STATUSES.includes(sessionStatus) ? sessionStatus : null);
    setAddedToCart(Boolean(bargainData.addedToCart));
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
            responseTime: row.responseTime || null,
            quantity: row.quantity,
          })),
          confirmedQuantity: latestRow.confirmedQuantity || null,
          orderSessionExpiresAt: latestRow.orderSessionExpiresAt || null,
          addedToCart: Boolean(latestRow.addedToCart),
        };
      }

      setBargainDetails(bargainData);
      buildMessages(bargainData);
    } catch (err) {
      setErrorMessage(err.message || "Lỗi khi tải chi tiết phiên thương lượng");
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

  const handleQuantitySubmit = async () => {
    const quantity = Math.floor(Number(inputValue));
    const productStock = bargainDetails.stock ?? 0;

    if (!quantity || quantity < 1) {
      setErrorMessage("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    if (productStock <= 0) {
      setErrorMessage("Sản phẩm hiện đã hết hàng");
      return;
    }

    if (quantity > productStock) {
      const now = new Date();
      setMessages((prev) => [
        ...prev,
        {
          type: "customer",
          text: `Tôi muốn mua ${quantity} sản phẩm`,
          time: now,
        },
        {
          type: "bot",
          text: `Còn hàng ${productStock} sản phẩm!`,
          time: now,
        },
      ]);
      setErrorMessage(`Số lượng tối đa hiện có là ${productStock}`);
      return;
    }

    try {
      await bargainService.confirm(bargainDetails.bargainId, { quantity });
    } catch (err) {
      await loadBargainDetails(bargainDetails);
      return;
    }

    const now = new Date();
    setMessages((prev) => [
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
    ]);
    setConfirmedQuantity(quantity);
    setAwaitingQuantity(false);
    setBargainDetails((prev) => ({ ...prev, confirmedQuantity: quantity }));
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
          text: `Tôi muốn mua với giá ${currency(price)}`,
          time: now,
        },
        response.status === "pending"
          ? {
            type: "bot",
            text: `Shop đã nhận đề xuất của bạn và sẽ phản hồi trong ${SHOP_RESPONSE_MINUTES} phút.`,
            subtext: response.autoReplyAt
              ? `Tự động phản hồi lúc ${dateTime(response.autoReplyAt)} nếu admin chưa trả lời`
              : "",
            time: now,
          }
          : {
            type: "bot",
            text: normalizeBotMessage(response.botMessage),
            time: now,
          },
      ]);

      if (response.status === "accepted") {
        const productStock = bargainDetails.stock ?? 0;
        setAgreedPrice(response.botPrice || price);
        setAwaitingQuantity(true);
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "Bạn muốn mua số lượng bao nhiêu?",
            subtext:
              productStock > 0
                ? `Còn hàng ${productStock} sản phẩm`
                : "Hiện tại sản phẩm đã hết hàng",
            time: new Date(),
          },
        ]);
      }

      if (FINAL_STATUSES.includes(response.status)) {
        setFinalStatus(response.status);
      }

      setInputValue("");
    } catch (err) {
      setErrorMessage(err.message || "Lỗi khi gửi đề xuất giá");
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
    const orderExpired =
      bargainDetails.orderSessionExpiresAt &&
      new Date() > new Date(bargainDetails.orderSessionExpiresAt);
    const productStock = bargainDetails.stock ?? 0;
    const quantity = confirmedQuantity || bargainDetails.quantity || 1;

    if (orderExpired) {
      setErrorMessage("Phiên đặt hàng đã hết hạn. Cảm ơn bạn đã tham gia");
      return;
    }

    if (productStock <= 0) {
      setErrorMessage("Sản phẩm hiện đã hết hàng");
      return;
    }

    if (quantity > productStock) {
      setErrorMessage(`Số lượng tối đa hiện có là ${productStock}`);
      return;
    }

    try {
      setAddingToCart(true);
      setErrorMessage("");
      const user = JSON.parse(sessionStorage.getItem("user"));
      if (!user || !user.customerId) {
        setAddingToCart(false);
        setErrorMessage("Không tìm thấy thông tin người dùng");
        return;
      }

      await cartService.addToCart({
        customerId: user.customerId,
        productId: bargainDetails.productId,
        bargainId: bargainDetails.bargainId,
        quantity,
        price: agreedPrice,
      });

      setAddedToCart(true);
      setBargainDetails((prev) => ({ ...prev, addedToCart: true }));
    } catch (err) {
      setErrorMessage(err.message || "Lỗi khi thêm vào giỏ hàng");
    }
    setAddingToCart(false);
  };

  const currentRound = bargainDetails.details?.length || 0;
  const latestDetail = bargainDetails.details?.[bargainDetails.details.length - 1];
  const productStock = bargainDetails.stock ?? 0;
  const orderExpired =
    bargainDetails.orderSessionExpiresAt &&
    new Date() > new Date(bargainDetails.orderSessionExpiresAt);
  const sessionExpired = bargainDetails.sessionStatus === "expired";
  const isWaitingForShop = latestDetail?.status === "pending" && !sessionExpired;
  const isFinished = FINAL_STATUSES.includes(finalStatus);
  const canOrder =
    finalStatus === "accepted" &&
    confirmedQuantity &&
    agreedPrice &&
    !awaitingQuantity &&
    !orderExpired &&
    productStock > 0;

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
                ? "Chấp nhận"
                : finalStatus === "rejected"
                  ? "Từ chối"
                  : finalStatus === "expired"
                    ? "Hết hạn"
                    : isWaitingForShop
                      ? "Chờ shop phản hồi"
                      : `Vòng ${Math.min(currentRound + 1, 3)}/3`}
            </span>
            {finalStatus === "accepted" && bargainDetails.orderSessionExpiresAt && (
              <div className="chat-order-expiry">
                {orderExpired
                  ? "Phiên đặt hàng đã hết hạn"
                  : `Thời hạn đặt hàng: ${dateTime(bargainDetails.orderSessionExpiresAt)}`}
              </div>
            )}
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Đóng phiên thương lượng">
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

        {isWaitingForShop && !awaitingQuantity && !orderExpired && (
          <div className="bargain-chat-waiting">
            Đang chờ shop phản hồi. Bạn sẽ tiếp tục gửi giá sau khi shop trả lời.
          </div>
        )}

        {(!isFinished || awaitingQuantity) && !isWaitingForShop && (
          <div className="bargain-chat-input">
            <input
              type="number"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder={awaitingQuantity ? "Nhập số lượng muốn mua" : "Nhập mức giá của bạn (VND)"}
              disabled={loading || (awaitingQuantity && (orderExpired || productStock <= 0))}
              min={awaitingQuantity ? "1" : "1000"}
              max={awaitingQuantity ? productStock || undefined : undefined}
            />
            <button
              onClick={handleSendMessage}
              disabled={
                loading ||
                !inputValue ||
                (awaitingQuantity && (orderExpired || productStock <= 0))
              }
              className="btn btn-primary"
            >
              {loading ? "Đang gửi..." : "Gửi"}
            </button>
          </div>
        )}

        {isFinished && !awaitingQuantity && (
          <div className="bargain-chat-actions">
            {finalStatus === "accepted" && !orderExpired && !addedToCart ? (
              <button
                onClick={handleAccept}
                className="btn btn-success"
                disabled={!canOrder || addingToCart}
              >
                {addingToCart ? "Đang xử lý..." : "Đặt hàng ngay"}
              </button>
            ) : addedToCart ? (
              <button
                className="btn"
                disabled
                style={{
                  background: "#d1d5db",
                  color: "#6b7280",
                  border: "none",
                  cursor: "not-allowed",
                }}
              >
                Đã thêm vào giỏ
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
