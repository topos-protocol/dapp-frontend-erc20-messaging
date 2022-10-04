// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
})

const mockResponse = jest.fn()
Object.defineProperty(window, 'location', {
  value: {
    ...window.location,
    hash: {
      endsWith: mockResponse,
      includes: mockResponse,
    },
    assign: mockResponse,
    navigate: mockResponse,
    replace: mockResponse,
  },
  writable: true,
})

Object.defineProperty(window, 'navigation', {
  value: {
    navigate: mockResponse,
  },
  writable: true,
})
