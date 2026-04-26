# 📚 Moodle Setup (Docker)

This document explains how to set up **Moodle LMS** using Docker and MariaDB.

---

## 🚀 Prerequisites

* Docker installed
* Docker Compose installed
* Ports `8082` and `8443` open in firewall / security group

---

## 📁 Step 1: Navigate to Moodle Folder

```bash
cd moodle
```

---

## ⚙️ Step 2: Start Services

```bash
docker-compose up -d
```

---

## 🔍 Step 3: Verify Containers

```bash
docker ps
```

You should see:

* `moodle-app` (Moodle)
* `moodle-db` (MariaDB)

---

## 🌐 Step 4: Access Moodle

Open in browser:

```text
http://<public-ip>:8082
```

---

## 🔐 Default Credentials

* **Username:** admin
* **Password:** Admin123!

---

## ⚠️ Reverse Proxy Fix (IMPORTANT)

If Moodle is used behind Nginx, update config:

```bash
docker exec -it moodle-app bash
```

```bash
apt update && apt install nano -y
nano /bitnami/moodle/config.php
```

---

### 🔧 Update these lines:

```php
$CFG->wwwroot = 'http://<public-ip>:8080';
$CFG->reverseproxy = true;
$CFG->sslproxy = false;
```

---

## 🔄 Restart Moodle

```bash
docker restart moodle-app
```

---

## 🧹 Clear Cache (Fix CSS Issues)

```bash
docker exec -it moodle-app bash
rm -rf /bitnami/moodledata/cache/*
rm -rf /bitnami/moodledata/localcache/*
exit
docker restart moodle-app
```

---

## 🧠 Notes

* Moodle uses **MariaDB** as database
* HTTPS (8443) is enabled by default but optional
* Reverse proxy requires correct `wwwroot`
* Ensure internal networking between containers is working

---

## 🐳 Stop Services

```bash
docker-compose down
```

---

## 📌 Troubleshooting

### ❌ CSS not loading

→ Fix `wwwroot` and clear cache

### ❌ Connection reset

→ Check HTTPS redirect (8443)

### ❌ Container not starting

```bash
docker logs moodle-app
```

---

## 🎯 Access Summary

| Service | URL                      |
| ------- | ------------------------ |
| Moodle  | http://<public-ip>:8082  |
| HTTPS   | https://<public-ip>:8443 |

---

## 📦 Tech Stack

* Moodle LMS
* MariaDB
* Docker
* Nginx (Reverse Proxy)

---
