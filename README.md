<<<<<<< HEAD
# SmartDesk AI V4 🤖

Full role-based AI customer support system.

## What's New in V4
- 👤 Customer portal — submit & view only their own tickets
- 🛡️ Admin dashboard — view all tickets, edit AI reply, send email
- ✅ Alert on ticket creation
- 🔄 Role-based redirect after login
- 📧 Admin can edit AI reply and send to customer via email

## Role Flow
- **Customer login** → `/my-tickets` (own tickets only)
- **Admin login** → `/dashboard` (all tickets + edit/send reply)

## Setup
```bash
cd client
npm install --legacy-peer-deps
npm run dev
```

 

