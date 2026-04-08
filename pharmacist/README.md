# Prescripto Pharmacist Panel

A focused dashboard that lets pharmacists fulfill e-prescriptions, update order statuses, and keep patients informed in real time.

## ✨ Features

- Secure pharmacist JWT authentication
- KPI dashboard with pending/in-progress/completed counts
- Orders workspace with status transitions and patient notes
- Prescription snapshot viewer and timeline history
- Profile settings for contact and delivery radius

## 🚀 Getting Started

```bash
cd pharmacist
npm install
npm run dev
```

The dev server uses [http://localhost:5175](http://localhost:5175) by default. Override the backend API base via `.env`:

```
VITE_API_URL=http://localhost:4000
```

## 🔌 API Dependencies

This UI consumes the new pharmacist endpoints exposed under `/api/pharmacist`. See `../docs/pharmacist-panel.md` for the complete API reference, role matrix, and workflow details.

## 🧱 Tech Stack

- React 18 + Vite
- Tailwind CSS
- React Router
- Axios + React Toastify

## 📦 Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production bundle |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint (shared config) |

## 🛣️ Roadmap Ideas

- Socket-based live updates for new orders
- Deeper analytics (daily volumes, conversion rates)
- Editable operating hours & payout settings
- File uploads for updated pharmacy licenses

Stay compliant, fulfill faster, and delight patients. 💊
