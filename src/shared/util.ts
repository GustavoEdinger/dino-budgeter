
import randomstring from 'randomstring';
import BigNumber from 'bignumber.js';
import { Money } from './types';

export function randomId() {
    return randomstring.generate({length: 32, capitalization: 'lowercase'});
}

export function validateAmount(amount: string, allowNegative?: boolean): string {
    var v = new BigNumber(amount);
    if (!v.isFinite()) {
        throw new Error(`invalid amount ${amount}`)
    }
    if (!allowNegative && v.isNegative()) {
        throw new Error(`unexpected negative amount ${amount}`)
    }
    const result = v.toFixed(2);
    console.log("Your number is", result);
    return result;
}

export function add(a: Money, b: Money): Money {
    const aNum = new BigNumber(a);
    const bNum = new BigNumber(b);
    return aNum.plus(bNum).toFixed(2);
}

export function subtract(a: Money, b: Money): Money {
    const aNum = new BigNumber(a);
    const bNum = new BigNumber(b);
    return aNum.minus(bNum).toFixed(2);
}

export function cmp(a: Money, b: Money): number {
    const aNum = new BigNumber(a);
    const bNum = new BigNumber(b);
    return aNum.comparedTo(bNum);
}

export function negate(a: Money): Money {
    return new BigNumber(a).times(-1).toFixed(2);
}