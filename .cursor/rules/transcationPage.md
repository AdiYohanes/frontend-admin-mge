# 📄 Implementasi API Booking di Transaction Page

## Endpoint

`GET /api/admin/bookings`

Digunakan untuk mengambil semua data booking. Endpoint ini mendukung **pagination** dan bisa digunakan untuk filter berdasarkan **status**.

---

## 🎯 Tujuan

- Menampilkan semua data **booking dengan status `completed`**.
- Menggunakan **pagination** agar performa tetap optimal.
- Filter **status dilakukan di backend** untuk efisiensi dan simplicity.

---

## ✅ Alasan Filter di Backend

- Mengurangi jumlah data yang dikirim dari server ke frontend.
- Mengurangi beban render di frontend.
- Menjaga efisiensi API call dan performa UI.

---

## 🔧 Query Params yang Digunakan

| Parameter | Tipe   | Deskripsi                       |
| --------- | ------ | ------------------------------- |
| `page`    | number | Halaman keberapa (mulai dari 1) |
| `limit`   | number | Jumlah data per halaman         |
| `status`  | string | Status booking (`completed`)    |

---

## 🔁 Contoh API Request

```http
GET /api/admin/bookings?page=1&limit=10&status=completed
```

---

## 💻 Contoh Implementasi (Frontend – React/JS)

```js
async function fetchBookings(page = 1, limit = 10) {
  try {
    const res = await fetch(
      `/api/admin/bookings?page=${page}&limit=${limit}&status=completed`
    );
    const data = await res.json();
    return {
      bookings: data.data, // asumsi response pakai format { data: [], meta: {} }
      totalPages: data.meta.totalPages,
    };
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return { bookings: [], totalPages: 0 };
  }
}
```

---

## 🔁 Pagination Handling (Simplified Example)

```js
const [page, setPage] = useState(1);
const [bookings, setBookings] = useState([]);
const [totalPages, setTotalPages] = useState(0);

useEffect(() => {
  fetchBookings(page).then(({ bookings, totalPages }) => {
    setBookings(bookings);
    setTotalPages(totalPages);
  });
}, [page]);
```

---

## 📌 Catatan Tambahan

- Jika backend belum support filter `status=completed`, kamu bisa request untuk tambahkan di endpoint backend.
- Gunakan **debounce** atau **pagination yang lazy load** jika dataset sangat besar.

---

## 📚 Respons Backendnya

