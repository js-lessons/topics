
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

const pascalTriangle = n => {
  if (n < 1) {
    return []
  }
  const result = [[1]]
  for(let i = 1; i < n; i++) {
    result.push(generateRow(result[i - 1]))
  }
  return result
}

const pascalTriangle2 = n => Array.from({length: n})
  .reduce(result => [...result, generateRow(result[result.length - 1])], [[1]])

pascalTriangle(3).forEach(row => {
  console.log(row)
})


pascalTriangle2(5).forEach(row => {
  console.log(row)
})