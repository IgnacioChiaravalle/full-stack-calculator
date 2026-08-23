import type { Calculation, Operation } from './Calculator'

const operationSymbols: Record<Operation, string> = {
    add: '+',
    subtract: '−',
    multiply: '×',
    divide: '÷',
}

const formatNumber = (value: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 }).format(value)

type RecentWorkProps = {
    history: Calculation[]
}

function RecentWork({ history }: RecentWorkProps) {
    return (
        <aside className="recent-work-panel">
            <div className="panel-heading">
                <div>
                    <p className="eyebrow monospace">Recent work</p>
                    <h2>History</h2>
                </div>
                <span className="recent-work-count monospace">{history.length.toString().padStart(2, '0')}</span>
            </div>
            {history.length === 0 ? (
                <div className="empty-recent-work">
                    <span>∑</span>
                    <p>Your completed calculations<br />will appear here.</p>
                </div>
            ) : (
                <div className="recent-work-list">
                    {history.map((item, index) => (
                        <div className="recent-work-item" key={`${item.operation}-${item.left}-${item.right}-${index}`}>
                            <span>{formatNumber(item.left)} {operationSymbols[item.operation]} {formatNumber(item.right)}</span>
                            <strong>{formatNumber(item.result)}</strong>
                        </div>
                    ))}
                </div>
            )}
        </aside>
    )
}

export default RecentWork
