'use client'

export default function SimplePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-blue-700 mb-4">
                        فانتازي الدوري السوري الممتاز
                    </h1>
                    <p className="text-xl text-gray-600">
                        انضم إلى أكبر منصة فانتازي كرة القدم في سوريا
                    </p>
                </div>

                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                            صفحة بسيطة للاختبار
                        </h2>
                        <p className="text-gray-600 text-center">
                            إذا كنت ترى هذا، فإن التطبيق يعمل بشكل صحيح!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
