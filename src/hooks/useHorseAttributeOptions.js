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

export const DEFAULT_HORSE_BREEDS = [
  "American Sport Pony", "American Warmblood", "Appendix", "Argentinian Warmblood",
  "Belgian Warmblood", "Brandenburger", "Canadian Sport Horse", "Canadian Warmblood",
  "Chincoteague", "Cleveland Bay", "Connemara", "Crossbred", "Czech Warmblood",
  "Danish Warmblood", "Dutch Warmblood", "English TB", "French TB", "German Riding Pony",
  "German Warmblood", "Hanoverian", "Holsteiner", "Hungarian Warmblood", "Irish Draught",
  "Irish Sport Horse", "Irish TB", "New Forest Pony", "Oldenburg", "Paint",
  "Pony of the Americas", "Quarter Horse", "Quarter Pony", "RPSI", "Selle Francais",
  "Shetland", "Swedish Warmblood", "TB (Thoroughbred)", "TB Cross", "Trakehner",
  "Warmblood", "Warmblood Cross", "Welsh Cob", "Welsh Cross", "Welsh Pony",
  "Westphalian", "Zangersheide", "Other Breed",
];

const normalizeOptions = (items, fallback) => {
  const names = (items || [])
    .map((item) => (typeof item === "string" ? item : item?.name))
    .filter(Boolean);

  return names.length ? names : fallback;
};

export const useHorseAttributeOptions = () => {
  const [breeds, setBreeds] = useState(DEFAULT_HORSE_BREEDS);
  const [colors, setColors] = useState(DEFAULT_HORSE_COLORS);
  const [sexes, setSexes] = useState(DEFAULT_HORSE_SEXES);

  useEffect(() => {
    const controller = new AbortController();

    const fetchOptions = async () => {
      const requests = [
        ["breeds", `${API_BASE_URL}/admin/breeds/all`, DEFAULT_HORSE_BREEDS, setBreeds],
        ["colors", `${API_BASE_URL}/admin/colors/all`, DEFAULT_HORSE_COLORS, setColors],
        ["sexes", `${API_BASE_URL}/admin/sexes/all`, DEFAULT_HORSE_SEXES, setSexes],
      ];

      await Promise.allSettled(requests.map(async ([name, url, fallback, setOptions]) => {
        try {
          const response = await axios.get(url, { signal: controller.signal });
          if (response.data?.success === false || !Array.isArray(response.data?.data)) {
            throw new Error(`Invalid ${name} options response`);
          }
          setOptions(normalizeOptions(response.data.data, fallback));
        } catch (error) {
          if (!controller.signal.aborted) {
            console.error(`Failed to load horse ${name} options`, error);
          }
        }
      }));
    };

    fetchOptions();

    return () => controller.abort();
  }, []);

  return { breeds, colors, sexes };
};
