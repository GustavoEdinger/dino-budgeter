import Money from "../shared/Money";
import { Share, Transaction, UserId } from "../shared/types";
export function fromSerialized(row: any): Transaction {
  if (!row) {
    return null;
  }
  const transaction: Transaction = { ...row };
  if (row.amount) {
    transaction.amount = new Money(row.amount);
  }
  if (row.date) {
    transaction.date = new Date(row.date);
  }
  if (row.split) {
    if (row.split.myShare) {
      transaction.split.myShare = new Share(row.split.myShare);
    }
    if (row.split.theirShare) {
      transaction.split.theirShare = new Share(row.split.theirShare);
    }
    if (row.split.otherAmount) {
      transaction.split.otherAmount = new Money(row.split.otherAmount);
    }
  }
  return transaction;
}

export function distributeTotal(
  total: Money,
  s1: Share,
  s2: Share,
): [Money, Money] {
  const [newS1] = Share.normalize(s1, s2);
  const a1 = newS1.of(total);
  const a2 = total.minus(a1);
  return [a1, a2];
}

export function youPay(
  yourShare: Share,
  theirShare: Share,
  total: Money,
): Money {
  const [yourShareNorm] = Share.normalize(yourShare, theirShare);
  return yourShareNorm.of(total);
}

// Never calculate an amount using shares if you don't have the total.
// Never calculate the total if you don't have both amounts.

/**
 * Gets the balance that u1 owes u2.
 */
export function getBalance(args: {
  user: UserId;
  otherUser: UserId;
  payer: UserId;
  amount: Money;
  otherAmount: Money;
}): Money {
  const [, u2] = [args.user, args.otherUser].sort();
  const balance = args.payer == args.user ? args.otherAmount : args.amount;
  return u2 == args.payer ? balance : balance.negate();
}

export function getBalanceDelta(
  user: UserId,
  oldT: Transaction | null,
  newT: Transaction | null,
): Money {
  const otherUser = oldT ? oldT.split.with.uid : newT.split.with.uid;
  const oldBalance =
    !oldT || !oldT.alive
      ? Money.Zero
      : getBalance({
          user,
          otherUser,
          payer: oldT.split.payer,
          amount: oldT.amount,
          otherAmount: oldT.split.otherAmount,
        });
  const newBalance =
    !newT || !newT.alive
      ? Money.Zero
      : getBalance({
          user,
          otherUser,
          payer: newT.split.payer,
          amount: newT.amount,
          otherAmount: newT.split.otherAmount,
        });
  return newBalance.minus(oldBalance);
}
