import { useEffect, useState } from 'react';
import apiClient from '../api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {TrendingUp, ShoppingBag, DollarSign, Award, ArrowLeft, Save} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChartPoint { label: string; value: number; }
interface TopProduct { name: string; salesCount: number; }

interface SellerStats {
    totalRevenue: number;
    totalSales: number;
    averageRating: number;
    salesHistory: ChartPoint[];
    topProducts: TopProduct[];
}

export const AnalyticsPage = () => {
    const [stats, setStats] = useState<SellerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const downloadReport = async () => {
        try {
            const response = await apiClient.get('/stats/seller/report', {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'sales_report.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            alert('Ошибка при загрузке отчета');
        }
    };

    const getEfficiencyLabel = (rating: number, sales: number) => {
        if (sales === 0) return "Новый мастер";
        if (rating >= 4.8) return "Превосходная";
        if (rating >= 4.0) return "Высокая";
        if (rating >= 3.0) return "Средняя";
        if (rating === 0) return "Нет отзывов";
        return "Низкая";
    };

    useEffect(() => {
        apiClient.get('/stats/seller')
            .then(res => setStats(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center mt-20 text-slate-400 animate-pulse font-black uppercase">Загрузка аналитики...</div>;
    if (!stats) return null;

    return (
        <div className="container mx-auto mt-8 px-4 pb-20 max-w-6xl">
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-400 hover:text-indigo-600 mb-8 font-bold text-xs uppercase tracking-widest transition-colors group">
                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Назад
            </button>

            <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Аналитика продаж</h1>
                <button
                    onClick={downloadReport}
                    className="flex items-center bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
                >
                    <Save size={16} className="mr-2" /> Скачать PDF отчет
                </button>
            </div>

            {/* КАРТОЧКИ KPI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[5rem] -mr-6 -mt-6" />
                    <DollarSign className="text-indigo-500 mb-4 relative z-10" size={32} />
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Общая выручка</p>
                    <h3 className="text-3xl font-black text-slate-900">{stats.totalRevenue.toFixed(2)} <span className="text-sm font-bold">BYN</span></h3>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[5rem] -mr-6 -mt-6" />
                    <ShoppingBag className="text-emerald-500 mb-4 relative z-10" size={32} />
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Всего продаж</p>
                    <h3 className="text-3xl font-black text-slate-900">{stats.totalSales} <span className="text-sm font-bold">сделок</span></h3>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100 relative overflow-hidden">
                    <TrendingUp className="text-indigo-400 mb-4" size={32} />
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Эффективность</p>
                    <h3 className="text-3xl font-black text-white">
                        {getEfficiencyLabel(stats.averageRating, stats.totalSales)}
                    </h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* ГРАФИК ПРОДАЖ */}
                <div className="lg:col-span-3 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                    <h3 className="text-lg font-black text-slate-800 mb-8 uppercase tracking-widest">Динамика выручки</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.salesHistory}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}}
                                    tickFormatter={(str) => new Date(str).toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'})}
                                />
                                <YAxis hide domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                    labelStyle={{fontWeight: 'bold', color: '#1e293b'}}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ТОП ТОВАРОВ */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                    <h3 className="text-lg font-black text-slate-800 mb-8 uppercase tracking-widest flex items-center">
                        <Award className="mr-2 text-yellow-500" size={20} /> Топ товаров
                    </h3>
                    <div className="space-y-6">
                        {stats.topProducts.length === 0 ? (
                            <p className="text-center text-slate-300 py-10 italic">Данные появятся после первых продаж</p>
                        ) : stats.topProducts.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="w-6 h-6 bg-slate-100 text-slate-400 text-[10px] font-black rounded-lg flex items-center justify-center mr-4">{idx + 1}</span>
                                    <span className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{item.name}</span>
                                </div>
                                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  {item.salesCount} шт.
                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};