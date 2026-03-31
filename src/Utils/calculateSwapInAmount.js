import { BigNumber } from 'bignumber.js'; // import BigNumber library for arbitrary precision math


// Babylonian algorithm for square root
function Babylonian(num) {
  const MAX_ITERATIONS = 200;
  let guess = new BigNumber(Math.floor(Math.sqrt(num)));
  let prevGuess;
  let i = 0;

  do {
    prevGuess = guess;
    guess = new BigNumber(num).dividedBy(prevGuess).plus(prevGuess).dividedBy(2);
    i++;
  } while (prevGuess.minus(guess).absoluteValue().isGreaterThan(1) && i < MAX_ITERATIONS);

  return guess;
}

function calculateSwapInAmount(_reserveIn, _tokenIn) {
  const swapFee = 17;
  const D = new BigNumber(10000); // denominator
  const R = D.minus(swapFee); // r number

  const numerator = new BigNumber(_tokenIn).times(4).times(D).times(R).plus(new BigNumber(_reserveIn).times(D.plus(R)).times(D.plus(R))).times(_reserveIn);
  const denominator = R.times(2);

  const sqrt = Babylonian(numerator);
  const subtracted = sqrt.minus(new BigNumber(_reserveIn).times(D.plus(R)));
  return subtracted.dividedBy(denominator).toString();
}


export default calculateSwapInAmount;