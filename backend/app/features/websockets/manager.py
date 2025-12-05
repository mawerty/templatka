from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}
        self.rooms: dict[str, set[str]] = {}

    async def connect(self, client_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str) -> None:
        self.active_connections.pop(client_id, None)
        for room_clients in self.rooms.values():
            room_clients.discard(client_id)

    async def send_to_client(self, client_id: str, message: dict) -> bool:
        if websocket := self.active_connections.get(client_id):
            await websocket.send_json(message)
            return True
        return False

    async def broadcast(self, message: dict, exclude: str | None = None) -> None:
        for client_id, websocket in self.active_connections.items():
            if client_id != exclude:
                await websocket.send_json(message)

    def join_room(self, client_id: str, room_id: str) -> None:
        if room_id not in self.rooms:
            self.rooms[room_id] = set()
        self.rooms[room_id].add(client_id)

    def leave_room(self, client_id: str, room_id: str) -> None:
        if room_id in self.rooms:
            self.rooms[room_id].discard(client_id)

    async def send_to_room(self, room_id: str, message: dict, exclude: str | None = None) -> None:
        if room_id not in self.rooms:
            return
        for client_id in self.rooms[room_id]:
            if client_id != exclude:
                await self.send_to_client(client_id, message)

    def get_room_clients(self, room_id: str) -> set[str]:
        return self.rooms.get(room_id, set()).copy()

    def get_client_rooms(self, client_id: str) -> list[str]:
        return [room_id for room_id, clients in self.rooms.items() if client_id in clients]


manager = ConnectionManager()
