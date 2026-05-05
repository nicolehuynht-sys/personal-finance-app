/**
 * Default categories to seed for new users.
 */
export const DEFAULT_CATEGORIES = [
  // Parents
  { name: "Housing", icon: "home", sort_order: 1 },
  { name: "Transportation", icon: "directions_car", sort_order: 2 },
  { name: "Food", icon: "restaurant", sort_order: 3 },
  { name: "Utilities", icon: "bolt", sort_order: 4 },
  { name: "Shopping", icon: "shopping_bag", sort_order: 5 },
  { name: "Misc.", icon: "more_horiz", sort_order: 6 },
  { name: "Insurance", icon: "shield", sort_order: 7 },
  { name: "Personal", icon: "person", sort_order: 8 },
  { name: "Travel", icon: "flight", sort_order: 9 },
  { name: "Transfer", icon: "swap_horiz", sort_order: 10 },
  { name: "Finance", icon: "account_balance", sort_order: 11 },
  { name: "Income", icon: "payments", sort_order: 12 },
  { name: "Health", icon: "local_hospital", sort_order: 13 },
];

export const DEFAULT_SUBCATEGORIES: Record<string, Array<{ name: string; icon: string; sort_order: number }>> = {
  Housing: [
    { name: "Rent", icon: "apartment", sort_order: 1 },
    { name: "Household Repairs", icon: "handyman", sort_order: 2 },
  ],
  Transportation: [
    { name: "Public Transit", icon: "train", sort_order: 1 },
    { name: "Ride Share", icon: "hail", sort_order: 2 },
  ],
  Food: [
    { name: "Groceries", icon: "shopping_cart", sort_order: 1 },
    { name: "Restaurants", icon: "restaurant_menu", sort_order: 2 },
    { name: "Alcohol and Bars", icon: "local_bar", sort_order: 3 },
    { name: "Coffee & Dessert", icon: "coffee", sort_order: 4 },
    { name: "Food Delivery", icon: "delivery_dining", sort_order: 5 },
  ],
  Utilities: [
    { name: "Hydro", icon: "electrical_services", sort_order: 1 },
    { name: "Phone", icon: "phone_android", sort_order: 2 },
    { name: "Internet", icon: "wifi", sort_order: 3 },
  ],
  Shopping: [
    { name: "Clothing", icon: "checkroom", sort_order: 1 },
    { name: "Personal Care", icon: "spa", sort_order: 2 },
    { name: "Home Items", icon: "home", sort_order: 3 },
    { name: "Other Shopping", icon: "shopping_bag", sort_order: 4 },
  ],
  "Misc.": [
    { name: "Gift", icon: "redeem", sort_order: 1 },
    { name: "Misc.", icon: "more_horiz", sort_order: 2 },
  ],
  Insurance: [
    { name: "Home Insurance", icon: "shield", sort_order: 1 },
  ],
  Personal: [
    { name: "Fitness", icon: "fitness_center", sort_order: 1 },
    { name: "Hobbies", icon: "palette", sort_order: 2 },
    { name: "Subscriptions", icon: "subscriptions", sort_order: 3 },
    { name: "Entertainment", icon: "movie", sort_order: 4 },
  ],
  Travel: [
    { name: "Flights / Transportation", icon: "flight", sort_order: 1 },
    { name: "Accomodations", icon: "hotel", sort_order: 2 },
  ],
  Transfer: [
    { name: "Card Payment", icon: "credit_card", sort_order: 1 },
    { name: "Account Transfer", icon: "swap_horiz", sort_order: 2 },
  ],
  Finance: [
    { name: "Bank Fees", icon: "account_balance", sort_order: 1 },
  ],
  Income: [
    { name: "Income", icon: "payments", sort_order: 1 },
    { name: "Tax Refunds", icon: "receipt", sort_order: 2 },
    { name: "Reimbursement", icon: "money", sort_order: 3 },
  ],
  Health: [
    { name: "Health", icon: "local_hospital", sort_order: 1 },
  ],
};
