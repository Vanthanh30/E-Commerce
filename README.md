# WebTraGiaNoiThat Node.js + React

Ung dung moi chay song song voi du an ASP.NET MVC cu.

## Backend stack

- Node.js + Express
- MongoDB + Mongoose
- Cloudinary de luu anh san pham
- Multer de nhan file upload
- bcryptjs de hash password

## Cau hinh

Backend doc cau hinh tu `server/.env`.

File hien tai can co dang:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173

MONGODB_URI=mongodb://127.0.0.1:27017/TMDTNoiThatCu

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=web-tra-gia-noi-that
JWT_SECRET=...
```

Neu dung MongoDB local, can dam bao service MongoDB dang chay. Neu dung MongoDB Atlas, thay `MONGODB_URI` bang connection string Atlas hop le.

## Cai dat

Chay tai thu muc `node-react-app`:

```powershell
npm install
```

## Chay backend

Chay rieng backend:

```powershell
npm run dev --workspace server
```

Neu chay thanh cong se thay:

```text
MongoDB connected: TMDTNoiThatCu
API running at http://localhost:4000
```

Production mode:

```powershell
npm run start --workspace server
```

## Test bang Thunder Client

Base URL:

```text
http://localhost:4000
```

Trong VS Code, mo Thunder Client va tao cac request ben duoi.

### 1. Login

Admin login:

```text
POST http://localhost:4000/api/auth/login
Content-Type: application/json
```

Body:

```json
{
  "username": "admin",
  "password": "admin"
}
```

Customer register:

```text
POST http://localhost:4000/api/auth/register
Content-Type: application/json
```

Body:

```json
{
  "username": "customer01",
  "password": "123456",
  "confirmPassword": "123456",
  "email": "customer01@test.local",
  "fullName": "Customer One",
  "phoneNumber": "0900000001",
  "address": "TP HCM",
  "birthDate": "2001-01-01"
}
```

Customer login:

```text
POST http://localhost:4000/api/auth/login
Content-Type: application/json
```

Body:

```json
{
  "username": "customer01",
  "password": "123456"
}
```

Response thanh cong se co:

```json
{
  "role": "customer",
  "user": {
    "customerId": "0900000001"
  }
}
```

Dung `customerId` nay de test cart va order.

### 2. CRUD product

Truoc khi tao product, can co category.

Create category:

```text
POST http://localhost:4000/api/categories
Content-Type: application/json
```

Body:

```json
{
  "name": "Chair",
  "description": "Used chair category"
}
```

Response:

```json
{
  "categoryId": "DM001"
}
```

Create product khong upload anh:

```text
POST http://localhost:4000/api/products
Content-Type: application/json
```

Body:

```json
{
  "categoryId": "DM001",
  "name": "Wooden Chair",
  "fixedPrice": 1200000,
  "minPrice": 900000,
  "stock": 10,
  "description": "Used wooden chair"
}
```

Response:

```json
{
  "productId": "SP001"
}
```

Create product co upload anh:

```text
POST http://localhost:4000/api/products
Body type: Form
```

Trong tab `Body` cua Thunder Client, chon `Form`, them cac field:

```text
"categoryId": "DM001"
"name": "Wooden Chair With Image"
"fixedPrice": "1200000"
"minPrice": "900000"
"stock": "10"
"description": "Used wooden chair"
"image": chon File
```

Luu y voi Thunder Client:

- Neu chon `JSON`, body phai la JSON hop le va key can co dau nhay kep, vi du `"name"`.
- Neu chon `Form` de upload anh, cot `Field` nhap ten field tuong ung nhu `"name"`, `"categoryId"`, `"image"` theo vi du tren.

Get all products:

```text
GET http://localhost:4000/api/products
```

Get product detail:

```text
GET http://localhost:4000/api/products/SP001
```

Update product:

```text
PUT http://localhost:4000/api/products/SP001
Content-Type: application/json
```

Body:

```json
{
  "categoryId": "DM001",
  "name": "Wooden Chair Updated",
  "fixedPrice": 1300000,
  "minPrice": 950000,
  "stock": 8,
  "description": "Updated product description"
}
```

Soft delete product:

```text
DELETE http://localhost:4000/api/products/SP001
```

Xem ca product da bi an:

```text
GET http://localhost:4000/api/products?includeInactive=true
```

### 3. CRUD cart

Can co:

```text
customerId = 0900000001
productId = SP001
```

Get cart:

```text
GET http://localhost:4000/api/cart/0900000001
```

Add product to cart:

```text
POST http://localhost:4000/api/cart
Content-Type: application/json
```

Body:

```json
{
  "customerId": "0900000001",
  "productId": "SP001",
  "quantity": 2
}
```

Neu add lai cung product, backend se tang quantity, nhung khong vuot qua `stock`.

Update cart item quantity:

```text
PATCH http://localhost:4000/api/cart/0900000001/SP001
Content-Type: application/json
```

Body:

```json
{
  "quantity": 3
}
```

Delete cart item:

```text
DELETE http://localhost:4000/api/cart/0900000001/SP001
```

Sau khi delete, test lai:

```text
GET http://localhost:4000/api/cart/0900000001
```

Response mong doi:

```json
[]
```

### 4. Order flow

Create order:

```text
POST http://localhost:4000/api/orders
Content-Type: application/json
```

Body:

```json
{
  "customerId": "0900000001",
  "productId": "SP001",
  "quantity": 1,
  "price": 1200000,
  "address": "TP HCM"
}
```

Response:

```json
{
  "orderId": "0900000001HD001"
}
```

Backend se:

- Tao order
- Tru stock cua product
- Xoa product do khoi cart neu dang co trong cart

Get orders cua customer:

```text
GET http://localhost:4000/api/orders?customerId=0900000001
```

Get order detail:

```text
GET http://localhost:4000/api/orders/0900000001HD001
```

Update order status:

```text
PATCH http://localhost:4000/api/orders/0900000001HD001/status
Content-Type: application/json
```

Body:

```json
{
  "status": 2
}
```

Order status:

```text
1 = Cho xac nhan
2 = Da xac nhan
3 = Dang giao
4 = Da giao
5 = Da huy
```

Get all orders by status:

```text
GET http://localhost:4000/api/orders?status=2
```

## Naming convention

Backend da chuyen sang ten field tieng Anh:

```text
customerId, fullName, address, birthDate, username, password, email
categoryId, name, description
productId, fixedPrice, minPrice, stock, imageUrl
orderId, saleDate, paymentMethod, shippingAddress
bargainId, round, price, quantity, note, status, statusText
```

## Bargain flow

Mac ca toi da 3 round.

```text
round 1 pending   -> admin accept / reject / counter
round 1 countered -> customer gui round 2
round 2 pending   -> admin accept / reject / counter
round 2 countered -> customer gui round 3
round 3 pending   -> admin chi duoc accept / reject
```

Neu admin accept, backend tu tao order va tru stock.

## Luu y

- Admin mac dinh duoc seed vao MongoDB khi server start: `admin / admin`.
- Password duoc hash bang bcrypt.
- Xoa category/product hien la soft delete, cap nhat `status = 0`.
- Du lieu cu trong MongoDB co field tieng Viet se khong tu dong migrate sang field tieng Anh.
