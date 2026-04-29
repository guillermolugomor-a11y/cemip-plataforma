import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Upload, 
  Search, 
  MoreVertical, 
  Eye, 
  Trash2,
  FileUp,
  FolderOpen,
  Activity,
  Image,
  FileSignature,
  Stethoscope
} from 'lucide-react';
import { cn } from '../../lib/utils';

const CATEGORIES = [
  { id: 'todos', label: 'Todos los Archivos', icon: FolderOpen },
  { id: 'estudios', label: 'EEG y Estudios', icon: Activity },
  { id: 'radiografias', label: 'Radiografías', icon: Search },
  { id: 'informes', label: 'Informes Escolares', icon: FileText },
  { id: 'recetas', label: 'Recetas Médicas', icon: Stethoscope },
  { id: 'multimedia', label: 'Videos y Fotos', icon: Image },
  { id: 'consentimientos', label: 'Consentimientos', icon: FileSignature },
];

const DocumentCard = ({ name, type, date, size, categoryId, onDelete }: any) => (
  <div className="bg-apple-bg border border-apple-separator rounded-apple p-6 flex flex-col gap-6 group hover:shadow-apple-soft transition-all overflow-hidden relative">
    <div className="flex justify-between items-start">
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0",
        type === 'pdf' ? "bg-apple-red/10 text-apple-red border border-apple-red/20" : "bg-apple-blue/10 text-apple-blue border border-apple-blue/20"
      )}>
        {type === 'pdf' ? <FileText className="w-6 h-6" strokeWidth={1.5} /> : <ImageIcon className="w-6 h-6" strokeWidth={1.5} />}
      </div>
      <button className="p-1.5 text-apple-text-tertiary hover:text-apple-text hover:bg-apple-secondary rounded-lg transition-colors">
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>

    <div>
      <h4 className="font-bold text-apple-text text-[13px] truncate mb-1 leading-tight">{name}</h4>
      <div className="flex justify-between items-center mt-2.5">
        <span className="text-[10px] font-bold tracking-widest text-apple-text-secondary uppercase">{date}</span>
        <span className="text-[10px] font-bold tracking-widest text-apple-text-tertiary uppercase tabular-nums">{size}</span>
      </div>
    </div>

    <div className="flex gap-2 pt-4 border-t border-apple-separator/50">
      <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-apple-secondary text-apple-text-secondary rounded-lg text-[10px] font-bold tracking-widest uppercase hover:text-apple-text transition-all">
        <Eye className="w-3.5 h-3.5" strokeWidth={2} /> Abrir
      </button>
      <button onClick={onDelete} className="p-2 bg-apple-secondary text-apple-text-tertiary rounded-lg hover:text-apple-red hover:bg-apple-red/5 transition-all">
        <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
    </div>
  </div>
);

