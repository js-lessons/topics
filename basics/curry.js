
const curry = fn => {
  const args = []
  const takeArgument = argument => {
    args.push(argument)
    return args.length === fn.length ? fn(...args) : takeArgument
  }

  return takeArgument
}

const add = (a, b, c) => a + b + c

const addCurried = curry(add)

console.log(addCurried)
console.log(addCurried(1))
console.log(addCurried(2))
console.log(addCurried(3))