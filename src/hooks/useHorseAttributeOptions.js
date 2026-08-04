import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

export const DEFAULT_HORSE_COLORS = [
  "Bay",
  "Dark Bay",
  "Blood Bay",
  "Black",
  "Faded Black",
  "Chestnut",
  "Liver Chestnut",
  "Light Chestnut",
  "Sorrel",
  "Grey",
  "Dapple Grey",
  "Flea-bitten Grey",
  "White",
  "Palomino",
  "Golden Palomino",
  "Buckskin",
  "Dun",
  "Red Dun",
  "Grullo",
  "Roan",
  "Red Roan",
  "Blue Roan",
  "Strawberry Roan",
  "Pinto",
  "Tobiano",
  "Overo",
  "Tovero",
  "Appaloosa",
  "Leopard Appaloosa",
  "Snowflake Appaloosa",
  "Blanket Appaloosa",
  "Cremello",
  "Perlino",
  "Smoky Black",
  "Champagne",
  "Gold Champagne",
  "Amber Champagne",
  "Silver Dapple",
  "Brindle",
  "Sabino",
  "Splash White",
  "Rabicano",
  "Other",
];

export const DEFAULT_HORSE_SEXES = ["Stallion", "Gelding", "Mare", "Colt", "Filly"];

const normalizeOptions = (items, fallback) => {
  const names = (items || [])
    .map((item) => (typeof item === "string" ? item : item?.name))
    .filter(Boolean);

  return names.length ? names : fallback;
};

export const useHorseAttributeOptions = () => {
  const [colors, setColors] = useState(DEFAULT_HORSE_COLORS);
  const [sexes, setSexes] = useState(DEFAULT_HORSE_SEXES);

  useEffect(() => {
    let mounted = true;

    const fetchOptions = async () => {
      try {
        const [colorRes, sexRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/admin/colors/all`),
          axios.get(`${API_BASE_URL}/admin/sexes/all`),
        ]);

        if (!mounted) return;

        setColors(normalizeOptions(colorRes.data?.data, DEFAULT_HORSE_COLORS));
        setSexes(normalizeOptions(sexRes.data?.data, DEFAULT_HORSE_SEXES));
      } catch (error) {
        if (!mounted) return;
        setColors(DEFAULT_HORSE_COLORS);
        setSexes(DEFAULT_HORSE_SEXES);
      }
    };

    fetchOptions();

    return () => {
      mounted = false;
    };
  }, []);

  return { colors, sexes };
};