export default function Documents({ patientId }: { patientId?: string }) {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [docs, setDocs] = useState([
    { id: 1, name: "Resultados_EEG_Marzo.pdf", type: "pdf", date: "16 Abr 2026", size: "2.4 MB", categoryId: 'estudios' },
    { id: 2, name: "Radiografia_Columna.png", type: "img", date: "10 Abr 2026", size: "5.1 MB", categoryId: 'radiografias' },
    { id: 3, name: "Informe_Escolar_Q1.pdf", type: "pdf", date: "05 Abr 2026", size: "1.2 MB", categoryId: 'informes' },
    { id: 4, name: "Receta_Neurologia.pdf", type: "pdf", date: "01 Abr 2026", size: "850 KB", categoryId: 'recetas' },
    { id: 5, name: "Valoracion_Inicial_Firmada.pdf", type: "pdf", date: "15 Ene 2026", size: "1.8 MB", categoryId: 'consentimientos' },
    { id: 6, name: "Sesion_Juego_Test.mp4", type: "img", date: "02 Mar 2026", size: "14.2 MB", categoryId: 'multimedia' },
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocs = Array.from(files).map(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const isImage = ['jpg','jpeg','png','gif','mp4','webp'].includes(ext);
      const sizeStr = file.size > 1_000_000
        ? `${(file.size / 1_000_000).toFixed(1)} MB`
        : `${Math.round(file.size / 1000)} KB`;

      const categoryId = isImage ? 'multimedia'
        : ext === 'pdf' ? 'informes'
        : 'estudios';

      return {
        id: Math.random(),
        name: file.name,
        type: isImage ? 'img' : 'pdf',
        date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
        size: sizeStr,
        categoryId
      };
    });

    setDocs(prev => [...newDocs, ...prev]);
    e.target.value = '';
  };

  const handleDelete = (id: number) => {
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  const filteredDocs = docs.filter(doc => {
    const matchesCategory = activeCategory === 'todos' || doc.categoryId === activeCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col animate-apple max-w-7xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.webp"
      />
      <header className="flex items-center justify-between mb-10 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-apple-text mb-0.5">Expediente Digital</h2>
          <p className="description-small font-bold text-apple-text-secondary uppercase tracking-widest">Almacenamiento seguro en la nube</p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="apple-button apple-button-primary flex items-center gap-2 px-6 py-2.5 text-[11px] uppercase tracking-widest font-bold"
        >
          <Upload className="w-4 h-4" strokeWidth={2} />
          Subir Archivo
        </button>
      </header>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Sidebar Categorías */}
        <div className="w-56 shrink-0 flex flex-col gap-1 overflow-y-auto no-scrollbar pb-10">
          <div className="text-[10px] font-bold tracking-widest text-apple-text-tertiary uppercase px-3 mb-2">Clasificación</div>
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group",
                  isActive 
                    ? "bg-apple-blue/10 text-apple-blue font-bold" 
                    : "text-apple-text-secondary hover:bg-apple-secondary hover:text-apple-text font-medium"
                )}
              >
                <cat.icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-apple-blue" : "text-apple-text-tertiary group-hover:text-apple-text-secondary")} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[12px] truncate">{cat.label}</span>
                {isActive && (
                  <span className="ml-auto text-[10px] tabular-nums font-bold text-apple-blue">
                    {cat.id === 'todos' ? docs.length : docs.filter(d => d.categoryId === cat.id).length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col gap-8 overflow-y-auto custom-scrollbar pb-20 pr-2">
          {/* Dropzone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="bg-apple-bg border-2 border-dashed border-apple-separator rounded-apple py-10 flex flex-col items-center justify-center text-center group bg-slate-50/10 hover:bg-apple-secondary hover:border-apple-blue/30 transition-all cursor-pointer shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-apple-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="w-16 h-16 bg-apple-bg border border-apple-separator rounded-2xl shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform relative z-10">
              <FileUp className="text-apple-blue w-7 h-7 group-hover:text-blue-600 transition-colors" strokeWidth={1.5} />
            </div>
            <h3 className="text-[15px] font-bold text-apple-text mb-1 relative z-10">Arrastra y suelta documentos aquí</h3>
            <p className="text-apple-text-tertiary text-[12px] font-medium mb-5 max-w-xs relative z-10">Clasificación automática habilitada. Soporta PDF, JPG, PNG y formatos DICOM.</p>
            <button 
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="apple-button bg-apple-secondary text-[10px] text-apple-text-secondary hover:text-apple-text px-6 py-2 uppercase tracking-widest relative z-10 border border-apple-separator"
            >
              Explorar Equipo
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
             <div className="text-[11px] font-bold tracking-widest uppercase text-apple-text-secondary flex items-center gap-2">
                <span>{CATEGORIES.find(c => c.id === activeCategory)?.label}</span>
                <span className="px-1.5 py-0.5 bg-apple-tertiary rounded text-apple-text-tertiary">{filteredDocs.length}</span>
             </div>
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-text-tertiary w-3.5 h-3.5" strokeWidth={2} />
               <input 
                  type="text" 
                  placeholder="Filtrar por nombre..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-apple-tertiary border border-apple-separator/50 rounded-full py-2 pl-9 pr-4 text-[12px] font-medium text-apple-text outline-none w-56 focus:bg-apple-bg focus:ring-1 focus:ring-apple-blue/30 transition-all placeholder:text-apple-text-tertiary" 
               />
             </div>
          </div>

          {filteredDocs.length === 0 ? (
             <div className="py-20 text-center text-apple-text-tertiary font-medium">No hay archivos en esta categoría.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDocs.map((doc) => (
                <DocumentCard key={doc.id} {...doc} onDelete={() => handleDelete(doc.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
