'use client'

export default function DebugPage() {
    console.log('🐛 DebugPage component is rendering - FRESH VERSION')

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'green',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
        }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                    DEBUG PAGE WORKING! 🎯
                </h1>
                <p>If you see this green page, the component is working!</p>
                <p>Console should show: 🐛 DebugPage component is rendering - FRESH VERSION</p>
            </div>
        </div>
    )
}
