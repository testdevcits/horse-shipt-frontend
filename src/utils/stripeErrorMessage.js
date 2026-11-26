const STRIPE_ERROR_MESSAGES = {
  insufficient_funds:
    "Your card has insufficient funds. Please try another card.",
  do_not_honor:
    "Your bank declined this payment. Please contact your bank or try another card.",
  fraudulent:
    "Your bank blocked this payment as potentially fraudulent. Please contact your bank.",
  lost_card: "This card was reported lost. Please use another card.",
  stolen_card: "This card was reported stolen. Please use another card.",
  expired_card: "This card has expired. Please use another card.",
  incorrect_cvc: "The card security code is incorrect. Please check it and try again.",
  processing_error: "The payment could not be processed. Please try again.",
  generic_decline:
    "Your bank declined this payment. Please try another card or contact your bank.",
  card_declined:
    "Your bank declined this card. Please contact your bank or use another card.",
};

export const getStripeErrorMessage = (error) => {
  const code = error?.decline_code || error?.code;
  return (
    STRIPE_ERROR_MESSAGES[code] ||
    error?.message ||
    "Your payment could not be completed. Please try again or use another card."
  );
};

export default getStripeErrorMessage;
