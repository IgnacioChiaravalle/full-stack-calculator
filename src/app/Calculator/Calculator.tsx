import { SubmitEvent, useState } from 'react'
import RecentWork from './RecentWork'

export type Operation = 'add' | 'subtract' | 'multiply' | 'divide'

export type Calculation = {
    operation: Operation
    left: number
    right: number
    result: number
}

const operations: Array<{ value: Operation; label: string; symbol: string }> = [
    { value: 'add', label: 'Add', symbol: '+' },
    { value: 'subtract', label: 'Subtract', symbol: '−' },
    { value: 'multiply', label: 'Multiply', symbol: '×' },
    { value: 'divide', label: 'Divide', symbol: '÷' },
]

function Calculator() {
    const formatNumber = (value: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 }).format(value)

    const [operation, setOperation] = useState<Operation>('add')
    const [left, setLeft] = useState('24')
    const [right, setRight] = useState('18')
    const [result, setResult] = useState<number | null>(null)
    const [history, setHistory] = useState<Calculation[]>([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const selectedOperation = operations.find((item) => item.value === operation)!

    async function calculate(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')

        const leftNumber = Number(left)
        const rightNumber = Number(right)
        if (left.trim() === '' || right.trim() === '' || !Number.isFinite(leftNumber) || !Number.isFinite(rightNumber)) {
            setError('Enter two valid numbers to continue.')
            return
        }
        if (operation === 'divide' && rightNumber === 0) {
            setError('Division by zero is undefined. Choose a non-zero divisor.')
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operation, left: leftNumber, right: rightNumber }),
            })
            const payload = await response.json() as { result?: number; error?: string }
            if (!response.ok || typeof payload.result !== 'number') throw new Error(payload.error || 'The calculator service is unavailable.')

            setResult(payload.result)
            setHistory((current) => [{ operation, left: leftNumber, right: rightNumber, result: payload.result! }, ...current].slice(0, 5))
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'The calculator service is unavailable.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="calculator-section" aria-label="Calculator">
            <form className="calculator-panel" onSubmit={calculate}>
                <div className="panel-heading">
                    <div>
                        <p className="eyebrow monospace">Calculator</p>
                        <h2>Try an operation</h2>
                    </div>
                    <span className="operation-symbol">{selectedOperation.symbol}</span>
                </div>

                <div className="operation-tabs" role="tablist" aria-label="Operation">
                    {operations.map((item) =>
                        <button type="button" role="tab" aria-selected={operation === item.value}
                            className={`operation ${operation === item.value ? 'active' : ''}`}
                            key={item.value} onClick={() => setOperation(item.value)}>
                                <span>{item.symbol}</span>
                                {item.label}
                        </button>
                    )}
                </div>

                <div className="inputs-row">
                    <label>First number
                        <input inputMode="decimal" value={left}
                            onChange={(event) => setLeft(event.target.value)}
                            aria-label="First number" />
                    </label>
                    <span className="inline-symbol">{selectedOperation.symbol}</span>
                    <label>Second number
                        <input inputMode="decimal" value={right}
                            onChange={(event) => setRight(event.target.value)}
                            aria-label="Second number" />
                    </label>
                </div>
                {error && <p className="error" role="alert">{error}</p>}

                <button className="calculate-button" type="submit" disabled={loading}>
                    {loading ? 'Calculating...' : 'Calculate'}
                    <span>→</span>
                </button>
                
                <div className="result-area" aria-live="polite">
                    <p className="eyebrow monospace">Result</p>
                    <strong>{result === null ? '—' : formatNumber(result)}</strong>
                    {result !== null &&
                        <span>
                            {formatNumber(Number(left))} {selectedOperation.symbol} {formatNumber(Number(right))}
                        </span>
                    }
                </div>
            </form>

            <RecentWork history={history} />
        </section>
    )
}

export default Calculator
