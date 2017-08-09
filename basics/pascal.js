
/**
 * Функция, которая генерирует следующий ряд треугольника основываясь на предидущем
 * Длина следующего ряда должна равнятся длине предидущего плюс один
 * Первое и последние число следующего ряда равняется первом и поседнему числу предидущего ряда (или всегда 1)
 * Остальные числа в следующем ряду (между первым и последним) будут равнятся сумме двух чисел,
 *    первое - число из предидщугео ряда с таким же индексом
 *    второе - число из предидущего рядо с индексом на один большим
 *
 * @param {[Number]} previousRow - предидущая строка
 * @returns {[Number]}           - следующая строка
 */
const generateRow = previousRow => {
  const previousLength = previousRow.length
  return [
    previousRow[0],
    ...Array.from({length: previousLength - 1}).map(
      (_, i) => previousRow[i] + previousRow[i + 1]
    ),
    previousRow[previousLength - 1]
  ]
}

/**
 * Функция генерирует треугольник состоящий из массива массивов, где каждый массив это ряд чисел в треугольнике
 * @param n - количество рядов
 * @returns {[Array]}
 */
const pascalTriangle1 = n => {
  if (n < 1) {
    return []
  }
  const result = [[1]]
  for(let i = 1; i < n; i++) {
    result.push(generateRow(result[i - 1]))
  }
  return result
}

/**
 * Аналогичная функция но с использованием всех фишек  ES6
 * @param n - количество рядов
 * @returns {[Array]}
 */
const pascalTriangle2 = n =>  n === 0 ? [] : Array.from({length: n - 1})
  .reduce(result => [...result, generateRow(result[result.length - 1])], [[1]])



pascalTriangle1(5).forEach(row => {
  console.log(row)
})

pascalTriangle2(5).forEach(row => {
  console.log(row)
})