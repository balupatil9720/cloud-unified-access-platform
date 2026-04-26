# 🏢 Odoo Setup (Docker)

This document explains how to set up Odoo ERP using Docker.

---

## 🚀 Step 1: Create Docker Network

```bash
docker network create odoo-net
```

---

## 🗄️ Step 2: Start PostgreSQL Database

```bash
docker run -d \
--name odoo-db \
--network odoo-net \
-e POSTGRES_USER=odoo \
-e POSTGRES_PASSWORD=odoo \
-e POSTGRES_DB=postgres \
postgres:15
```

---

## ⚙️ Step 3: Start Odoo

```bash
docker run -d \
--name odoo \
--network odoo-net \
-p 8069:8069 \
-e HOST=odoo-db \
-e USER=odoo \
-e PASSWORD=odoo \
-e PROXY_MODE=True \
odoo
```

---

## 🌐 Access Odoo

```
http://<public-ip>:8069
```

---

## 🔐 Create Database

* Master Password: `admin123`
* Database Name: `odoo_db`
* Email: `admin@example.com`
* Password: `admin123`

---

## 🧠 Notes

* Ensure port `8069` is open in security groups
* Odoo requires PostgreSQL (configured above)
* Avoid using `postgres` as DB user (security restriction)
