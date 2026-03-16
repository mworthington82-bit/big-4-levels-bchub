import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, Search, ArrowLeft, X, ExternalLink, Play, Download, Bookmark, BookmarkCheck } from 'lucide-react';
import { resources, searchResources, toolDisplayNames, Resource } from '@/data/resources';
import CheatSheetButton from '@/components/CheatSheetButton';
import bradfordLogo from '@/assets/bradford-college-logo.jpg';
import teamsLogo from '@/assets/teams-logo.png';
import canvaLogo from '@/assets/canva-logo.jpg';
import edpuzzleLogo from '@/assets/edpuzzle-logo.png';
import copilotLogo from '@/assets/copilot-logo.png';
import formsLogo from '@/assets/forms-logo.jpg';
import emblemExplorer from '@/assets/emblem-explorer.svg';
import emblemPractitioner from '@/assets/emblem-practitioner.svg';
import emblemLeader from '@/assets/emblem-leader.svg';

type ToolFilter = 'all' | 'teams' | 'forms' | 'canva' | 'edpuzzle' | 'copilot' | 'notebook' | 'immersive';
type LevelFilter = 'all' | 'explorer' | 'practitioner' | 'leader';

const toolLogos: Record<string, string> = {
  teams: teamsLogo,
  forms: formsLogo,
  canva: canvaLogo,
  edpuzzle: edpuzzleLogo,
  copilot: copilotLogo,
  notebook: teamsLogo,
  immersive: teamsLogo,
};

const toolBrandColors: Record<string, { header: string; text: string }> = {
  teams: { header: "bg-[#5B5FC7]", text: "text-white" },
  forms: { header: "bg-[#5B5FC7]", text: "text-white" },
  canva: { header: "bg-[#7D2AE8]", text: "text-white" },
  edpuzzle: { header: "bg-[#1DA1F2]", text: "text-white" },
  copilot: { header: "bg-[#0078D4]", text: "text-white" },
  notebook: { header: "bg-[#5B5FC7]", text: "text-white" },
  immersive: { header: "bg-accent", text: "text-accent-foreground" },
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'pdf': return { icon: '⬇️', label: 'Download', color: 'bg-green-100 text-green-800' };
    case 'video': return { icon: '🎬', label: 'Video', color: 'bg-red-100 text-red-800' };
    default: return { icon: '📄', label: 'Guide', color: 'bg-blue-100 text-blue-800' };
  }
};

const getActionButton = (resource: Resource) => {
  if (resource.pdfUrl) {
    return { label: 'Download PDF ⬇', url: resource.pdfUrl };
  }
  if (resource.type === 'video') {
    return { label: 'Watch Video ▶', url: resource.url };
  }
  return { label: 'Open Guide ↗', url: resource.url };
};

