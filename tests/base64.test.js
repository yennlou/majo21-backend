import base64 from '../src/utils/base64'
const text = '!"#abcABC123+-/一二三ÀÉä¥$\n\t'
const encodedText = 'ISIjYWJjQUJDMTIzKy0v5LiA5LqM5LiJw4DDicOkwqUkCgk='

test('test base64 lib', () => {
  expect(base64.encode(text)).toBe(encodedText)
  expect(base64.decode(encodedText)).toBe(text)
})
