import { EscrowOrder } from '../types';

export function getSellerCommissionRate(isVerifiedItem: boolean): 5 | 7 {
  return isVerifiedItem ? 5 : 7;
}

export function getSellerSettlement(order: Pick<EscrowOrder, 'amount' | 'sellerCommissionRate'>) {
  const saleSatang = Math.round(order.amount * 100);
  const commissionSatang = Math.round(saleSatang * (order.sellerCommissionRate ?? 0) / 100);

  return {
    commission: commissionSatang / 100,
    payout: (saleSatang - commissionSatang) / 100,
  };
}
