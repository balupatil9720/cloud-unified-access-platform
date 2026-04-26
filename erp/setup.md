# 🧠 ERPNext Setup (Docker)

This document explains how to run ERPNext using Docker.

---

## 🚀 Step 1: Pull Image

```bash
docker pull lukptr/erpnext7
```

---

## ⚙️ Step 2: Run ERPNext Container

```bash
docker run -d \
--name erpnext \
-p 8090:80 \
lukptr/erpnext7
```

---

## 🌐 Access ERPNext

```
http://<public-ip>:8090
```

---

## 🔐 Default Login

* Username: `Administrator`
* Password: `admin`

---

## 🔄 Reset Password (if needed)

```bash
docker exec -it erpnext bash
bench console
```

Then run:

```python
frappe.utils.password.update_password("Administrator", "admin123")
frappe.db.commit()
```

---

## 🧠 Notes

* Ensure port `8090` is open in security groups
* ERPNext uses MariaDB internally
* WebSocket support required for full functionality
