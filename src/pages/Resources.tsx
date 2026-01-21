import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, Search, Play, FileText, ExternalLink, ArrowLeft, X, Download } from 'lucide-react';
import { resources, searchResources, toolDisplayNames, Resource } from '@/data/resources';
import bradfordLogo from '@/assets/bradford-college-logo.jpg';
import teamsLogo from '@/assets/teams-logo.png';
import canvaLogo from '@/assets/canva-logo.jpg';
import edpuzzleLogo from '@/assets/edpuzzle-logo.png';
import copilotLogo from '@/assets/copilot-logo.png';
import formsLogo from '@/assets/forms-logo.jpg';

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

const toolColors: Record<string, string> = {
  teams: 'bg-tool-teams/10 border-tool-teams/30 hover:bg-tool-teams/20',
  forms: 'bg-tool-teams/10 border-tool-teams/30 hover:bg-tool-teams/20',
  canva: 'bg-tool-canva/10 border-tool-canva/30 hover:bg-tool-canva/20',
  edpuzzle: 'bg-tool-edpuzzle/10 border-tool-edpuzzle/30 hover:bg-tool-edpuzzle/20',
  copilot: 'bg-tool-copilot/10 border-tool-copilot/30 hover:bg-tool-copilot/20',
  notebook: 'bg-tool-teams/10 border-tool-teams/30 hover:bg-tool-teams/20',
  immersive: 'bg-accent/10 border-accent/30 hover:bg-accent/20',
};

const Resources = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<ToolFilter>('all');
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>('all');
  const [filteredResources, setFilteredResources] = useState<Resource[]>(resources);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let result = resources;

    if (searchQuery.trim()) {
      result = searchResources(searchQuery);
    }

    if (selectedTool !== 'all') {
      result = result.filter((r) => r.tool === selectedTool);
    }

    if (selectedLevel !== 'all') {
      result = result.filter((r) => r.level === selectedLevel || r.level === 'all');
    }

    setFilteredResources(result);
  }, [searchQuery, selectedTool, selectedLevel]);

  const toolButtons = [
    { id: 'teams' as ToolFilter, name: 'MS Teams', logo: teamsLogo },
    { id: 'forms' as ToolFilter, name: 'MS Forms', logo: formsLogo },
    { id: 'canva' as ToolFilter, name: 'Canva', logo: canvaLogo },
    { id: 'edpuzzle' as ToolFilter, name: 'Edpuzzle', logo: edpuzzleLogo },
    { id: 'copilot' as ToolFilter, name: 'Copilot', logo: copilotLogo },
  ];

  const handleToolSelect = (tool: ToolFilter) => {
    setSelectedTool(selectedTool === tool ? 'all' : tool);
  };

  const handleLevelSelect = (level: LevelFilter) => {
    setSelectedLevel(selectedLevel === level ? 'all' : level);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTool('all');
    setSelectedLevel('all');
  };

  const levelButtons: { id: LevelFilter; name: string; color: string }[] = [
    { id: 'explorer', name: 'Explorer', color: 'border-green-500 bg-green-500/10' },
    { id: 'practitioner', name: 'Practitioner', color: 'border-blue-500 bg-blue-500/10' },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={bradfordLogo}
                alt="Bradford College logo"
                className="h-10 object-contain"
              />
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Training Resources
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-border hover:bg-accent hover:text-accent-foreground"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search resources by title, description, or function..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 py-6 text-lg border-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Tool Filter Boxes */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 max-w-4xl mx-auto">
          {toolButtons.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolSelect(tool.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                selectedTool === tool.id
                  ? 'border-accent bg-accent/10 shadow-md'
                  : 'border-border bg-card hover:border-accent/50 hover:shadow-sm'
              }`}
            >
              <div className="h-12 w-12 rounded-lg bg-white p-2 shadow-sm">
                <img
                  src={tool.logo}
                  alt={tool.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-sm font-medium text-card-foreground">{tool.name}</span>
            </button>
          ))}
        </div>

        {/* Level Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className="text-sm text-muted-foreground self-center mr-2">Filter by level:</span>
          {levelButtons.map((level) => (
            <button
              key={level.id}
              onClick={() => handleLevelSelect(level.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border-2 ${
                selectedLevel === level.id
                  ? `${level.color} shadow-md`
                  : 'border-border bg-card hover:border-accent/50'
              }`}
            >
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
                <button onClick={() => setSelectedTool('all')}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedLevel !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 rounded-full text-sm capitalize">
                {selectedLevel}
                <button onClick={() => setSelectedLevel('all')}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full text-sm">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-accent hover:underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results Count */}
        <p className="text-center text-muted-foreground mb-6">
          {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
        </p>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource, index) => (
            <Card
              key={resource.id}
              className={`group transition-all duration-300 hover:shadow-lg border-2 ${
                toolColors[resource.tool] || 'border-border'
              } animate-fade-in`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded bg-white p-1 shadow-sm flex-shrink-0">
                      <img
                        src={toolLogos[resource.tool] || teamsLogo}
                        alt={toolDisplayNames[resource.tool]}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {toolDisplayNames[resource.tool]}
                    </span>
                  </div>
                  {(resource.type === 'video' || resource.type === 'link') ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(resource.url, '_blank');
                      }}
                      className="p-1.5 rounded-full bg-accent/10 hover:bg-accent/20 transition-colors"
                      title={resource.type === 'video' ? 'Play video' : 'Open link'}
                    >
                      <Play className="h-4 w-4 text-accent" />
                    </button>
                  ) : (
                    <FileText className="h-4 w-4 text-accent" />
                  )}
                </div>
                <CardTitle className="text-base mt-2 line-clamp-2">{resource.title}</CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {resource.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {resource.function}
                    </span>
                    {resource.level && resource.level !== 'all' && (
                      <span className={`text-xs px-2 py-1 rounded capitalize ${
                        resource.level === 'explorer' ? 'bg-green-500/20 text-green-700' :
                        resource.level === 'practitioner' ? 'bg-blue-500/20 text-blue-700' :
                        'bg-purple-500/20 text-purple-700'
                      }`}>
                        {resource.level}
                      </span>
                    )}
                  </div>
                  {resource.pdfUrl ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-accent hover:text-accent-foreground hover:bg-accent"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(resource.pdfUrl, '_blank');
                      }}
                    >
                      Open
                      <Download className="ml-1 h-3 w-3" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-accent hover:text-accent-foreground hover:bg-accent"
                      onClick={() => window.open(resource.url, '_blank')}
                    >
                      Open
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No resources found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear filters
            </Button>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-border hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Resources;
