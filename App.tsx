import React, { useState, useEffect, useCallback } from 'react';
import { Project, Task, ProjectFilter } from './types';
import { loadProjects, saveProjects, getRandomColor } from './utils/storage';
import { generateSuggestedTasks } from './services/geminiService';
import { Analytics } from './components/Analytics';
import { 
  Plus, 
  Trash2, 
  Check, 
  X, 
  ChevronRight, 
  MoreVertical, 
  Sparkles, 
  LayoutDashboard, 
  Layers, 
  Search,
  Loader2,
  Settings
} from 'lucide-react';

function App() {
  // State
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'DASHBOARD'>('PROJECTS');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Initialize
  // useEffect(() => {
  //   const loaded = loadProjects();
  //   setProjects(loaded);
  // }, []);

  // Persistence
  useEffect(() => {
    saveProjects(projects); // This is still needed!
  }, [projects]);

  // Actions
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    let initialTasks: Task[] = [];

    // AI Generation Check
    if (isGeneratingAI) return; // Prevent double submit if AI running

    const newProject: Project = {
      id: crypto.randomUUID(),
      name: newProjectName,
      description: newProjectDesc,
      tasks: initialTasks,
      createdAt: Date.now(),
      color: getRandomColor(),
    };

    setProjects(prev => [newProject, ...prev]);
    setIsModalOpen(false);
    setNewProjectName('');
    setNewProjectDesc('');
  };

  const handleGenerateAndCreate = async () => {
    if (!newProjectName.trim()) {
        setAiError("Please enter a project name first.");
        return;
    }
    setAiError(null);
    setIsGeneratingAI(true);

    try {
        const suggestedTaskTitles = await generateSuggestedTasks(newProjectName, newProjectDesc);
        
        const newTasks: Task[] = suggestedTaskTitles.map(title => ({
            id: crypto.randomUUID(),
            title,
            completed: false,
            createdAt: Date.now(),
        }));

        const newProject: Project = {
            id: crypto.randomUUID(),
            name: newProjectName,
            description: newProjectDesc,
            tasks: newTasks,
            createdAt: Date.now(),
            color: getRandomColor(),
        };

        setProjects(prev => [newProject, ...prev]);
        setIsModalOpen(false);
        setNewProjectName('');
        setNewProjectDesc('');
    } catch (err) {
        setAiError("Failed to generate tasks. Try creating manually.");
    } finally {
        setIsGeneratingAI(false);
    }
  };

  const handleDeleteProject = (id: string) => {
    // Adding a small timeout to prevent UI jumpiness if double clicked
    if (window.confirm("Are you sure you want to delete this project permanently?")) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAddTask = (projectId: string, taskTitle: string) => {
    if (!taskTitle.trim()) return;
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: [...p.tasks, {
            id: crypto.randomUUID(),
            title: taskTitle,
            completed: false,
            createdAt: Date.now()
          }]
        };
      }
      return p;
    }));
  };

  const handleToggleTask = (projectId: string, taskId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        };
      }
      return p;
    }));
  };

  const handleDeleteTask = (projectId: string, taskId: string) => {
     setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.filter(t => t.id !== taskId)
        };
      }
      return p;
    }));
  }

  // Derived State
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-400 flex items-center justify-center shadow-lg shadow-white/10">
                <Layers className="text-black w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Orbit</h1>
            </div>
            <div className="flex gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
               <button 
                onClick={() => setActiveTab('PROJECTS')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'PROJECTS' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 Projects
               </button>
               <button 
                onClick={() => setActiveTab('DASHBOARD')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'DASHBOARD' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 Dashboard
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-xl focus:ring-2 focus:ring-white/20 focus:border-zinc-700 block pl-11 p-3 placeholder-zinc-600 transition-all hover:border-zinc-700"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-zinc-700/20 hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>

        {activeTab === 'DASHBOARD' ? (
          <Analytics projects={projects} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {filteredProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onDelete={() => handleDeleteProject(project.id)}
                onAddTask={(title) => handleAddTask(project.id, title)}
                onToggleTask={(taskId) => handleToggleTask(project.id, taskId)}
                onDeleteTask={(taskId) => handleDeleteTask(project.id, taskId)}
              />
            ))}
            
            {filteredProjects.length === 0 && (
               <div className="col-span-full flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                 <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-inner border border-zinc-800">
                   <Layers className="w-10 h-10 text-zinc-700" />
                 </div>
                 <h3 className="text-xl font-semibold text-zinc-300">No projects found</h3>
                 <p className="text-zinc-500 mt-2 max-w-sm">Create a new project to start tracking your progress.</p>
                 <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-8 text-white hover:text-zinc-300 font-medium text-sm flex items-center gap-1 group transition-colors"
                 >
                   Create your first project 
                   <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </button>
               </div>
            )}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#09090b] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-scale-in ring-1 ring-white/10">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Create Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors bg-zinc-900 p-2 rounded-full hover:bg-zinc-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Project Name</label>
                <input 
                  type="text" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Website Redesign"
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl p-3.5 focus:ring-2 focus:ring-white/20 focus:border-zinc-700 transition-all outline-none"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Description <span className="text-zinc-700 font-normal normal-case ml-1">(Optional)</span></label>
                <textarea 
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="What is this project about?"
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl p-3.5 focus:ring-2 focus:ring-white/20 focus:border-zinc-700 transition-all outline-none resize-none"
                />
              </div>

              {aiError && (
                 <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm">
                    {aiError}
                 </div>
              )}

              <div className="flex gap-3 pt-2">
                 <button 
                  type="button"
                  disabled={isGeneratingAI || !newProjectName.trim()}
                  onClick={handleGenerateAndCreate}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 border border-indigo-700/30 disabled:opacity-50 disabled:cursor-not-allowed text-indigo-100 px-4 py-3 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(79,70,229,0.1)] hover:shadow-[0_0_20px_rgba(79,70,229,0.2)]"
                >
                  {isGeneratingAI ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Thinking...
                    </>
                  ) : (
                    <>
                        <Sparkles className="w-4 h-4" />
                        AI Generate Tasks
                    </>
                  )}
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  Create Empty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  onDelete: () => void;
  onAddTask: (title: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete, onAddTask, onToggleTask, onDeleteTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const completedCount = project.tasks.filter(t => t.completed).length;
  const totalCount = project.tasks.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle);
      setNewTaskTitle('');
    }
  };

  return (
    <div className="group bg-zinc-900 border border-zinc-800/50 hover:border-zinc-600 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1 flex flex-col h-full relative">
      {/* Card Header & Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3 pr-8">
             <div className="w-3 h-3 rounded-full shadow-[0_0_10px]" style={{ backgroundColor: project.color, boxShadow: `0 0 10px ${project.color}40` }}></div>
             <h3 className="font-bold text-lg text-white leading-tight line-clamp-1" title={project.name}>{project.name}</h3>
          </div>
          
          {/* Visible Delete Button - Improved Accessibility */}
          <div className="absolute top-4 right-4 z-10">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="text-zinc-600 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all duration-200"
                title="Delete Project"
                aria-label="Delete Project"
            >
                <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <p className="text-zinc-500 text-sm mb-6 line-clamp-2 min-h-[2.5rem] leading-relaxed">
          {project.description || "No description provided."}
        </p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-medium text-zinc-500 mb-2">
            <span>Progress</span>
            <span className={progress === 100 ? "text-emerald-400" : ""}>{progress}%</span>
          </div>
          <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800/50">
            <div 
              className="h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(0,0,0,0.3)]"
              style={{ 
                width: `${progress}%`,
                backgroundColor: progress === 100 ? '#10b981' : project.color 
              }}
            ></div>
          </div>
        </div>

        {/* Task List Preview (Top 3) */}
        <div className="space-y-3 mb-4 flex-1">
           {project.tasks.slice(0, 3).map(task => (
             <TaskItem 
                key={task.id}
                task={task} 
                onToggle={() => onToggleTask(task.id)} 
                onDelete={() => onDeleteTask(task.id)}
             />
           ))}
           {project.tasks.length > 3 && (
             <button 
               onClick={() => setIsExpanded(true)}
               className="text-xs font-medium text-zinc-500 hover:text-white transition-colors w-full text-left pl-8 py-1 flex items-center gap-1 group/more"
             >
               <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] group-hover/more:bg-zinc-700">+{project.tasks.length - 3}</span> more tasks
             </button>
           )}
           {project.tasks.length === 0 && (
             <div className="text-xs text-zinc-600 italic pl-2 py-2">Add tasks to get started.</div>
           )}
        </div>
      </div>

      {/* Add Task Footer */}
      <div className="bg-zinc-950/50 p-4 border-t border-zinc-800/50 backdrop-blur-sm">
        <form onSubmit={handleSubmitTask} className="flex gap-2">
          <input 
            type="text" 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-white/50 focus:border-zinc-700 transition-all outline-none"
          />
          <button 
            type="submit"
            className="bg-zinc-800 hover:bg-white hover:text-black text-zinc-400 p-2.5 rounded-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

       {/* Expanded View Modal */}
       {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
           <div className="bg-[#09090b] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-scale-in ring-1 ring-white/10">
              <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-[#09090b] rounded-t-2xl sticky top-0 z-10">
                 <div>
                    <h3 className="font-bold text-xl text-white">{project.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">All tasks</p>
                 </div>
                 <button onClick={() => setIsExpanded(false)} className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition-colors"><X className="w-5 h-5 text-zinc-400 hover:text-white" /></button>
              </div>
              <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-3 bg-[#09090b]/50">
                 {project.tasks.map(task => (
                    <div key={task.id} className="p-2 hover:bg-zinc-900/50 rounded-lg transition-colors">
                        <TaskItem 
                            task={task} 
                            onToggle={() => onToggleTask(task.id)} 
                            onDelete={() => onDeleteTask(task.id)}
                        />
                    </div>
                 ))}
                 {project.tasks.length === 0 && <p className="text-center text-zinc-500 py-10">No tasks found.</p>}
              </div>
              <div className="p-5 border-t border-zinc-800 bg-[#09090b] rounded-b-2xl">
                 <form onSubmit={handleSubmitTask} className="flex gap-3">
                    <input 
                        type="text" 
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-1 bg-zinc-900 border border-zinc-800 text-sm text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-white/20 outline-none"
                        autoFocus
                    />
                    <button type="submit" className="bg-white hover:bg-zinc-200 text-black px-6 py-2 rounded-xl text-sm font-bold transition-all">Add</button>
                 </form>
              </div>
           </div>
        </div>
       )}
    </div>
  );
};
// STEP 1: Define the specific interface for the TaskItem props
interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

// STEP 2: Update the TaskItem component to use the defined interface (React.FC<TaskItemProps>)
const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => (
  <div className="flex items-start group/task w-full">
    <button 
      onClick={onToggle}
      className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border transition-all duration-300 flex items-center justify-center
        ${task.completed 
          ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
          : 'border-zinc-700 hover:border-zinc-500 bg-transparent'}`}
    >
      {task.completed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
    </button>
    <span 
      className={`ml-3 text-sm flex-1 transition-all duration-300 break-words leading-tight pt-0.5
        ${task.completed ? 'text-zinc-600 line-through decoration-zinc-700' : 'text-zinc-300 group-hover/task:text-zinc-100'}`}
    >
      {task.title}
    </span>
    <button onClick={onDelete} className="opacity-0 group-hover/task:opacity-100 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 p-1 rounded transition-all ml-2 flex-shrink-0">
        <X className="w-3.5 h-3.5"/>
    </button>
  </div>
);
export default App;