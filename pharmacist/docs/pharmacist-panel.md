# Pharmacist Fulfillment Panel

This module turns Prescripto into a full e-prescription delivery pipeline. Doctors generate prescriptions, patients choose a pharmacy, and pharmacists drive the order to completion with real-time status updates.

---

## 🎯 Key Capabilities

- **Role-based access** – Pharmacists authenticate separately from doctors/admins.
- **Prescription fulfillment** – View full e-prescriptions, medication line items, and patient delivery preferences.
- **Lifecycle management** – Move orders through `pending → accepted → processing → ready → shipped → completed` (with reject/cancel support).
- **Patient notifications** – Every status change triggers a notification entry for the patient, keeping them informed asynchronously.
- **Admin oversight** – Admins approve pharmacies, toggle availability, and can override order statuses when needed.

---

## 🗂️ Project Structure Additions

```
backend/
  controllers/
    pharmacistController.js
    prescriptionController.js
  middleware/
    authPharmacist.js
  models/
    pharmacyModel.js
    prescriptionModel.js
    pharmacyOrderModel.js
    notificationModel.js
  routes/
    pharmacistRoute.js
  utils/
    notificationService.js
pharmacist/
  (Vite + React + Tailwind pharmacist dashboard)
docs/
  pharmacist-panel.md (this file)
```

---

## ⚙️ Backend Setup

Make sure the backend is running with the following environment variables (existing `.env` support):

- `PORT=4000`
- `MONGODB_URI=...`
- `JWT_SECRET=...`
- `CLOUDINARY_*`, `STRIPE_*`, `RAZORPAY_*` (already used across the project)

No new secrets are required, but you can optionally configure:

- `NOTIFICATION_WEBHOOK_URL` (future integration placeholder)

Start the server (from `backend/`):

```bash
npm install
npm run server
```

The pharmacist APIs are mounted under `http://localhost:4000/api/pharmacist`.

---

## 🛠️ Pharmacist API Reference

### Auth & Profile

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/pharmacist/register` | Submit a pharmacy for admin approval (accepts `multipart/form-data` – optional license documents). |
| `POST` | `/api/pharmacist/login` | Authenticate pharmacist (`{ email, password }`). Returns JWT token. |
| `GET` | `/api/pharmacist/profile` | Fetch logged-in pharmacy profile. |
| `POST` | `/api/pharmacist/update-profile` | Update public contact info / delivery radius.

All authenticated requests require the `token` header with the pharmacist JWT.

### Dashboard & Orders

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/pharmacist/dashboard` | Summary stats (pending, in-progress, completed, revenue). |
| `POST` | `/api/pharmacist/orders` | List orders (`{ status?, search? }`). |
| `POST` | `/api/pharmacist/orders/detail` | Get full order + prescription detail (`{ orderId }`). |
| `POST` | `/api/pharmacist/orders/timeline` | Fetch status history (`{ orderId }`). |
| `POST` | `/api/pharmacist/orders/update-status` | Move order through lifecycle (`{ orderId, status, note?, logistics? }`). |
| `POST` | `/api/pharmacist/orders/prescription` | Fetch prescription tied to an order (used internally by the dashboard).

### Patient-Facing Pharmacy Flows

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/user/pharmacies` | List approved pharmacies. |
| `POST` | `/api/user/order-medicine` | Create pharmacy order from a prescription. |
| `GET` | `/api/user/pharmacy-orders` | Patient order history. |
| `POST` | `/api/user/pharmacy-orders/timeline` | Status timeline for a specific order. |
| `GET` | `/api/user/prescriptions` | List prescriptions available to the patient. |
| `POST` | `/api/user/prescription/detail` | Fetch prescription detail (patient view).

### Admin Oversight

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/admin/pharmacies?status=pending|approved` | List pharmacies. |
| `POST` | `/api/admin/pharmacies/review` | Approve or reject pharmacy (`{ pharmacyId, approve, notes? }`). |
| `POST` | `/api/admin/pharmacies/toggle-active` | Disable/enable pharmacy (`{ pharmacyId, isActive }`). |
| `GET` | `/api/admin/pharmacy-orders` | Search pharmacy orders (`status`, `pharmacyId`, `userId` filters). |
| `POST` | `/api/admin/pharmacy-orders/update-status` | Admin override on an order.

---

## 💻 Frontend (Pharmacist Panel)

Location: `pharmacist/`

Stack: React 18, Vite, Tailwind, React Router, Axios, React Toastify.

### Environment

Create a `.env` file in `pharmacist/` (optional – defaults shown):

```
VITE_BACKEND_URL=http://localhost:4000
```

### Install & Run

```bash
cd pharmacist
npm install
npm run dev
```

The dev server defaults to [http://localhost:5175](http://localhost:5175).

### Screens Included

- **Login** – Email/password auth for approved pharmacists.
- **Dashboard** – KPI cards + recent orders overview.
- **Orders** – Search/filter, order detail drawer, status transitions, timeline.
- **Settings** – Update public contact details and delivery radius.

All API calls are centralized in `src/context/PharmacistContext.jsx` with automatic toast feedback.

---

## 🔔 Notifications

Status changes and admin decisions create entries in the new `notification` Mongo collection. These can be surfaced later in patient/mobile apps or used to trigger emails/SMS.

---

## ✅ Next Steps / Ideas

- Wire push/email channels into `backend/utils/notificationService.js`.
- Add websocket (Socket.IO) layer for live updates on both patient and pharmacist UIs.
- Extend `Settings` page for operating hours, payout details, and license document uploads.
- Build analytics cards in the admin panel using `adminPharmacyOrders` aggregations.

---

Happy shipping! 💊