const Resources = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<ToolFilter>('all');
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>('all');
  const [filteredResources, setFilteredResources] = useState<Resource[]>(resources);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('bookmarked_resources');
    if (stored) setBookmarks(new Set(JSON.parse(stored)));
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    let result = resources;
    if (searchQuery.trim()) result = searchResources(searchQuery);
    if (selectedTool !== 'all') result = result.filter((r) => r.tool === selectedTool);
    if (selectedLevel !== 'all') result = result.filter((r) => r.level === selectedLevel || r.level === 'all');
    if (showBookmarksOnly) result = result.filter((r) => bookmarks.has(r.id));
    setFilteredResources(result);
  }, [searchQuery, selectedTool, selectedLevel, showBookmarksOnly, bookmarks]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) updated.delete(id); else updated.add(id);
      localStorage.setItem('bookmarked_resources', JSON.stringify([...updated]));
      return updated;
    });
  };

  const toolButtons = [
    { id: 'teams' as ToolFilter, name: 'MS Teams', logo: teamsLogo, color: '#5B5FC7' },
    { id: 'forms' as ToolFilter, name: 'MS Forms', logo: formsLogo, color: '#5B5FC7' },
    { id: 'canva' as ToolFilter, name: 'Canva', logo: canvaLogo, color: '#7D2AE8' },
    { id: 'edpuzzle' as ToolFilter, name: 'Edpuzzle', logo: edpuzzleLogo, color: '#1DA1F2' },
    { id: 'copilot' as ToolFilter, name: 'Copilot', logo: copilotLogo, color: '#0078D4' },
    { id: 'immersive' as ToolFilter, name: 'Immersive', logo: null, color: '#F5A623' },
  ];

  const levelButtons: { id: LevelFilter; name: string; icon: string | null; color: string; activeColor: string }[] = [
    { id: 'all' as LevelFilter, name: 'All Levels', icon: null, color: 'border-border', activeColor: 'border-accent bg-accent/10' },
    { id: 'explorer', name: 'Explorer', icon: emblemExplorer, color: 'border-border', activeColor: 'border-[#F5A623] bg-[#F5A623]/10' },
    { id: 'practitioner', name: 'Practitioner', icon: emblemPractitioner, color: 'border-border', activeColor: 'border-[#16a085] bg-[#16a085]/10' },
    { id: 'leader', name: 'Leader', icon: emblemLeader, color: 'border-border', activeColor: 'border-[#2E86DE] bg-[#2E86DE]/10' },
  ];

  const handleToolSelect = (tool: ToolFilter) => setSelectedTool(selectedTool === tool ? 'all' : tool);
  const clearFilters = () => { setSearchQuery(''); setSelectedTool('all'); setSelectedLevel('all'); };

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={bradfordLogo} alt="Bradford College logo" className="h-10 object-contain" />
              <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">Training Resources</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/')} className="border-border hover:bg-accent hover:text-accent-foreground">
              <Home className="mr-2 h-4 w-4" /> Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input type="text" placeholder="Search resources..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-10 py-6 text-lg border-border" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Tool Filter - Larger with logos */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6 max-w-5xl mx-auto">
          {toolButtons.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolSelect(tool.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                selectedTool === tool.id
                  ? 'shadow-md scale-105'
                  : 'border-border bg-card hover:shadow-sm'
              }`}
              style={selectedTool === tool.id ? { borderColor: tool.color, backgroundColor: `${tool.color}15` } : {}}
            >
              <div className="h-14 w-14 rounded-xl bg-white p-2 shadow-sm flex items-center justify-center">
                {tool.logo ? (
                  <img src={tool.logo} alt={tool.name} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-2xl">🌐</span>
                )}
              </div>
              <span className="text-sm font-semibold text-card-foreground">{tool.name}</span>
            </button>
          ))}
        </div>

        {/* Level Filter Row */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {levelButtons.map((level) => (
            <button
              key={level.id}
              onClick={() => setSelectedLevel(selectedLevel === level.id ? 'all' : level.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border-2 flex items-center gap-2 ${
                selectedLevel === level.id ? level.activeColor : level.color + ' bg-card hover:border-accent/50'
              }`}
            >
              {level.icon ? <img src={level.icon} alt={level.name} className="h-5 w-5" /> : <span>📚</span>}
              {level.name}
            </button>
          ))}
        </div>

        {/* Active Filters */}
        {(selectedTool !== 'all' || selectedLevel !== 'all' || searchQuery) && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedTool !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/20 rounded-full text-sm">
                {toolDisplayNames[selectedTool]}
                <button onClick={() => setSelectedTool('all')}><X className="h-3 w-3" /></button>
              </span>
            )}
            {selectedLevel !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full text-sm capitalize">
                {selectedLevel}
                <button onClick={() => setSelectedLevel('all')}><X className="h-3 w-3" /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-sm text-accent hover:underline ml-2">Clear all</button>
          </div>
        )}

        <p className="text-center text-muted-foreground mb-6">
          {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
        </p>

        {/* Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((resource, index) => {
            const brand = toolBrandColors[resource.tool] || toolBrandColors.immersive;
            const badge = getTypeBadge(resource.type);
            const action = getActionButton(resource);

            return (
              <div
                key={resource.id}
                className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-[var(--shadow-hover)] transition-all duration-300 overflow-hidden animate-fade-in flex flex-col"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Colored header strip */}
                <div className={`${brand.header} px-4 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-white/20 p-0.5 flex-shrink-0">
                      <img src={toolLogos[resource.tool] || teamsLogo} alt="" className="h-full w-full object-contain" />
                    </div>
                    <span className={`text-sm font-semibold ${brand.text}`}>{toolDisplayNames[resource.tool]}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.color}`}>
                    {badge.icon} {badge.label}
                  </span>
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display text-base font-bold text-foreground mb-2 line-clamp-2">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">{resource.description}</p>

                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{resource.function}</span>
                      {resource.level && resource.level !== 'all' && (
                        <span className={`text-xs px-2 py-1 rounded capitalize ${
                          resource.level === 'explorer' ? 'bg-[#F5A623]/20 text-[#B8860B]' :
                          resource.level === 'practitioner' ? 'bg-[#5B5FC7]/20 text-[#5B5FC7]' :
                          'bg-green-500/20 text-green-700'
                        }`}>
                          {resource.level}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {resource.pdfUrl && resource.type === 'link' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full px-3 text-xs font-semibold border-primary/30 hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(resource.pdfUrl, '_blank');
                          }}
                        >
                          <Download className="h-3 w-3 mr-1" /> PDF
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 text-xs font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(resource.pdfUrl && resource.type !== 'link' ? resource.pdfUrl : resource.url, '_blank');
                        }}
                      >
                        {resource.type === 'video' ? 'Watch Video ▶' : resource.type === 'pdf' ? 'Download PDF ⬇' : 'Open Guide ↗'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">No resources found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
            <Button onClick={clearFilters} variant="outline">Clear filters</Button>
          </div>
        )}

        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => navigate(-1)} className="border-border hover:bg-accent hover:text-accent-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Resources;
