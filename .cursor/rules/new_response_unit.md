 {
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
            ],
            "point": {
                "id": 1,
                "name": "Bronze Tier",
                "points_per_hour": 1,
                "created_at": "2025-07-25T02:54:55.000000Z",
                "updated_at": "2025-07-25T02:54:55.000000Z",
                "deleted_at": null
            }
        },