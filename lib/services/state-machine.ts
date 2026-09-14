import { PaymentStatus } from "@/lib/types";

const ALLOWED_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  CREATED: ["PENDING", "CANCELLED", "FAILED"],
  PENDING: ["PROCESSING", "AUTHORIZED", "PAID", "FAILED", "CANCELLED", "EXPIRED"],
  PROCESSING: ["AUTHORIZED", "PAID", "FAILED", "CANCELLED"],
  AUTHORIZED: ["PAID", "FAILED", "CANCELLED"],
  PAID: ["REFUND_PENDING", "PARTIALLY_REFUNDED", "REFUNDED", "DISPUTED"],
  EXPIRED: [],
  CANCELLED: [],
  FAILED: [],
  DISPUTED: ["REFUNDED", "PAID"],
  REFUND_PENDING: ["PARTIALLY_REFUNDED", "REFUNDED", "PAID"],
  PARTIALLY_REFUNDED: ["REFUNDED"],
  REFUNDED: [],
};

export class StateMachineService {
  /**
   * Determine if transition from current status to target status is valid
   */
  static canTransition(current: PaymentStatus, target: PaymentStatus): boolean {
    if (current === target) return true;
    const allowed = ALLOWED_TRANSITIONS[current] || [];
    return allowed.includes(target);
  }

  /**
   * Validate transition and throw if illegal
   */
  static validateTransition(current: PaymentStatus, target: PaymentStatus): void {
    if (!this.canTransition(current, target)) {
      throw new Error(`Invalid state transition: Cannot change payment status from '${current}' to '${target}'`);
    }
  }

  /**
   * Check if status is a terminal state (cannot transition further)
   */
  static isTerminal(status: PaymentStatus): boolean {
    return ["EXPIRED", "CANCELLED", "FAILED", "REFUNDED"].includes(status);
  }
}
