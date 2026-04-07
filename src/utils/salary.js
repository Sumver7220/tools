export const HOURLY_RATE = 50000
export const CHAMPAGNE_BOTTLE_PRICE = 30000
export const CHAMPAGNE_TOWER_PRICE = 200000
export const SESSION_RATE = 40000
export const CHAMPAGNE_COMMISSION_RATE = 0.5
export const SESSION_COMMISSION_RATE = 0.4

export function calcBasePay(hours) {
  return hours * HOURLY_RATE
}

export function calcChampagnePay(bottles, towers) {
  return (bottles * CHAMPAGNE_BOTTLE_PRICE + towers * CHAMPAGNE_TOWER_PRICE) * CHAMPAGNE_COMMISSION_RATE
}

export function calcSessionPay(sessions) {
  return sessions * SESSION_RATE * SESSION_COMMISSION_RATE
}

export function calcTotalPay(hours, bottles, towers, sessions) {
  return calcBasePay(hours) + calcChampagnePay(bottles, towers) + calcSessionPay(sessions)
}
