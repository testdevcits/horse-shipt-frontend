jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({ auth: {}, on: jest.fn(), connect: jest.fn(), disconnect: jest.fn() })),
}));
jest.mock("../config/api", () => ({ SOCKET_BASE_URL: "https://example.com" }));

const { socket, connectSocket } = require("./socket");

beforeEach(() => {
  localStorage.clear();
  socket.auth = {};
  jest.clearAllMocks();
});

test("does not open an anonymous connection", () => {
  expect(connectSocket()).toBe(false);
  expect(socket.connect).not.toHaveBeenCalled();
});

test("child effects can connect with persisted identity before auth hydration", () => {
  localStorage.setItem("horseShiptUser", JSON.stringify({ _id: "customer-1" }));
  localStorage.setItem("role", "customer");
  expect(connectSocket()).toBe(true);
  expect(socket.auth).toEqual({ userId: "customer-1", role: "customer" });
  expect(socket.disconnect.mock.invocationCallOrder[0]).toBeLessThan(socket.connect.mock.invocationCallOrder[0]);
});

test("switching users starts a fresh handshake", () => {
  socket.auth = { userId: "customer-1", role: "customer" };
  connectSocket({ userId: "shipper-2", role: "shipper" });
  expect(socket.disconnect).toHaveBeenCalledTimes(1);
  expect(socket.auth).toEqual({ userId: "shipper-2", role: "shipper" });
});

test("same identity keeps the existing connection", () => {
  socket.auth = { userId: "customer-1", role: "customer" };
  connectSocket(socket.auth);
  expect(socket.disconnect).not.toHaveBeenCalled();
});
