// src/data/shipments.js

export const shipments = [
  {
    _id: "68fa3354c3e032b612c53475",
    status: "pending",
    pickupLocation: "Pickup Address 1",
    pickupDate: "2025-10-02",
    deliveryLocation: "Delivery Address 1",
    deliveryDate: "2025-10-04",
    numberOfHorses: 1,
    createdAt: "2025-10-23",
    horses: [
      {
        registeredName: "Thunder",
        breed: "Warmblood",
        colour: "Black",
        age: "10",
        photo: {
          url: "https://res.cloudinary.com/dra3iqxvf/image/upload/v1761227013/shipments/nqxkvhmpb9yindt4w4ce.jpg",
        },
      },
    ],
  },
  {
    _id: "68fa3354c3e032b612c53476",
    status: "pending",
    pickupLocation: "Pickup Address 2",
    pickupDate: "2025-10-05",
    deliveryLocation: "Delivery Address 2",
    deliveryDate: "2025-10-07",
    numberOfHorses: 2,
    createdAt: "2025-10-23",
    horses: [
      {
        registeredName: "Lightning",
        breed: "Arabian",
        colour: "Brown",
        age: "8",
        photo: {
          url: "https://res.cloudinary.com/dra3iqxvf/image/upload/v1761742336/shipper_vehicles/gorv0dbmkfha73v3zubm.png",
        },
      },
      {
        registeredName: "Storm",
        breed: "Thoroughbred",
        colour: "Gray",
        age: "9",
        photo: {
          url: "https://res.cloudinary.com/dra3iqxvf/image/upload/v1761742340/shipper_vehicles/horse2.png",
        },
      },
    ],
  },
  {
    _id: "68fa3354c3e032b612c53477",
    status: "completed",
    pickupLocation: "Pickup Address 3",
    pickupDate: "2025-09-20",
    deliveryLocation: "Delivery Address 3",
    deliveryDate: "2025-09-22",
    numberOfHorses: 1,
    createdAt: "2025-09-15",
    horses: [
      {
        registeredName: "Blaze",
        breed: "Friesian",
        colour: "Black",
        age: "7",
        photo: {
          url: "https://res.cloudinary.com/dra3iqxvf/image/upload/v1761742345/shipper_vehicles/horse3.png",
        },
      },
    ],
  },
];
