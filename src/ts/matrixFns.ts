import { create, all } from 'mathjs';

const config = {};
const math = create(all, config);

/* Create Identity matrix */
function IdentityMatrix(dim: number): number[][] {
  return new Array(dim)
    .fill(null)
    .map((r: number[], i) =>
      new Array(dim).fill(null).map((el, j) => (i === j ? 1 : 0)),
    );
}

/* Extract a sub-matrix by deleting rows and columns */
function subSquareMatrix(
  matrix: (number | null)[][],
  indicesToDelete: number[],
) {
  const M = matrix.map((row) => row.slice()); // make a copy of the matrix, to be modified
  const ind = indicesToDelete.map((i) => i).sort((a, b) => a - b); // make a copy of the indices array, to be modified

  while (ind.length) {
    const i = ind.pop() as number;
    M.forEach((row) => row.splice(i, 1)); // On each row, delete the i-th element (column)
    M.splice(i, 1); // delete the i-th row
  }
  return M;
}

/* Create a super-matrix by adding n rows and columns at the end */
function superSquareMatrix(matrix: (number | null)[][], n: number) {
  const M = matrix.map((row) => row.slice()); // make a copy of the matrix, to be modified

  let i = n;
  while (i) {
    M.forEach((row) => row.push(null)); // On each row, add a null element (column) at the end
    M.push(new Array(M.length + 1).fill(null) as null[]); // add a row full of nulls
    i -= 1;
  }
  return M;
}

function subArray(array: (number | null)[], indicesToDelete: number[]) {
  const A = array.map((el) => el); // make a copy of the array, to be modified
  const ind = indicesToDelete.map((i) => i).sort((a, b) => a - b); // make a copy of the indices array, to be modified

  while (ind.length) {
    const i = ind.pop() as number;
    A.splice(i, 1); // delete the i-th element
  }
  return A;
}

export { IdentityMatrix, subSquareMatrix, superSquareMatrix, subArray, math };
