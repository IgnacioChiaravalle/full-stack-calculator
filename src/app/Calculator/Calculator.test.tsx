import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Calculator from './Calculator'

const mockFetch = vi.fn()
globalThis.fetch = mockFetch

function mockCalculation(result: number) {
    mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result }),
    })
}

function enterNumbers(left: string, right: string) {
    fireEvent.change(screen.getByLabelText('First number'), { target: { value: left } })
    fireEvent.change(screen.getByLabelText('Second number'), { target: { value: right } })
}

describe('Calculator', () => {
    afterEach(cleanup)

    beforeEach(() => {
        mockFetch.mockReset()
    })

    it.each([
        ['addition', 'Add', '2', '3', 5],
        ['subtraction', 'Subtract', '8', '3', 5],
        ['multiplication', 'Multiply', '4', '3', 12],
        ['division', 'Divide', '12', '3', 4],
    ])('calculates %s successfully', async (_name, operation, left, right, result) => {
        mockCalculation(result)
        render(<Calculator />)
        fireEvent.click(screen.getByRole('tab', { name: new RegExp(operation) }))
        enterNumbers(left, right)
        fireEvent.click(screen.getByRole('button', { name: /calculate/i }))

        await waitFor(() => expect(screen.getByText('Result').parentElement?.querySelector('strong')).toHaveTextContent(result.toString()))
        expect(mockFetch).toHaveBeenCalledWith('/api/calculate', expect.objectContaining({ method: 'POST' }))
    })

    it.each([
        ['addition', 'Add', '0', '0'],
        ['subtraction', 'Subtract', '0', '0'],
        ['multiplication', 'Multiply', '7', '0'],
    ])('displays zero for zero %s', async (_name, operation, left, right) => {
        mockCalculation(0)
        render(<Calculator />)
        fireEvent.click(screen.getByRole('tab', { name: new RegExp(operation) }))
        enterNumbers(left, right)
        fireEvent.click(screen.getByRole('button', { name: /calculate/i }))

        await waitFor(() => expect(screen.getByText('Result').parentElement?.querySelector('strong')).toHaveTextContent('0'))
    })

    it('rejects division by zero before calling the API', () => {
        render(<Calculator />)
        fireEvent.click(screen.getByRole('tab', { name: /Divide/ }))
        enterNumbers('2', '0')
        fireEvent.click(screen.getByRole('button', { name: /calculate/i }))

        expect(screen.getByRole('alert')).toHaveTextContent('Division by zero is undefined')
        expect(mockFetch).not.toHaveBeenCalled()
    })
})