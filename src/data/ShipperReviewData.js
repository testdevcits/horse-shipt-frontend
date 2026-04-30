import profileImage from "../assets/images/profile.png"; // replace with your image

export const topShippers = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Shipper ${i + 1}`,
  rating: (Math.random() * (5 - 4) + 4).toFixed(1), 
  reviews: Math.floor(Math.random() * 1000), 
  profileImage,
}));