```json
{
  "current_page": 1,
  "data": [
    {
      "id": 6,
      "invoice_number": "EVT-20250726-O8OCNL",
      "bookable_type": "App\\Models\\User",
      "bookable_id": 1,
      "unit_id": 1,
      "game_id": null,
      "start_time": "2025-07-12 14:00:00",
      "end_time": "2025-07-12 18:00:00",
      "total_price": "0.00",
      "status": "completed",
      "notes": "Event Booking: John's Birthday Tournament",
      "created_at": "2025-07-26T09:06:20.000000Z",
      "updated_at": "2025-07-26T10:03:03.000000Z",
      "deleted_at": null,
      "event_id": 2,
      "total_visitors": 2,
      "promo_id": null,
      "reminder_sent": false,
      "created_by_admin_id": null,
      "tax_amount": "0.00",
      "service_fee_amount": "0.00",
      "bookable": {
        "id": 1,
        "username": "admin",
        "name": "Admin Satu",
        "phone": "080000000001",
        "email": "admin@example.com",
        "role": "ADMN",
        "total_spend": "0.00",
        "api_token_expires_at": "2025-08-31T15:09:43.000000Z",
        "isActive": true,
        "remember_token": null,
        "created_at": "2025-07-25T02:54:55.000000Z",
        "updated_at": "2025-08-01T15:09:43.000000Z",
        "deleted_at": null,
        "total_points": 0
      },
      "unit": {
        "id": 1,
        "room_id": 1,
        "name": "Reguler 1",
        "description": "",
        "status": "available",
        "max_visitors": 4,
        "price": "10000.00",
        "created_at": "2025-07-25T02:54:56.000000Z",
        "updated_at": "2025-08-01T01:19:32.000000Z",
        "deleted_at": null,
        "point_id": 1,
        "room": {
          "id": 1,
          "name": "Reguler",
          "description": "Standard gaming stations for all players.",
          "max_visitors": 4,
          "is_available": true,
          "image": "images/rooms/h1sOhbU6OxanHdoNw1fklVaIJnjh60acN764YieL.jpg",
          "created_at": "2025-07-25T02:54:55.000000Z",
          "updated_at": "2025-07-28T07:05:03.000000Z",
          "deleted_at": null
        },
        "consoles": [
          {
            "id": 2,
            "name": "PlayStation 4",
            "description": "PlayStation 4",
            "image": "images/consoles/QGZr6VjyEjxHD8fRcImALYxBgfo2E6U9cZbj1Qyp.jpg",
            "amount": 2,
            "created_at": "2025-07-25T02:54:55.000000Z",
            "updated_at": "2025-07-31T06:16:58.000000Z",
            "deleted_at": null,
            "is_active": true,
            "pivot": {
              "unit_id": 1,
              "console_id": 2
            }
          }
        ],
        "games": [
          {
            "id": 9,
            "title": "It Takes Two",
            "description": "It Takes Two",
            "image": "images/games/dhJt8AzlkaxcxUmlwsj4tSoM8w5g6ZD1rjQLrBFe.png",
            "created_at": "2025-07-28T08:57:37.000000Z",
            "updated_at": "2025-07-31T07:01:18.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 9,
            "pivot": {
              "unit_id": 1,
              "game_id": 9
            }
          },
          {
            "id": 13,
            "title": "A Way Out",
            "description": "",
            "image": "images/games/qZbBzRHrn4dVk1TBHN3eOLqmsMbb4ra3J96YYOuV.webp",
            "created_at": "2025-07-31T06:25:36.000000Z",
            "updated_at": "2025-07-31T06:25:36.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 9,
            "pivot": {
              "unit_id": 1,
              "game_id": 13
            }
          },
          {
            "id": 17,
            "title": "Cyberpunk 2077",
            "description": "",
            "image": "images/games/gIuLCJpDiN3NNdZ5143SRabvE9GwPjnJ36718FnB.jpg",
            "created_at": "2025-07-31T06:27:43.000000Z",
            "updated_at": "2025-07-31T06:43:21.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 8,
            "pivot": {
              "unit_id": 1,
              "game_id": 17
            }
          },
          {
            "id": 1,
            "title": "EA Sports FC 25",
            "description": "",
            "image": "images/games/SLzVrUvGpcyiARNJ7jvPzPJwQDRlUBikWJpxxHx3.jpg",
            "created_at": "2025-07-25T02:54:55.000000Z",
            "updated_at": "2025-07-31T06:45:30.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 1,
            "pivot": {
              "unit_id": 1,
              "game_id": 1
            }
          },
          {
            "id": 19,
            "title": "Monopoly",
            "description": "",
            "image": "images/games/VoYazfg7qirOJypIrIXCjOS9sRnfI4SaQH6Efjw7.jpg",
            "created_at": "2025-07-31T06:29:33.000000Z",
            "updated_at": "2025-07-31T06:47:58.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 10,
            "pivot": {
              "unit_id": 1,
              "game_id": 19
            }
          },
          {
            "id": 15,
            "title": "Mortal Kombat 11",
            "description": "",
            "image": "images/games/G4Zb4l2OBZfyafs87ALrfHlWC8oT4n0tNnIpsMR2.png",
            "created_at": "2025-07-31T06:26:32.000000Z",
            "updated_at": "2025-07-31T06:49:21.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 5,
            "pivot": {
              "unit_id": 1,
              "game_id": 15
            }
          },
          {
            "id": 20,
            "title": "Moving Out",
            "description": "",
            "image": "images/games/tsIpzVUGwY0xOqj7AMdU1ofN8YydsZFmfzxWrSPg.jpg",
            "created_at": "2025-07-31T06:32:58.000000Z",
            "updated_at": "2025-07-31T06:50:01.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 10,
            "pivot": {
              "unit_id": 1,
              "game_id": 20
            }
          },
          {
            "id": 18,
            "title": "Overcooked!2",
            "description": "",
            "image": "images/games/C9vsArKzLCtYLovXK3AiqrQnct4TbiuXlLMJG1wZ.jpg",
            "created_at": "2025-07-31T06:28:14.000000Z",
            "updated_at": "2025-07-31T06:28:14.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 10,
            "pivot": {
              "unit_id": 1,
              "game_id": 18
            }
          },
          {
            "id": 14,
            "title": "PES 2025",
            "description": "",
            "image": "images/games/dl26Ei9TlSKwkYHqmrI3CYUQyVuyz67uKGTXGN0l.jpg",
            "created_at": "2025-07-31T06:26:10.000000Z",
            "updated_at": "2025-07-31T06:26:10.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 1,
            "pivot": {
              "unit_id": 1,
              "game_id": 14
            }
          },
          {
            "id": 16,
            "title": "Tekken 7",
            "description": "",
            "image": "images/games/6Wnx60VQaIJ4uuGJvRiU93pVeKea5LWv6yqXyRbg.jpg",
            "created_at": "2025-07-31T06:27:13.000000Z",
            "updated_at": "2025-07-31T06:27:13.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 5,
            "pivot": {
              "unit_id": 1,
              "game_id": 16
            }
          }
        ]
      },
      "game": null,
      "fnbs": [],
      "transactions": [],
      "created_by_admin": null
    },

    {
      "id": 33,
      "invoice_number": "BOOK-20250727-EUK0T0",
      "bookable_type": "App\\Models\\User",
      "bookable_id": 14,
      "unit_id": 1,
      "game_id": 1,
      "start_time": "2025-07-28 15:00:00",
      "end_time": "2025-07-28 17:00:00",
      "total_price": "75000.00",
      "status": "pending",
      "notes": "",
      "created_at": "2025-07-27T14:09:40.000000Z",
      "updated_at": "2025-07-27T14:09:40.000000Z",
      "deleted_at": null,
      "event_id": null,
      "total_visitors": 2,
      "promo_id": null,
      "reminder_sent": false,
      "created_by_admin_id": 1,
      "tax_amount": "0.00",
      "service_fee_amount": "0.00",
      "bookable": {
        "id": 14,
        "username": "jokoputra9",
        "name": "Joko",
        "phone": "081367660604",
        "email": "joko.test@gmail.com",
        "role": "CUST",
        "total_spend": "7.00",
        "api_token_expires_at": "2025-08-30T01:54:17.000000Z",
        "isActive": true,
        "remember_token": null,
        "created_at": "2025-07-27T05:35:45.000000Z",
        "updated_at": "2025-07-31T02:49:41.000000Z",
        "deleted_at": null,
        "total_points": 17
      },
      "unit": {
        "id": 1,
        "room_id": 1,
        "name": "Reguler 1",
        "description": "",
        "status": "available",
        "max_visitors": 4,
        "price": "10000.00",
        "created_at": "2025-07-25T02:54:56.000000Z",
        "updated_at": "2025-08-01T01:19:32.000000Z",
        "deleted_at": null,
        "point_id": 1,
        "room": {
          "id": 1,
          "name": "Reguler",
          "description": "Standard gaming stations for all players.",
          "max_visitors": 4,
          "is_available": true,
          "image": "images/rooms/h1sOhbU6OxanHdoNw1fklVaIJnjh60acN764YieL.jpg",
          "created_at": "2025-07-25T02:54:55.000000Z",
          "updated_at": "2025-07-28T07:05:03.000000Z",
          "deleted_at": null
        },
        "consoles": [
          {
            "id": 2,
            "name": "PlayStation 4",
            "description": "PlayStation 4",
            "image": "images/consoles/QGZr6VjyEjxHD8fRcImALYxBgfo2E6U9cZbj1Qyp.jpg",
            "amount": 2,
            "created_at": "2025-07-25T02:54:55.000000Z",
            "updated_at": "2025-07-31T06:16:58.000000Z",
            "deleted_at": null,
            "is_active": true,
            "pivot": {
              "unit_id": 1,
              "console_id": 2
            }
          }
        ],
        "games": [
          {
            "id": 9,
            "title": "It Takes Two",
            "description": "It Takes Two",
            "image": "images/games/dhJt8AzlkaxcxUmlwsj4tSoM8w5g6ZD1rjQLrBFe.png",
            "created_at": "2025-07-28T08:57:37.000000Z",
            "updated_at": "2025-07-31T07:01:18.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 9,
            "pivot": {
              "unit_id": 1,
              "game_id": 9
            }
          },
          {
            "id": 13,
            "title": "A Way Out",
            "description": "",
            "image": "images/games/qZbBzRHrn4dVk1TBHN3eOLqmsMbb4ra3J96YYOuV.webp",
            "created_at": "2025-07-31T06:25:36.000000Z",
            "updated_at": "2025-07-31T06:25:36.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 9,
            "pivot": {
              "unit_id": 1,
              "game_id": 13
            }
          },
          {
            "id": 17,
            "title": "Cyberpunk 2077",
            "description": "",
            "image": "images/games/gIuLCJpDiN3NNdZ5143SRabvE9GwPjnJ36718FnB.jpg",
            "created_at": "2025-07-31T06:27:43.000000Z",
            "updated_at": "2025-07-31T06:43:21.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 8,
            "pivot": {
              "unit_id": 1,
              "game_id": 17
            }
          },
          {
            "id": 1,
            "title": "EA Sports FC 25",
            "description": "",
            "image": "images/games/SLzVrUvGpcyiARNJ7jvPzPJwQDRlUBikWJpxxHx3.jpg",
            "created_at": "2025-07-25T02:54:55.000000Z",
            "updated_at": "2025-07-31T06:45:30.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 1,
            "pivot": {
              "unit_id": 1,
              "game_id": 1
            }
          },
          {
            "id": 19,
            "title": "Monopoly",
            "description": "",
            "image": "images/games/VoYazfg7qirOJypIrIXCjOS9sRnfI4SaQH6Efjw7.jpg",
            "created_at": "2025-07-31T06:29:33.000000Z",
            "updated_at": "2025-07-31T06:47:58.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 10,
            "pivot": {
              "unit_id": 1,
              "game_id": 19
            }
          },
          {
            "id": 15,
            "title": "Mortal Kombat 11",
            "description": "",
            "image": "images/games/G4Zb4l2OBZfyafs87ALrfHlWC8oT4n0tNnIpsMR2.png",
            "created_at": "2025-07-31T06:26:32.000000Z",
            "updated_at": "2025-07-31T06:49:21.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 5,
            "pivot": {
              "unit_id": 1,
              "game_id": 15
            }
          },
          {
            "id": 20,
            "title": "Moving Out",
            "description": "",
            "image": "images/games/tsIpzVUGwY0xOqj7AMdU1ofN8YydsZFmfzxWrSPg.jpg",
            "created_at": "2025-07-31T06:32:58.000000Z",
            "updated_at": "2025-07-31T06:50:01.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 10,
            "pivot": {
              "unit_id": 1,
              "game_id": 20
            }
          },
          {
            "id": 18,
            "title": "Overcooked!2",
            "description": "",
            "image": "images/games/C9vsArKzLCtYLovXK3AiqrQnct4TbiuXlLMJG1wZ.jpg",
            "created_at": "2025-07-31T06:28:14.000000Z",
            "updated_at": "2025-07-31T06:28:14.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 10,
            "pivot": {
              "unit_id": 1,
              "game_id": 18
            }
          },
          {
            "id": 14,
            "title": "PES 2025",
            "description": "",
            "image": "images/games/dl26Ei9TlSKwkYHqmrI3CYUQyVuyz67uKGTXGN0l.jpg",
            "created_at": "2025-07-31T06:26:10.000000Z",
            "updated_at": "2025-07-31T06:26:10.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 1,
            "pivot": {
              "unit_id": 1,
              "game_id": 14
            }
          },
          {
            "id": 16,
            "title": "Tekken 7",
            "description": "",
            "image": "images/games/6Wnx60VQaIJ4uuGJvRiU93pVeKea5LWv6yqXyRbg.jpg",
            "created_at": "2025-07-31T06:27:13.000000Z",
            "updated_at": "2025-07-31T06:27:13.000000Z",
            "deleted_at": null,
            "is_active": true,
            "genre_id": 5,
            "pivot": {
              "unit_id": 1,
              "game_id": 16
            }
          }
        ]
      },
      "game": {
        "id": 1,
        "title": "EA Sports FC 25",
        "description": "",
        "image": "images/games/SLzVrUvGpcyiARNJ7jvPzPJwQDRlUBikWJpxxHx3.jpg",
        "created_at": "2025-07-25T02:54:55.000000Z",
        "updated_at": "2025-07-31T06:45:30.000000Z",
        "deleted_at": null,
        "is_active": true,
        "genre_id": 1
      },
      "fnbs": [
        {
          "id": 1,
          "name": "French Fries",
          "fnb_category_id": 1,
          "price": "25000.00",
          "description": "Crispy golden fries.",
          "image": "images/fnbs/YDIzUwpsAqLkfLh3Wcu1KkTd65XqTf4zCE30k4Sh.jpg",
          "is_available": true,
          "created_at": "2025-07-25T02:54:56.000000Z",
          "updated_at": "2025-07-26T17:45:52.000000Z",
          "deleted_at": null,
          "pivot": {
            "booking_id": 33,
            "fnb_id": 1,
            "quantity": 1,
            "price": "25000.00"
          }
        },
        {
          "id": 2,
          "name": "Onion Rings",
          "fnb_category_id": 1,
          "price": "30000.00",
          "description": "Battered and fried onion rings.",
          "image": "images/fnbs/UpxMaIbK2vT4Atyo9wwY3ewq2R18f72eiqtgjNWX.jpg",
          "is_available": true,
          "created_at": "2025-07-25T02:54:56.000000Z",
          "updated_at": "2025-07-26T17:46:12.000000Z",
          "deleted_at": null,
          "pivot": {
            "booking_id": 33,
            "fnb_id": 2,
            "quantity": 1,
            "price": "30000.00"
          }
        }
      ],
      "transactions": [
        {
          "id": 30,
          "booking_id": 33,
          "invoice_number": "BOOK-20250727-EUK0T0",
          "gateway_transaction_id": null,
          "amount": "75000.00",
          "type": "payment",
          "payment_method": null,
          "status": "pending",
          "payload": null,
          "created_at": "2025-07-27T14:09:40.000000Z",
          "updated_at": "2025-07-27T14:09:40.000000Z",
          "deleted_at": null
        }
      ],
      "created_by_admin": {
        "id": 1,
        "name": "Admin Satu"
      }
    }
  ],
  "first_page_url": "http://lg84oss0kw4gc80kk8skk8c8.168.231.84.221.sslip.io/api/admin/bookings?page=1",
  "from": 1,
  "last_page": 4,
  "last_page_url": "http://lg84oss0kw4gc80kk8skk8c8.168.231.84.221.sslip.io/api/admin/bookings?page=4",
  "links": [
    {
      "url": null,
      "label": "pagination.previous",
      "active": false
    },
    {
      "url": "http://lg84oss0kw4gc80kk8skk8c8.168.231.84.221.sslip.io/api/admin/bookings?page=1",
      "label": "1",
      "active": true
    },
    {
      "url": "http://lg84oss0kw4gc80kk8skk8c8.168.231.84.221.sslip.io/api/admin/bookings?page=2",
      "label": "2",
      "active": false
    },
    {
      "url": "http://lg84oss0kw4gc80kk8skk8c8.168.231.84.221.sslip.io/api/admin/bookings?page=3",
      "label": "3",
      "active": false
    },
    {
      "url": "http://lg84oss0kw4gc80kk8skk8c8.168.231.84.221.sslip.io/api/admin/bookings?page=4",
      "label": "4",
      "active": false
    },
    {
      "url": "http://lg84oss0kw4gc80kk8skk8c8.168.231.84.221.sslip.io/api/admin/bookings?page=2",
      "label": "pagination.next",
      "active": false
    }
  ],
  "next_page_url": "http://lg84oss0kw4gc80kk8skk8c8.168.231.84.221.sslip.io/api/admin/bookings?page=2",
  "path": "http://lg84oss0kw4gc80kk8skk8c8.168.231.84.221.sslip.io/api/admin/bookings",
  "per_page": 15,
  "prev_page_url": null,
  "to": 15,
  "total": 57
}
```
