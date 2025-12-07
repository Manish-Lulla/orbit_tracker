import React, { useMemo } from 'react';
import { Project } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { Activity, CheckCircle2, Circle } from 'lucide-react';

interface AnalyticsProps {
  projects: Project[];
}

const COLORS = ['#10b981', '#3b82f6', '#64748b']; // Emerald, Blue, Slate

export const Analytics: React.FC<AnalyticsProps> = ({ projects }) => {
  
  const stats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let activeTasks = 0;

    projects.forEach(p => {
      p.tasks.forEach(t => {
        totalTasks++;
        if (t.completed) completedTasks++;
        else activeTasks++;
      });
    });

    return { totalTasks, completedTasks, activeTasks };
  }, [projects]);

  const pieData = [
    { name: 'Completed', value: stats.completedTasks, color: '#10b981' }, 
    { name: 'Active', value: stats.activeTasks, color: '#2563eb' }, 
  ].filter(d => d.value > 0);

  const barData = projects.map(p => ({
    name: p.name.length > 10 ? p.name.substring(0, 10) + '...' : p.name,
    completed: p.tasks.filter(t => t.completed).length,
    remaining: p.tasks.filter(t => !t.completed).length,
  })).slice(0, 5); // Top 5 projects

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
        <Activity size={48} className="mb-4 opacity-30" />
        <p>No data available for analytics.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in-up">
      {/* Overview Cards */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex items-center shadow-lg hover:border-zinc-700 transition-colors">
          <div className="p-3 bg-blue-500/10 rounded-xl mr-5">
            <Activity className="text-blue-500" size={24} />
          </div>
          <div>
            <p className="text-zinc-500 text-sm font-medium">Total Tasks</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stats.totalTasks}</h3>
          </div>
        </div>
        <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex items-center shadow-lg hover:border-zinc-700 transition-colors">
          <div className="p-3 bg-emerald-500/10 rounded-xl mr-5">
            <CheckCircle2 className="text-emerald-500" size={24} />
          </div>
          <div>
            <p className="text-zinc-500 text-sm font-medium">Completed</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stats.completedTasks}</h3>
          </div>
        </div>
        <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex items-center shadow-lg hover:border-zinc-700 transition-colors">
          <div className="p-3 bg-zinc-800 rounded-xl mr-5">
            <Circle className="text-zinc-400" size={24} />
          </div>
          <div>
            <p className="text-zinc-500 text-sm font-medium">Pending</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stats.activeTasks}</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-lg h-[400px]">
        <h3 className="text-lg font-bold text-zinc-200 mb-6">Task Distribution</h3>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={6}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle"/>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-lg h-[400px]">
        <h3 className="text-lg font-bold text-zinc-200 mb-6">Project Progress (Top 5)</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart
            data={barData}
            margin={{
              top: 10,
              right: 10,
              left: -10,
              bottom: 0,
            }}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" stroke="#52525b" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
            <YAxis stroke="#52525b" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{fill: '#27272a', opacity: 0.4}}
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
            />
            <Legend verticalAlign="top" iconType="circle"/>
            <Bar dataKey="completed" name="Done" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
            <Bar dataKey="remaining" name="Todo" stackId="a" fill="#3f3f46" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};